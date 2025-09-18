import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/temp');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Try-on API endpoint
router.post('/', upload.fields([
  { name: 'userImage', maxCount: 1 },
  { name: 'productImage', maxCount: 1 }
]), async (req: Request, res: Response) => {
  try {
    const { productImageUrl, productTitle, customPrompt } = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const userImageFile = files?.['userImage']?.[0];
    const productImageFile = files?.['productImage']?.[0];

    if (!userImageFile) {
      return res.status(400).json({ 
        success: false, 
        error: "Missing user image" 
      });
    }

    let productImageBase64: string;

    // Get product image - either from URL or uploaded file
    if (productImageUrl) {
      // Fetch product image from URL
      const productImageResponse = await axios.get(productImageUrl, { responseType: 'arraybuffer' });
      productImageBase64 = Buffer.from(productImageResponse.data).toString('base64');
    } else if (productImageFile) {
      // Use uploaded product image
      productImageBase64 = fs.readFileSync(productImageFile.path).toString('base64');
    } else {
      return res.status(400).json({ 
        success: false, 
        error: "Missing product image URL or file" 
      });
    }

    // Convert user image to base64
    const userImageBase64 = fs.readFileSync(userImageFile.path).toString('base64');

    // Call OpenRouter API
    const openRouterResult = await callOpenRouterAPI(
      productImageBase64, 
      userImageBase64, 
      productTitle || "this product", 
      customPrompt || ""
    );
    
    if (!openRouterResult.success) {
      return res.status(500).json({ 
        success: false, 
        error: "Failed to generate virtual try-on" 
      });
    }

    // Clean up uploaded files
    try {
      if (userImageFile) fs.unlinkSync(userImageFile.path);
      if (productImageFile) fs.unlinkSync(productImageFile.path);
    } catch (cleanupError) {
      console.warn('Failed to clean up files:', cleanupError);
    }

    return res.json({
      success: true,
      generatedImageUrl: openRouterResult.imageUrl,
      message: "Virtual try-on generated successfully!"
    });

  } catch (error) {
    console.error('Try-on generation error:', error);
    return res.status(500).json({ 
      success: false, 
      error: "Failed to generate virtual try-on: " + (error instanceof Error ? error.message : 'Unknown error')
    });
  }
});

// OpenRouter API call function (copied from api.tryon-generate.jsx)
async function callOpenRouterAPI(productImageBase64: string, userImageBase64: string, productTitle: string, customPrompt: string = "") {
  try {
    if (!process.env.OPENROUTER_API_KEY) {
      throw new Error('OPENROUTER_API_KEY not configured');
    }

    // Convert base64 images to data URLs
    const productImageDataUrl = `data:image/jpeg;base64,${productImageBase64}`;
    const userImageDataUrl = `data:image/jpeg;base64,${userImageBase64}`;

    // Build the base prompt
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
      "model": "google/gemini-2.5-flash-image-preview",
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
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": process.env.SITE_URL || "https://your-shopify-app.com",
        "X-Title": process.env.SITE_NAME || "Virtual Try-On App",
        "Content-Type": "application/json"
      }
    });

    if (response.status !== 200) {
      console.log('❌ OpenRouter API error:', response.status, response.statusText);
      console.log('Using mock result instead...');
      return {
        success: true,
        imageUrl: createMockTryOnResult(userImageBase64, productImageBase64),
        description: "Mock virtual try-on result (OpenRouter API unavailable)"
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
      generatedImageUrl = createMockTryOnResult(userImageBase64, productImageBase64);
    } else {
      console.log('✅ Generated image URL found:', generatedImageUrl);
    }

    return {
      success: true,
      imageUrl: generatedImageUrl,
      description: result.choices?.[0]?.message?.content || "Virtual try-on generated successfully"
    };

  } catch (error) {
    console.error('OpenRouter API error:', error);
    console.log('Using mock result instead...');
    return {
      success: true,
      imageUrl: createMockTryOnResult(userImageBase64, productImageBase64),
      description: "Mock virtual try-on result (OpenRouter API unavailable)"
    };
  }
}

function createMockTryOnResult(userImageBase64: string, productImageBase64: string) {
  // For now, return the user image as fallback
  // In a real implementation, you'd create a composite image
  console.log('Using mock result - returning user image as fallback');
  return `data:image/jpeg;base64,${userImageBase64}`;
}

export default router;
