import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import Joi from 'joi';
import OpenAI from 'openai';

const router = express.Router();
const prisma = new PrismaClient();

// Initialize OpenAI client for OpenRouter
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": process.env.SITE_URL || "http://localhost:3000",
    "X-Title": process.env.SITE_NAME || "AI Image Analysis",
  },
});

// Get all product image generators for user
router.get('/', authenticate, async (req: any, res) => {
  try {
    const { search, status } = req.query;
    
    const where: any = {
      user_id: req.user.id
    };
    
    if (search) {
      where.title = {
        contains: search,
        mode: 'insensitive'
      };
    }
    
    if (status) {
      where.status = status;
    }
    
    const generators = await prisma.productImageGenerator.findMany({
      where,
      orderBy: {
        created_at: 'desc'
      }
    });
    
    res.json(generators);
  } catch (error) {
    console.error('Error fetching product image generators:', error);
    res.status(500).json({ error: 'Failed to fetch product image generators' });
  }
});

// Get single product image generator
router.get('/:id', authenticate, async (req: any, res) => {
  try {
    const { id } = req.params;
    
    const generator = await prisma.productImageGenerator.findFirst({
      where: {
        id,
        user_id: req.user.id
      }
    });
    
    if (!generator) {
      return res.status(404).json({ error: 'Product image generator not found' });
    }
    
    res.json(generator);
  } catch (error) {
    console.error('Error fetching product image generator:', error);
    res.status(500).json({ error: 'Failed to fetch product image generator' });
  }
});

// Create new product image generator
router.post('/', 
  authenticate,
  validateRequest(Joi.object({
    title: Joi.string().required(),
    image_url: Joi.string().uri().required()
  })),
  async (req: any, res) => {
    try {
      const { title, image_url } = req.body;
      
      const generator = await prisma.productImageGenerator.create({
        data: {
          title,
          image_url,
          user_id: req.user.id,
          status: 'waiting'
        }
      });
      
      res.status(201).json(generator);
    } catch (error) {
      console.error('Error creating product image generator:', error);
      res.status(500).json({ error: 'Failed to create product image generator' });
    }
  }
);

// Generate image prompts
router.post('/:id/generate', 
  authenticate,
  async (req: any, res) => {
    try {
      const { id } = req.params;
      
      // Find the generator
      const generator = await prisma.productImageGenerator.findFirst({
        where: {
          id,
          user_id: req.user.id
        }
      });
      
      if (!generator) {
        return res.status(404).json({ error: 'Product image generator not found' });
      }
      
      // Update status to processing
      await prisma.productImageGenerator.update({
        where: { id },
        data: { status: 'processing' }
      });
      
      try {
        // Prepare the generation prompt
        const generationPrompt = `
📌 Master Prompt – Product Painpoint Image Prompt Generator

Nhiệm vụ:
Bạn nhận vào 1 hình ảnh sản phẩm gốc và title sản phẩm. Dựa trên đó, bạn cần phân tích tập khách hàng mục tiêu (thị trường US), xác định painpoint chính mà khách hàng gặp phải, và viết ra 5 prompt tạo hình sản phẩm.

Yêu cầu chi tiết:

Không thay đổi sản phẩm gốc
- Giữ nguyên form, màu sắc, chi tiết sản phẩm trong hình ảnh gốc.
- Chỉ thay đổi bối cảnh, ánh sáng, môi trường, props xung quanh để làm rõ giá trị sản phẩm.

Painpoint → Solution → Image Prompt
- Với mỗi painpoint của khách hàng US, mô tả chi tiết:
  - Painpoint là gì?
  - Sản phẩm giải quyết thế nào?
  - Prompt: a detailed English image prompt that visualizes this solution while keeping the product unchanged.

Tone & Style Prompt (Generalized)

Hình ảnh phải mang tính realistic, high-quality, professional, thể hiện đúng giá trị sản phẩm.

Tùy theo category sản phẩm, chọn bối cảnh & style phù hợp với cách khách hàng Mỹ sử dụng sản phẩm đó.

Ví dụ:

Home & Lifestyle products → bedroom, living room, kitchen, office, holiday home…

Electronics & Gadgets → desk setup, modern workspace, outdoor travel kit, car interior…

Toys & Collectibles → children’s playroom, gift unboxing, display shelf…

Kitchen & Dining → countertop, dinner table, family cooking scene…

Fitness & Outdoor → gym, yoga space, hiking, backyard…

Luôn tạo cảm giác sản phẩm giúp giải quyết painpoint (comfort, efficiency, fun, safety, convenience, status…).

Giữ nguyên sản phẩm gốc (shape, size, color, details), thể hiện tỉ lệ chính xác với bối cảnh

Kết quả cuối cùng (đề xuất viết lại)

Luôn trả ra 5 painpoint + 5 prompt tương ứng.

Mỗi painpoint gồm: Tên painpoint, mô tả painpoint, solution, prompt chi tiết.

Prompt phải đủ dài, rõ ràng, chi tiết, đảm bảo dùng trực tiếp cho các AI image generator (MidJourney / DALL·E / Stable Diffusion / Stable Cascade hoặc các nền tảng tương tự).

Nội dung prompt cần tuân thủ:

Giữ nguyên sản phẩm gốc (form, màu sắc, kích thước, chi tiết).

Mô tả bối cảnh phù hợp với thị trường US và category sản phẩm.

Thể hiện đúng scale của sản phẩm so với môi trường.

Nhấn mạnh giải pháp mà sản phẩm mang lại cho painpoint.

Có thể kèm thêm một phiên bản prompt rút gọn (1 câu) để tiện nhập nhanh.

QUAN TRỌNG: Chỉ trả về JSON object theo đúng cấu trúc dưới đây, không cần markdown hay text khác.

{
  "product_title": "Tên sản phẩm",
  "image_reference": "URL hình ảnh gốc",
  "market": "US",
  "painpoints": [
    {
      "name": "Tên painpoint",
      "painpoint": "Mô tả painpoint",
      "solution": "Sản phẩm giải quyết thế nào",
      "prompt": "Prompt tạo hình ảnh chi tiết"
    }
  ]
}

Thông tin sản phẩm:
- Title: ${generator.title}
- Image URL: ${generator.image_url}

Hãy phân tích và tạo 5 painpoints với prompts tương ứng cho thị trường US.
        `;

        // Call OpenRouter API
        const completion = await openai.chat.completions.create({
          model: "openai/gpt-4o-mini-search-preview",
          messages: [
            {
              role: "user",
              content: generationPrompt
            }
          ]
        });
        
        const generationResult = completion.choices[0].message.content;
        console.log('AI Response:', generationResult);
        
        // Parse the JSON response
        let parsedResult;
        try {
          // Extract JSON from the response (in case there's extra text)
          const jsonMatch = generationResult?.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            console.log('Extracted JSON:', jsonMatch[0]);
            parsedResult = JSON.parse(jsonMatch[0]);
          } else {
            throw new Error('No valid JSON found in response');
          }
        } catch (parseError) {
          console.error('Error parsing AI response:', parseError);
          console.error('Raw response:', generationResult);
          throw new Error('Failed to parse AI generation result');
        }
        
        // Update generator with generation result
        const updatedGenerator = await prisma.productImageGenerator.update({
          where: { id },
          data: {
            status: 'done',
            generation_result: JSON.stringify(parsedResult),
            generated_at: new Date()
          }
        });
        
        res.json({
          message: 'Image prompts generated successfully',
          generator: updatedGenerator
        });
        
      } catch (aiError) {
        console.error('AI generation error:', aiError);
        
        // Update status to error
        await prisma.productImageGenerator.update({
          where: { id },
          data: {
            status: 'error',
            error_message: aiError instanceof Error ? aiError.message : 'AI generation failed'
          }
        });
        
        res.status(500).json({
          error: 'Image generation failed',
          details: aiError instanceof Error ? aiError.message : 'Unknown error'
        });
      }
      
    } catch (error) {
      console.error('Error generating image prompts:', error);
      res.status(500).json({ error: 'Failed to generate image prompts' });
    }
  }
);

// Generate image from prompt
router.post('/:id/generate-image', 
  authenticate,
  async (req: any, res) => {
    try {
      const { id } = req.params;
      const { prompt, painpointIndex } = req.body;
      
      if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
      }
      
      // Find the generator
      const generator = await prisma.productImageGenerator.findFirst({
        where: {
          id,
          user_id: req.user.id
        }
      });
      
      if (!generator) {
        return res.status(404).json({ error: 'Product image generator not found' });
      }
      
      if (!generator.image_url) {
        return res.status(400).json({ error: 'Product image URL not found' });
      }
      
      // Download product image
      const axios = require('axios');
      const productImageResponse = await axios.get(generator.image_url, { responseType: 'arraybuffer' });
      const productImageBase64 = Buffer.from(productImageResponse.data).toString('base64');
      
      // Resize image to reduce API payload size
      const resizedProductImage = await resizeImageForAPI(productImageBase64);
      
      // Call OpenRouter API with Gemini 2.5 Flash Image Preview
      const openRouterResult = await callOpenRouterImageGenerationAPI(
        resizedProductImage,
        prompt
      );
      
      if (!openRouterResult.success) {
        return res.status(500).json({
          error: 'Failed to generate image',
          details: openRouterResult.error
        });
      }
      
      res.json({
        success: true,
        generatedImageUrl: openRouterResult.imageUrl,
        prompt: prompt,
        painpointIndex: painpointIndex
      });
      
    } catch (error) {
      console.error('Image generation error:', error);
      res.status(500).json({
        error: 'Failed to generate image',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// Delete product image generator
router.delete('/:id', authenticate, async (req: any, res) => {
  try {
    const { id } = req.params;
    
    const generator = await prisma.productImageGenerator.findFirst({
      where: {
        id,
        user_id: req.user.id
      }
    });
    
    if (!generator) {
      return res.status(404).json({ error: 'Product image generator not found' });
    }
    
    await prisma.productImageGenerator.delete({
      where: { id }
    });
    
    res.json({ message: 'Product image generator deleted successfully' });
  } catch (error) {
    console.error('Error deleting product image generator:', error);
    res.status(500).json({ error: 'Failed to delete product image generator' });
  }
});

// Helper function to call OpenRouter API for image generation
async function callOpenRouterImageGenerationAPI(productImageBase64: string, prompt: string) {
  try {
    if (!process.env.OPENROUTER_API_KEY) {
      throw new Error('OPENROUTER_API_KEY not configured');
    }

    // Convert base64 image to data URL
    const productImageDataUrl = `data:image/jpeg;base64,${productImageBase64}`;

    // Build the enhanced prompt
    const enhancedPrompt = `Create a professional product lifestyle image. ${prompt}

Requirements:
- Keep the original product unchanged in form, color, and details
- Only change the background, lighting, environment, and props around the product
- Make it look premium, cozy, and realistic
- Focus on lifestyle contexts familiar to US customers: bedroom, living room, office, gift setup, winter home
- Create a feeling that the product improves life, health, atmosphere, or emotions
- High quality, photorealistic result`;

    console.log('Sending image generation prompt to OpenRouter:', enhancedPrompt);
    console.log('Product image URL:', productImageDataUrl.substring(0, 100) + '...');

    const axios = require('axios');
    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      "model": "google/gemini-2.5-flash-image-preview",
      "messages": [
        {
          "role": "user",
          "content": [
            {
              "type": "text",
              "text": enhancedPrompt
            },
            {
              "type": "image_url",
              "image_url": {
                "url": productImageDataUrl
              }
            }
          ]
        }
      ]
    }, {
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": process.env.SITE_URL || "http://localhost:3000",
        "X-Title": process.env.SITE_NAME || "AI Image Analysis",
        "Content-Type": "application/json"
      }
    });

    if (response.status !== 200) {
      console.log('❌ OpenRouter API error:', response.status, response.statusText);
      return {
        success: false,
        error: `API error: ${response.status} ${response.statusText}`
      };
    }

    const result = response.data;
    console.log('OpenRouter API Response:', JSON.stringify(result, null, 2));
    
    // Extract the generated image URL from Gemini 2.5 Flash Image Preview response
    let generatedImageUrl = null;
    
    if (result.choices && result.choices[0] && result.choices[0].message) {
      const content = result.choices[0].message.content;
      
      // Check if content is an array (multimodal response)
      if (Array.isArray(content)) {
        const imageContent = content.find((item: any) => item.type === 'image_url');
        if (imageContent && imageContent.image_url) {
          generatedImageUrl = imageContent.image_url.url;
        }
      }
      // Check if content is a string with URL or base64 data
      else if (typeof content === 'string') {
        // Check for HTTP URLs first
        if (content.includes('http')) {
          const urlMatch = content.match(/https?:\/\/[^\s]+\.(jpg|jpeg|png|webp|gif)/i);
          if (urlMatch) {
            generatedImageUrl = urlMatch[0];
          }
        }
        
        // Check for base64 data URLs
        if (!generatedImageUrl && content.includes('data:image/')) {
          const base64Match = content.match(/data:image\/[^;]+;base64,[A-Za-z0-9+/=]+/);
          if (base64Match) {
            generatedImageUrl = base64Match[0];
          }
        }
        
        // If still no match, check if the entire content is a base64 string
        if (!generatedImageUrl && content.length > 1000 && /^[A-Za-z0-9+/=]+$/.test(content.trim())) {
          generatedImageUrl = `data:image/jpeg;base64,${content}`;
        }
      }
      // Check if content is an object with image_url
      else if (content && typeof content === 'object' && (content as any).image_url) {
        generatedImageUrl = (content as any).image_url.url;
      }
    }
    
    // Check for alternative image sources in the response
    if (!generatedImageUrl) {
      if (result.data && Array.isArray(result.data)) {
        const imageData = result.data.find((item: any) => item.url);
        if (imageData) {
          generatedImageUrl = imageData.url;
        }
      }
      
      // Check the entire response string for base64 data URLs
      if (!generatedImageUrl) {
        const responseString = JSON.stringify(result);
        const base64Match = responseString.match(/data:image\/[^;]+;base64,[A-Za-z0-9+/=]+/);
        if (base64Match) {
          generatedImageUrl = base64Match[0];
        }
      }
    }
    
    if (!generatedImageUrl) {
      console.log('❌ No image URL found in response');
      return {
        success: false,
        error: 'No image generated by AI model'
      };
    }

    return {
      success: true,
      imageUrl: generatedImageUrl
    };

  } catch (error) {
    console.error('OpenRouter API error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Resize image to reduce API payload size
async function resizeImageForAPI(base64Image: string): Promise<string> {
  try {
    const sharp = require('sharp');
    const buffer = Buffer.from(base64Image, 'base64');
    
    const resized = await sharp(buffer)
      .resize(1024, 1024, { 
        fit: 'inside',
        withoutEnlargement: true 
      })
      .jpeg({ quality: 85 })
      .toBuffer();
    
    return resized.toString('base64');
  } catch (error) {
    console.warn('Failed to resize image, using original:', error);
    return base64Image;
  }
}

export default router;
