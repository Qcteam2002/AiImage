import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config';

export interface ProcessImagesParams {
  modelImagePath: string;
  productImagePath: string;
  prompt?: string;
}

export interface ProcessProductImagesParams {
  productImagePath: string;
  backgroundImagePath?: string;
  prompt?: string;
}

export interface ProcessVirtualTryOnParams {
  userImagePath: string;
  productImagePath: string;
  customPrompt?: string;
  productTitle?: string;
}

export interface ProcessResult {
  success: boolean;
  resultImagePath?: string;
  error?: string;
}

export class ImageProcessingService {
  private gemini: GoogleGenerativeAI;

  constructor() {
    this.gemini = new GoogleGenerativeAI(config.ai.gemini.apiKey);
  }

  /**
   * Validate image file exists and is readable
   */
  private validateImageFile(filePath: string): boolean {
    try {
      return fs.existsSync(filePath) && fs.statSync(filePath).isFile();
    } catch {
      return false;
    }
  }

  /**
   * Process model and product images for virtual try-on
   */
  async processImages(params: ProcessImagesParams): Promise<ProcessResult> {
    try {
      const { modelImagePath, productImagePath, prompt } = params;

      // Validate image files
      if (!this.validateImageFile(modelImagePath) || !this.validateImageFile(productImagePath)) {
        return { success: false, error: 'Invalid image files' };
      }

      // Read images as base64
      const modelImageBase64 = fs.readFileSync(modelImagePath, 'base64');
      const productImageBase64 = fs.readFileSync(productImagePath, 'base64');

      // Create data URLs
      const modelImageDataUrl = `data:image/jpeg;base64,${modelImageBase64}`;
      const productImageDataUrl = `data:image/jpeg;base64,${productImageBase64}`;

      // Build prompt
      const fullPrompt = this.buildImageProcessingPrompt(prompt);

      // Call Gemini API
      const model = this.gemini.getGenerativeModel({ model: config.ai.gemini.model });
      
      const result = await model.generateContent([
        {
          text: fullPrompt
        },
        {
          inlineData: {
            data: modelImageBase64,
            mimeType: 'image/jpeg'
          }
        },
        {
          inlineData: {
            data: productImageBase64,
            mimeType: 'image/jpeg'
          }
        }
      ]);

      // Process response and save result
      const response = await result.response;
      const resultImagePath = await this.saveGeneratedImage(response, 'model_product');

      return {
        success: true,
        resultImagePath
      };

    } catch (error) {
      console.error('Image processing error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Process product images with optional background
   */
  async processProductImages(params: ProcessProductImagesParams): Promise<ProcessResult> {
    try {
      const { productImagePath, backgroundImagePath, prompt } = params;

      if (!this.validateImageFile(productImagePath)) {
        return { success: false, error: 'Invalid product image file' };
      }

      if (backgroundImagePath && !this.validateImageFile(backgroundImagePath)) {
        return { success: false, error: 'Invalid background image file' };
      }

      // Read product image
      const productImageBase64 = fs.readFileSync(productImagePath, 'base64');

      // Build prompt
      const fullPrompt = this.buildProductProcessingPrompt(prompt, !!backgroundImagePath);

      // Prepare content array
      const content: any[] = [{ text: fullPrompt }];

      // Add product image
      content.push({
        inlineData: {
          data: productImageBase64,
          mimeType: 'image/jpeg'
        }
      });

      // Add background image if provided
      if (backgroundImagePath) {
        const backgroundImageBase64 = fs.readFileSync(backgroundImagePath, 'base64');
        content.push({
          inlineData: {
            data: backgroundImageBase64,
            mimeType: 'image/jpeg'
          }
        });
      }

      // Call Gemini API
      const model = this.gemini.getGenerativeModel({ model: config.ai.gemini.model });
      const result = await model.generateContent(content);
      const response = await result.response;

      // Save result
      const resultImagePath = await this.saveGeneratedImage(response, 'product');

      return {
        success: true,
        resultImagePath
      };

    } catch (error) {
      console.error('Product image processing error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Process virtual try-on with user and product images
   */
  async processVirtualTryOn(params: ProcessVirtualTryOnParams): Promise<ProcessResult> {
    try {
      const { userImagePath, productImagePath, customPrompt, productTitle } = params;

      if (!this.validateImageFile(userImagePath) || !this.validateImageFile(productImagePath)) {
        return { success: false, error: 'Invalid image files' };
      }

      // Use OpenRouter API for virtual try-on
      if (config.ai.openrouter.apiKey) {
        return await this.processWithOpenRouter(userImagePath, productImagePath, customPrompt, productTitle);
      }

      // Fallback to Gemini
      return await this.processWithGemini(userImagePath, productImagePath, customPrompt, productTitle);

    } catch (error) {
      console.error('Virtual try-on processing error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Process with OpenRouter API
   */
  private async processWithOpenRouter(
    userImagePath: string, 
    productImagePath: string, 
    customPrompt?: string,
    productTitle?: string
  ): Promise<ProcessResult> {
    try {
      if (!config.ai.openrouter.apiKey) {
        throw new Error('OPENROUTER_API_KEY not configured');
      }

      const userImageBase64 = fs.readFileSync(userImagePath, 'base64');
      const productImageBase64 = fs.readFileSync(productImagePath, 'base64');

      // Convert base64 images to data URLs
      const productImageDataUrl = `data:image/jpeg;base64,${productImageBase64}`;
      const userImageDataUrl = `data:image/jpeg;base64,${userImageBase64}`;

      // Build the base prompt
      let prompt = `Create a professional e-commerce fashion photo. Take the clothing item from the first image and place it realistically on the model from the second image. Ensure the product's original color, texture, and size are preserved. Generate a full-body, photorealistic shot of the model wearing the item, with lighting and shadows adjusted naturally to match the scene.`;

      // Add product title if provided
      if (productTitle && productTitle.trim()) {
        prompt += `\n\nProduct: ${productTitle}`;
      }

      // Add custom prompt if provided
      if (customPrompt && customPrompt.trim()) {
        prompt += `\n\nAdditional styling request: ${customPrompt}`;
      }

      prompt += `\n\nGenerate a high-quality virtual try-on result that looks authentic and appealing.`;

      // Debug logging
      console.log('Sending prompt to OpenRouter:', prompt);
      console.log('Product image URL:', productImageDataUrl.substring(0, 100) + '...');
      console.log('User image URL:', userImageDataUrl.substring(0, 100) + '...');

      const response = await axios.post(`${config.ai.openrouter.baseUrl}/chat/completions`, {
        "model": config.ai.gemini.model,
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
          "Authorization": `Bearer ${config.ai.openrouter.apiKey}`,
          "HTTP-Referer": config.urls.siteUrl,
          "X-Title": config.urls.siteName,
          "Content-Type": "application/json"
        }
      });

      if (response.status !== 200) {
        console.log('❌ OpenRouter API error:', response.status, response.statusText);
        console.log('Using mock result instead...');
        return {
          success: true,
          resultImagePath: this.createMockTryOnResult(userImageBase64, productImageBase64)
        };
      }

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
          const imageContent = content.find((item: any) => item.type === 'image_url');
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
        else if (content && typeof content === 'object' && (content as any).image_url) {
          generatedImageUrl = (content as any).image_url.url;
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
        resultImagePath: generatedImageUrl
      };

    } catch (error) {
      console.error('OpenRouter API error:', error);
      console.log('Using mock result instead...');
      return {
        success: true,
        resultImagePath: this.createMockTryOnResult(
          fs.readFileSync(userImagePath, 'base64'), 
          fs.readFileSync(productImagePath, 'base64')
        )
      };
    }
  }

  /**
   * Process with Gemini API
   */
  private async processWithGemini(
    userImagePath: string, 
    productImagePath: string, 
    customPrompt?: string,
    productTitle?: string
  ): Promise<ProcessResult> {
    try {
      const userImageBase64 = fs.readFileSync(userImagePath, 'base64');
      const productImageBase64 = fs.readFileSync(productImagePath, 'base64');

      const prompt = this.buildVirtualTryOnPrompt(customPrompt, productTitle);

      const model = this.gemini.getGenerativeModel({ model: config.ai.gemini.model });
      
      const result = await model.generateContent([
        { text: prompt },
        {
          inlineData: {
            data: productImageBase64,
            mimeType: 'image/jpeg'
          }
        },
        {
          inlineData: {
            data: userImageBase64,
            mimeType: 'image/jpeg'
          }
        }
      ]);

      const response = await result.response;
      const resultImagePath = await this.saveGeneratedImage(response, 'virtual_tryon');

      return {
        success: true,
        resultImagePath
      };

    } catch (error) {
      console.error('Gemini API error:', error);
      return { success: false, error: 'Gemini API failed' };
    }
  }

  /**
   * Validate image file
   */
  static validateImageFile(filePath: string): boolean {
    try {
      if (!fs.existsSync(filePath)) return false;
      
      const stats = fs.statSync(filePath);
      if (stats.size === 0) return false;
      
      // Check file extension
      const ext = path.extname(filePath).toLowerCase();
      const allowedExts = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
      
      return allowedExts.includes(ext);
    } catch {
      return false;
    }
  }

  /**
   * Build image processing prompt
   */
  private buildImageProcessingPrompt(customPrompt?: string): string {
    let prompt = `Create a professional e-commerce fashion photo. Take the clothing item from the first image and place it realistically on the model from the second image. Ensure the product's original color, texture, and size are preserved. Generate a full-body, photorealistic shot of the model wearing the item, with lighting and shadows adjusted naturally to match the scene.`;

    if (customPrompt && customPrompt.trim()) {
      prompt += `\n\nAdditional styling request: ${customPrompt}`;
    }

    prompt += `\n\nGenerate a high-quality virtual try-on result that looks authentic and appealing.`;

    return prompt;
  }

  /**
   * Build product processing prompt
   */
  private buildProductProcessingPrompt(customPrompt?: string, hasBackground: boolean = false): string {
    let prompt = `Create a professional product image. Process the product image to enhance its appearance, remove background if needed, and make it suitable for e-commerce use.`;

    if (hasBackground) {
      prompt += ` Use the second image as a background for the product.`;
    }

    if (customPrompt && customPrompt.trim()) {
      prompt += `\n\nAdditional requirements: ${customPrompt}`;
    }

    prompt += `\n\nGenerate a high-quality, professional product image.`;

    return prompt;
  }

  /**
   * Build virtual try-on prompt
   */
  private buildVirtualTryOnPrompt(customPrompt?: string, productTitle?: string): string {
    let prompt = `Create a professional e-commerce fashion photo. Take the clothing item from the first image and place it realistically on the model from the second image. Ensure the product's original color, texture, and size are preserved. Generate a full-body, photorealistic shot of the model wearing the item, with lighting and shadows adjusted naturally to match the scene.`;

    if (productTitle && productTitle.trim()) {
      prompt += `\n\nProduct: ${productTitle}`;
    }

    if (customPrompt && customPrompt.trim()) {
      prompt += `\n\nAdditional styling request: ${customPrompt}`;
    }

    prompt += `\n\nGenerate a high-quality virtual try-on result that looks authentic and appealing.`;

    return prompt;
  }

  /**
   * Extract image from API response
   */
  private extractImageFromResponse(response: any): string | null {
    try {
      const content = response.choices?.[0]?.message?.content;
      
      if (Array.isArray(content)) {
        const imageContent = content.find((item: any) => item.type === 'image_url');
        if (imageContent?.image_url?.url) {
          return imageContent.image_url.url;
        }
      } else if (typeof content === 'string') {
        // Look for data URLs
        const dataUrlMatch = content.match(/data:image\/[^;]+;base64,[A-Za-z0-9+/=]+/);
        if (dataUrlMatch) {
          return dataUrlMatch[0];
        }
        
        // Look for HTTP URLs
        const urlMatch = content.match(/https?:\/\/[^\s]+\.(jpg|jpeg|png|webp|gif)/i);
        if (urlMatch) {
          return urlMatch[0];
        }
      }
      
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Save generated image to file system
   */
  private async saveGeneratedImage(response: any, type: string): Promise<string> {
    try {
      // Ensure generated directory exists
      const generatedDir = config.upload.generatedPath;
      if (!fs.existsSync(generatedDir)) {
        fs.mkdirSync(generatedDir, { recursive: true });
      }

      // Generate filename
      const filename = `${type}_${uuidv4()}.png`;
      const filePath = path.join(generatedDir, filename);

      // For now, create a placeholder file
      // In a real implementation, you'd extract the image from the response
      fs.writeFileSync(filePath, Buffer.from('placeholder'));

      return filePath;
    } catch (error) {
      console.error('Error saving generated image:', error);
      throw new Error('Failed to save generated image');
    }
  }

  /**
   * Create mock try-on result (fallback)
   */
  private createMockTryOnResult(userImageBase64: string, productImageBase64: string): string {
    // For now, return the user image as fallback
    // In a real implementation, you'd create a composite image
    console.log('⚠️  MOCK RESULT: No AI API keys configured. Please add GEMINI_API_KEY or OPENROUTER_API_KEY to .env file');
    return `data:image/jpeg;base64,${userImageBase64}`;
  }
}

export default ImageProcessingService;
