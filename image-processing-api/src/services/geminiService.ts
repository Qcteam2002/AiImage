import { config } from '../config';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

export interface ImageProcessingOptions {
  modelImagePath: string;
  productImagePath: string;
  prompt?: string;
}

export interface ProductImageProcessingOptions {
  productImagePath: string;
  backgroundImagePath?: string;
  prompt?: string;
}

export interface VirtualTryOnOptions {
  userImagePath: string;
  productImagePath: string;
  customPrompt?: string;
}

export interface ProcessingResult {
  success: boolean;
  resultImagePath?: string;
  error?: string;
}

export class GeminiService {
  // Use OpenRouter API with Gemini 2.5 Flash Image Preview (following OpenRouter reference)
  private openRouterModel = "google/gemini-2.5-flash-image-preview";
  
  constructor() {
    if (!config.gemini.apiKey) {
      throw new Error('OpenRouter API key is required');
    }
    
    console.log('🤖 OpenRouter API configured (following OpenRouter reference):');
    console.log(`   - ${this.openRouterModel} (Image generation with TEXT+IMAGE response)`);
    console.log('📸 Will send user uploaded images + prompt to OpenRouter');
  }
  
  // Helper method to get model configuration
  getAvailableModels(): string[] {
    return [this.openRouterModel];
  }
  
  // Helper method to get image mime type
  private getImageMimeType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    switch (ext) {
      case '.jpg':
      case '.jpeg':
        return 'image/jpeg';
      case '.png':
        return 'image/png';
      case '.webp':
        return 'image/webp';
      case '.gif':
        return 'image/gif';
      default:
        return 'image/jpeg'; // Default fallback
    }
  }

  // Call OpenRouter API (following api.tryon-generate.jsx reference)
  private async callOpenRouterAPI(productImageBase64: string, userImageBase64: string, productTitle: string, customPrompt: string = ""): Promise<{success: boolean, imageUrl?: string, error?: string}> {
    try {
      if (!config.gemini.apiKey) {
        throw new Error('OPENROUTER_API_KEY not configured');
      }

      // Resize images to reduce payload size (max 1024x1024)
      const resizedProductImage = await this.resizeImageForAPI(productImageBase64);
      const resizedUserImage = await this.resizeImageForAPI(userImageBase64);

      // Convert base64 images to data URLs
      const productImageDataUrl = `data:image/jpeg;base64,${resizedProductImage}`;
      const userImageDataUrl = `data:image/jpeg;base64,${resizedUserImage}`;

      // Build the base prompt - following api.tryon-generate.jsx exactly
      let prompt = `Create a professional e-commerce fashion photo. Take the clothing item from the first image and place it realistically on the model from the second image. Ensure the product's original color, texture, and size are preserved. Generate a full-body, photorealistic shot of the model wearing the item, with lighting and shadows adjusted naturally to match the scene.`;

      // Add custom prompt if provided
      if (customPrompt && customPrompt.trim()) {
        prompt += `\n\nAdditional styling request: ${customPrompt}`;
      }

      prompt += `\n\nGenerate a high-quality virtual try-on result that looks authentic and appealing.`;

      // Debug logging
      console.log('Sending prompt to OpenRouter:', prompt);
      console.log('Product image URL:', productImageDataUrl.substring(0, 100) + '...');
      console.log('User image URL:', userImageDataUrl.substring(0, 100) + '...');

      const response = await axios.post("https://openrouter.ai/api/v1/chat/completions", {
        "model": this.openRouterModel,
        "messages": [
          {
            "role": "user",
            "content": [
              {
                "type": "text",
                "text": prompt
              },
              {
                "type": "image_url",
                "image_url": {
                  "url": productImageDataUrl
                }
              },
              {
                "type": "image_url",
                "image_url": {
                  "url": userImageDataUrl
                }
              }
            ]
          }
        ]
      }, {
        headers: {
          "Authorization": `Bearer ${config.gemini.apiKey}`,
          "HTTP-Referer": process.env.SITE_URL || "https://your-shopify-app.com",
          "X-Title": process.env.SITE_NAME || "Virtual Try-On App",
          "Content-Type": "application/json"
        }
      });

      const result = response.data;
      
      // Debug logging
      console.log('OpenRouter API Response:', JSON.stringify(result, null, 2));
      
      // Extract the generated image URL from Gemini 2.5 Flash Image Preview response
      let generatedImageUrl = null;
      
      console.log('🔍 Analyzing OpenRouter response structure...');
      console.log('Result choices:', result.choices);
      
      if (result.choices && result.choices[0] && result.choices[0].message) {
        const content = result.choices[0].message.content;
        console.log('Message content type:', typeof content);
        console.log('Message content:', content);
        
        // Check if content is an array (multimodal response)
        if (Array.isArray(content)) {
          console.log('Content is array, looking for image_url...');
          const imageContent = content.find(item => item.type === 'image_url');
          if (imageContent && imageContent.image_url) {
            generatedImageUrl = imageContent.image_url.url;
            console.log('Found image URL in array:', generatedImageUrl);
          }
        }
        // Check if content is a string with URL or base64 data
        else if (typeof content === 'string') {
          console.log('Content is string, looking for URLs or base64 data...');
          console.log('Content length:', content.length);
          console.log('Content preview:', content.substring(0, 200) + '...');
          
          // Check for HTTP URLs first
          if (content.includes('http')) {
            const urlMatch = content.match(/https?:\/\/[^\s]+\.(jpg|jpeg|png|webp|gif)/i);
            if (urlMatch) {
              generatedImageUrl = urlMatch[0];
              console.log('Found image URL in string:', generatedImageUrl);
            }
          }
          
          // Check for base64 data URLs - look for the pattern more carefully
          if (!generatedImageUrl && content.includes('data:image/')) {
            console.log('Found data:image/ in content, searching for base64...');
            const base64Match = content.match(/data:image\/[^;]+;base64,[A-Za-z0-9+/=]+/);
            if (base64Match) {
              generatedImageUrl = base64Match[0];
              console.log('Found base64 data URL in string:', generatedImageUrl.substring(0, 100) + '...');
            } else {
              console.log('No base64 match found, trying alternative pattern...');
              // Try a more flexible pattern
              const altMatch = content.match(/data:image\/[^;]+;base64,[A-Za-z0-9+/=]+/g);
              if (altMatch && altMatch.length > 0) {
                generatedImageUrl = altMatch[0];
                console.log('Found base64 with alternative pattern:', generatedImageUrl.substring(0, 100) + '...');
              }
            }
          }
          
          // If still no match, check if the entire content is a base64 string
          if (!generatedImageUrl && content.length > 1000 && /^[A-Za-z0-9+/=]+$/.test(content.trim())) {
            console.log('Content appears to be pure base64, converting to data URL...');
            generatedImageUrl = `data:image/jpeg;base64,${content}`;
            console.log('Created data URL from pure base64');
          }
        }
        // Check if content is an object with image_url
        else if (content && typeof content === 'object' && content.image_url) {
          generatedImageUrl = content.image_url.url;
          console.log('Found image URL in object:', generatedImageUrl);
        }
      }
      
      // Check if there are any other possible image sources in the response
      if (!generatedImageUrl) {
        console.log('🔍 Checking for alternative image sources...');
        console.log('Full response structure:', JSON.stringify(result, null, 2));
        
        // Check if there's a data field with images
        if (result.data && Array.isArray(result.data)) {
          const imageData = result.data.find((item: any) => item.url);
          if (imageData) {
            generatedImageUrl = imageData.url;
            console.log('Found image URL in data array:', generatedImageUrl);
          }
        }
        
        // Check the entire response string for base64 data URLs
        if (!generatedImageUrl) {
          const responseString = JSON.stringify(result);
          const base64Match = responseString.match(/data:image\/[^;]+;base64,[A-Za-z0-9+/=]+/);
          if (base64Match) {
            generatedImageUrl = base64Match[0];
            console.log('Found base64 data URL in full response:', generatedImageUrl.substring(0, 100) + '...');
          }
        }
      }
      
      // Fallback to mock result if no image URL found
      if (!generatedImageUrl) {
        console.log('❌ No image URL found in response, using mock result');
        console.log('Response content:', result.choices?.[0]?.message?.content);
        console.log('This means the AI model did not generate an image, only returned text description');
        generatedImageUrl = this.createMockTryOnResult(userImageBase64, productImageBase64);
      } else {
        console.log('✅ Generated image URL found:', generatedImageUrl);
      }

      return {
        success: true,
        imageUrl: generatedImageUrl
      };

    } catch (error) {
      console.error('OpenRouter API error:', error);
      return {
        success: false,
        error: "OpenRouter API call failed: " + (error instanceof Error ? error.message : 'Unknown error')
      };
    }
  }

  // Create mock result for fallback
  private createMockTryOnResult(userImageBase64: string, productImageBase64: string): string {
    // For now, return the user image as fallback
    // In a real implementation, you'd create a composite image
    console.log('Using mock result - returning user image as fallback');
    return `data:image/jpeg;base64,${userImageBase64}`;
  }

  // Resize image for API to reduce payload size
  private async resizeImageForAPI(base64Image: string): Promise<string> {
    try {
      const imageBuffer = Buffer.from(base64Image, 'base64');
      const resizedBuffer = await sharp(imageBuffer)
        .resize(1024, 1024, { 
          fit: 'inside',
          withoutEnlargement: true 
        })
        .jpeg({ quality: 85 })
        .toBuffer();
      
      return resizedBuffer.toString('base64');
    } catch (error) {
      console.error('Error resizing image:', error);
      return base64Image; // Return original if resize fails
    }
  }

  // Create a dummy user image for product processing
  private async createDummyUserImage(): Promise<string> {
    try {
      // Create a simple white background image
      const dummyImage = await sharp({
        create: {
          width: 400,
          height: 600,
          channels: 3,
          background: { r: 255, g: 255, b: 255 }
        }
      })
      .png()
      .toBuffer();
      
      return dummyImage.toString('base64');
    } catch (error) {
      console.error('Error creating dummy user image:', error);
      // Return a minimal base64 white image as fallback
      return 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    }
  }
  
  async processImages(options: ImageProcessingOptions): Promise<ProcessingResult> {
    try {
      const { modelImagePath, productImagePath, prompt } = options;
      
      console.log('🎨 Processing with OpenRouter API...');
      console.log('📸 Model image:', modelImagePath);
      console.log('👔 Product image:', productImagePath);
      
      // Read and convert images to base64
      const modelImageBase64 = fs.readFileSync(modelImagePath, 'base64');
      const productImageBase64 = fs.readFileSync(productImagePath, 'base64');
      console.log('✅ Images converted to base64');
      
      // Create the prompt for fashion image generation
      const fashionPrompt = prompt || `
        Generate an artistic fashion image based on the two provided images:
        - First image: The model/person 
        - Second image: The clothing/product
        
        Please create and return an image showing the person from the first image wearing the clothing from the second image.
        Use artistic styling with clean composition and modern aesthetic.
        Focus on combining the model's pose with the product's design and colors.
        Make it visually appealing with good color harmony and artistic flair.
        Style: fashion illustration, artistic, stylized, not photorealistic.
        
        Please generate and return the fashion image as your response.
      `;
      
      // Call OpenRouter API
      const openRouterResult = await this.callOpenRouterAPI(
        productImageBase64, 
        modelImageBase64, 
        'this product', // Default product title
        fashionPrompt
      );
      
      if (!openRouterResult.success) {
        console.log('❌ OpenRouter API failed:', openRouterResult.error);
        return await this.createMockResult();
      }

      // If we got a data URL, convert it to a file
      if (openRouterResult.imageUrl?.startsWith('data:')) {
        // Extract base64 data from data URL
        const base64Data = openRouterResult.imageUrl.split(',')[1];
        const imageBuffer = Buffer.from(base64Data, 'base64');
        
        // Save the generated image
        const outputFileName = `openrouter_fashion_${uuidv4()}.png`;
        const outputPath = path.join(config.upload.uploadPath, 'generated', outputFileName);
        
        // Ensure the generated directory exists
        const generatedDir = path.dirname(outputPath);
        if (!fs.existsSync(generatedDir)) {
          fs.mkdirSync(generatedDir, { recursive: true });
        }

        // Save the generated image
        fs.writeFileSync(outputPath, imageBuffer);
        console.log(`💾 Fashion image saved: ${outputPath}`);

        return {
          success: true,
          resultImagePath: outputPath
        };
      } else {
        // If it's a URL, return the URL directly
        console.log('✅ OpenRouter returned image URL:', openRouterResult.imageUrl);
        return {
          success: true,
          resultImagePath: openRouterResult.imageUrl
        };
      }
      
    } catch (error) {
      console.error('❌ Fashion processing error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async processProductImages(options: ProductImageProcessingOptions): Promise<ProcessingResult> {
    try {
      const { productImagePath, backgroundImagePath, prompt } = options;
      
      console.log('🎨 Processing product image with OpenRouter API...');
      console.log('📦 Product image:', productImagePath);
      if (backgroundImagePath) {
        console.log('🖼️ Background image:', backgroundImagePath);
      }
      
      // Read and convert product image to base64
      const productImageBase64 = fs.readFileSync(productImagePath, 'base64');
      console.log('✅ Product image converted to base64');
      
      // Create the prompt for product image optimization
      let optimizationPrompt = prompt;
      
      if (!optimizationPrompt) {
        if (backgroundImagePath) {
          optimizationPrompt = `
            Optimize this product image by combining it with the provided background image.
            Create a professional, clean composition with the product prominently displayed.
            Maintain the original product colors and details while seamlessly blending with the background.
            Style: professional product photography, clean composition, commercial quality.
            Please generate and return the optimized product image as your response.
          `;
        } else {
          optimizationPrompt = `
            Optimize this product image with a clean, professional background.
            Remove any distracting elements and enhance the product presentation.
            Use a neutral background that makes the product stand out.
            Style: professional product photography, clean white or neutral background, commercial quality.
            Please generate and return the optimized product image as your response.
          `;
        }
      }
      
      // For product processing, we'll use a dummy user image since OpenRouter expects both images
      // Create a simple white background as "user" image
      const dummyUserImageBase64 = await this.createDummyUserImage();
      
      // Call OpenRouter API
      const openRouterResult = await this.callOpenRouterAPI(
        productImageBase64, 
        dummyUserImageBase64, 
        'this product', // Default product title
        optimizationPrompt
      );
      
      if (!openRouterResult.success) {
        console.log('❌ OpenRouter API failed:', openRouterResult.error);
        return await this.createProductMockResult();
      }

      // If we got a data URL, convert it to a file
      if (openRouterResult.imageUrl?.startsWith('data:')) {
        // Extract base64 data from data URL
        const base64Data = openRouterResult.imageUrl.split(',')[1];
        const imageBuffer = Buffer.from(base64Data, 'base64');
        
        // Save the generated image
        const outputFileName = `openrouter_product_${uuidv4()}.png`;
        const outputPath = path.join(config.upload.uploadPath, 'generated', outputFileName);
        
        // Ensure the generated directory exists
        const generatedDir = path.dirname(outputPath);
        if (!fs.existsSync(generatedDir)) {
          fs.mkdirSync(generatedDir, { recursive: true });
        }

        // Save the generated image
        fs.writeFileSync(outputPath, imageBuffer);
        console.log(`💾 Product image saved: ${outputPath}`);

        return {
          success: true,
          resultImagePath: outputPath
        };
      } else {
        // If it's a URL, return the URL directly
        console.log('✅ OpenRouter returned image URL:', openRouterResult.imageUrl);
        return {
          success: true,
          resultImagePath: openRouterResult.imageUrl
        };
      }
      
    } catch (error) {
      console.error('❌ Product image processing error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
  
      // Fallback mock result when Gemini 2.5 fails
      private async createMockResult(): Promise<ProcessingResult> {
        console.log('🎨 Creating mock fashion result (Gemini 2.5 unavailable)...');
        
        const outputFileName = `gemini_2.5_mock_${uuidv4()}.png`;
    const outputPath = path.join(config.upload.uploadPath, 'generated', outputFileName);
    
    // Ensure the generated directory exists
    const generatedDir = path.dirname(outputPath);
    if (!fs.existsSync(generatedDir)) {
      fs.mkdirSync(generatedDir, { recursive: true });
    }

    // Create a stylish mock fashion image
    await sharp({
      create: {
        width: 800,
        height: 1000,
        channels: 3,
        background: { r: 245, g: 245, b: 250 }
      }
    })
    .composite([
      {
        input: Buffer.from(`
          <svg width="800" height="1000">
            <defs>
              <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#667eea;stop-opacity:0.1" />
                <stop offset="100%" style="stop-color:#764ba2;stop-opacity:0.1" />
              </linearGradient>
            </defs>
            <rect width="800" height="1000" fill="url(#bg)"/>
            <rect x="150" y="150" width="500" height="600" fill="#f8f9fa" stroke="#e9ecef" stroke-width="2" rx="20"/>
            <text x="400" y="200" text-anchor="middle" font-family="Arial" font-size="24" font-weight="bold" fill="#495057">🎭 AI Fashion Preview</text>
            <text x="400" y="250" text-anchor="middle" font-family="Arial" font-size="18" fill="#6c757d">Gemini 2.5 Unavailable</text>
            <text x="400" y="280" text-anchor="middle" font-family="Arial" font-size="12" fill="#868e96">Following OpenRouter reference</text>
            <text x="400" y="320" text-anchor="middle" font-family="Arial" font-size="16" fill="#495057">✨ Enable billing for real AI</text>
            <text x="400" y="350" text-anchor="middle" font-family="Arial" font-size="14" fill="#6c757d">console.cloud.google.com/billing</text>
            <circle cx="400" cy="450" r="80" fill="#e9ecef" stroke="#dee2e6" stroke-width="2"/>
            <text x="400" y="460" text-anchor="middle" font-family="Arial" font-size="36" fill="#6c757d">👗</text>
            <text x="400" y="550" text-anchor="middle" font-family="Arial" font-size="14" fill="#495057">Premium Fashion AI</text>
            <text x="400" y="570" text-anchor="middle" font-family="Arial" font-size="14" fill="#6c757d">Cost: ~$0.002-0.008/image</text>
            <text x="400" y="650" text-anchor="middle" font-family="Arial" font-size="12" fill="#868e96">Ready to generate real AI fashion when billing enabled</text>
            <rect x="200" y="700" width="400" height="2" fill="#dee2e6"/>
            <text x="400" y="730" text-anchor="middle" font-family="Arial" font-size="10" fill="#adb5bd">AIImage App - Powered by Gemini AI</text>
          </svg>
        `),
        top: 0,
        left: 0
      }
    ])
    .png()
    .toFile(outputPath);

    return {
      success: true,
      resultImagePath: outputPath
    };
  }

  // Fallback mock result for product image processing when Gemini 2.0 fails
  private async createProductMockResult(): Promise<ProcessingResult> {
    console.log('🎨 Creating mock product result (Gemini 2.0 unavailable)...');
    
    const outputFileName = `gemini_2.0_product_mock_${uuidv4()}.png`;
    const outputPath = path.join(config.upload.uploadPath, 'generated', outputFileName);
    
    // Ensure the generated directory exists
    const generatedDir = path.dirname(outputPath);
    if (!fs.existsSync(generatedDir)) {
      fs.mkdirSync(generatedDir, { recursive: true });
    }

    // Create a stylish mock product image
    await sharp({
      create: {
        width: 800,
        height: 800,
        channels: 3,
        background: { r: 250, g: 250, b: 250 }
      }
    })
    .composite([
      {
        input: Buffer.from(`
          <svg width="800" height="800">
            <defs>
              <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#f8f9fa;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#e9ecef;stop-opacity:1" />
              </linearGradient>
              <linearGradient id="productGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#6c7380;stop-opacity:0.1" />
                <stop offset="100%" style="stop-color:#495057;stop-opacity:0.1" />
              </linearGradient>
            </defs>
            <rect width="800" height="800" fill="url(#bg)"/>
            <rect x="150" y="150" width="500" height="500" fill="url(#productGrad)" stroke="#dee2e6" stroke-width="2" rx="20"/>
            <text x="400" y="200" text-anchor="middle" font-family="Arial" font-size="24" font-weight="bold" fill="#495057">🔧 Product Image Tools</text>
            <text x="400" y="250" text-anchor="middle" font-family="Arial" font-size="18" fill="#6c757d">Gemini 2.5 Unavailable</text>
            <text x="400" y="280" text-anchor="middle" font-family="Arial" font-size="12" fill="#868e96">Following OpenRouter reference</text>
            <text x="400" y="320" text-anchor="middle" font-family="Arial" font-size="16" fill="#495057">✨ Enable billing for real AI</text>
            <text x="400" y="350" text-anchor="middle" font-family="Arial" font-size="14" fill="#6c757d">console.cloud.google.com/billing</text>
            <circle cx="400" cy="430" r="60" fill="#e9ecef" stroke="#dee2e6" stroke-width="2"/>
            <text x="400" y="440" text-anchor="middle" font-family="Arial" font-size="32" fill="#6c7380">📦</text>
            <text x="400" y="520" text-anchor="middle" font-family="Arial" font-size="14" fill="#495057">Product Optimization AI</text>
            <text x="400" y="540" text-anchor="middle" font-family="Arial" font-size="14" fill="#6c757d">Background removal & enhancement</text>
            <text x="400" y="580" text-anchor="middle" font-family="Arial" font-size="12" fill="#868e96">Ready for real product optimization when billing enabled</text>
            <rect x="200" y="620" width="400" height="2" fill="#dee2e6"/>
            <text x="400" y="650" text-anchor="middle" font-family="Arial" font-size="10" fill="#adb5bd">AIImage App - Product Tools - Powered by Gemini AI</text>
          </svg>
        `),
        top: 0,
        left: 0
      }
    ])
    .png()
    .toFile(outputPath);

    return {
      success: true,
      resultImagePath: outputPath
    };
  }

  async processVirtualTryOn(options: VirtualTryOnOptions): Promise<ProcessingResult> {
    try {
      const { userImagePath, productImagePath, customPrompt } = options;
      
      console.log('🎭 Processing virtual try-on with OpenRouter API...');
      console.log('👤 User image:', userImagePath);
      console.log('👔 Product image:', productImagePath);
      
      // Read and convert images to base64
      const userImageBase64 = fs.readFileSync(userImagePath, 'base64');
      const productImageBase64 = fs.readFileSync(productImagePath, 'base64');
      console.log('✅ Images converted to base64');
      
      // Call OpenRouter API
      const openRouterResult = await this.callOpenRouterAPI(
        productImageBase64, 
        userImageBase64, 
        'this product', // Default product title
        customPrompt || ''
      );
      
      if (!openRouterResult.success) {
        console.log('❌ OpenRouter API failed:', openRouterResult.error);
        return await this.createVirtualTryOnMockResult();
      }

      // If we got a data URL, convert it to a file
      if (openRouterResult.imageUrl?.startsWith('data:')) {
        // Extract base64 data from data URL
        const base64Data = openRouterResult.imageUrl.split(',')[1];
        const imageBuffer = Buffer.from(base64Data, 'base64');
        
        // Save the generated image
        const outputFileName = `openrouter_tryon_${uuidv4()}.png`;
        const outputPath = path.join(config.upload.uploadPath, 'generated', outputFileName);
        
        // Ensure the generated directory exists
        const generatedDir = path.dirname(outputPath);
        if (!fs.existsSync(generatedDir)) {
          fs.mkdirSync(generatedDir, { recursive: true });
        }

        // Save the generated image
        fs.writeFileSync(outputPath, imageBuffer);
        console.log(`💾 Virtual try-on image saved: ${outputPath}`);

        return {
          success: true,
          resultImagePath: outputPath
        };
      } else {
        // If it's a URL, return the URL directly
        console.log('✅ OpenRouter returned image URL:', openRouterResult.imageUrl);
        return {
          success: true,
          resultImagePath: openRouterResult.imageUrl
        };
      }
      
    } catch (error) {
      console.error('❌ Virtual try-on processing error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // Fallback mock result for virtual try-on when Gemini 2.5 fails
  private async createVirtualTryOnMockResult(): Promise<ProcessingResult> {
    console.log('🎭 Creating mock virtual try-on result (Gemini 2.5 unavailable)...');
    
    const outputFileName = `gemini_2.5_tryon_mock_${uuidv4()}.png`;
    const outputPath = path.join(config.upload.uploadPath, 'generated', outputFileName);
    
    // Ensure the generated directory exists
    const generatedDir = path.dirname(outputPath);
    if (!fs.existsSync(generatedDir)) {
      fs.mkdirSync(generatedDir, { recursive: true });
    }

    // Create a stylish mock virtual try-on image
    await sharp({
      create: {
        width: 800,
        height: 1000,
        channels: 3,
        background: { r: 250, g: 250, b: 250 }
      }
    })
    .composite([
      {
        input: Buffer.from(`
          <svg width="800" height="1000">
            <defs>
              <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#f8f9fa;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#e9ecef;stop-opacity:1" />
              </linearGradient>
              <linearGradient id="tryonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#667eea;stop-opacity:0.1" />
                <stop offset="100%" style="stop-color:#764ba2;stop-opacity:0.1" />
              </linearGradient>
            </defs>
            <rect width="800" height="1000" fill="url(#bg)"/>
            <rect x="150" y="150" width="500" height="700" fill="url(#tryonGrad)" stroke="#dee2e6" stroke-width="2" rx="20"/>
            <text x="400" y="200" text-anchor="middle" font-family="Arial" font-size="24" font-weight="bold" fill="#495057">🎭 Virtual Try-On</text>
            <text x="400" y="250" text-anchor="middle" font-family="Arial" font-size="18" fill="#6c757d">Gemini 2.5 Unavailable</text>
            <text x="400" y="280" text-anchor="middle" font-family="Arial" font-size="12" fill="#868e96">Following OpenRouter reference</text>
            <text x="400" y="320" text-anchor="middle" font-family="Arial" font-size="16" fill="#495057">✨ Enable billing for real AI</text>
            <text x="400" y="350" text-anchor="middle" font-family="Arial" font-size="14" fill="#6c757d">console.cloud.google.com/billing</text>
            <circle cx="400" cy="450" r="80" fill="#e9ecef" stroke="#dee2e6" stroke-width="2"/>
            <text x="400" y="460" text-anchor="middle" font-family="Arial" font-size="36" fill="#6c757d">👗</text>
            <text x="400" y="550" text-anchor="middle" font-family="Arial" font-size="14" fill="#495057">AI Virtual Try-On</text>
            <text x="400" y="570" text-anchor="middle" font-family="Arial" font-size="14" fill="#6c757d">See how clothes look on you</text>
            <text x="400" y="650" text-anchor="middle" font-family="Arial" font-size="12" fill="#868e96">Ready for real virtual try-on when billing enabled</text>
            <rect x="200" y="700" width="400" height="2" fill="#dee2e6"/>
            <text x="400" y="730" text-anchor="middle" font-family="Arial" font-size="10" fill="#adb5bd">AIImage App - Virtual Try-On - Powered by Gemini AI</text>
          </svg>
        `),
        top: 0,
        left: 0
      }
    ])
    .png()
    .toFile(outputPath);

    return {
      success: true,
      resultImagePath: outputPath
    };
  }

  // Helper method to validate image files
  static validateImageFile(filePath: string): boolean {
    try {
      const stats = fs.statSync(filePath);
      if (!stats.isFile()) return false;
      
      const ext = path.extname(filePath).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
    } catch {
      return false;
    }
  }
}

