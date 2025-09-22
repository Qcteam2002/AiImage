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
    "X-Title": process.env.SITE_NAME || "AI Image Analysis"
  }
});

// Get all products for a user
router.get('/', authenticate, async (req: any, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    
    const where: any = {
      user_id: req.user.id
    };
    
    if (status && status !== 'all') {
      where.status = status;
    }
    
    if (search) {
      where.name = {
        contains: search as string,
        mode: 'insensitive'
      };
    }
    
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: parseInt(limit as string),
        orderBy: { created_at: 'desc' }
      }),
      prisma.product.count({ where })
    ]);
    
    res.json({
      products,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string))
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get single product by ID
router.get('/:id', authenticate, async (req: any, res) => {
  try {
    const { id } = req.params;
    
    const product = await prisma.product.findFirst({
      where: {
        id,
        user_id: req.user.id
      }
    });
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Create new product
router.post('/', 
  authenticate,
  validateRequest(Joi.object({
    name: Joi.string().required().messages({
      'any.required': 'Product name is required'
    }),
    image_url: Joi.string().uri().optional().messages({
      'string.uri': 'Invalid image URL'
    }),
    product_url: Joi.string().uri().optional().messages({
      'string.uri': 'Invalid product URL'
    }),
    description: Joi.string().optional()
  })),
  async (req: any, res) => {
    try {
      const { name, image_url, product_url, description } = req.body;
      
      // Validate that at least one URL is provided
      if (!image_url && !product_url) {
        return res.status(400).json({ 
          error: 'At least one URL (image or product) is required' 
        });
      }
      
      const product = await prisma.product.create({
        data: {
          name,
          image_url,
          product_url,
          description,
          user_id: req.user.id,
          status: 'waiting'
        }
      });
      
      res.status(201).json(product);
    } catch (error) {
      console.error('Error creating product:', error);
      res.status(500).json({ error: 'Failed to create product' });
    }
  }
);

// Analyze product
router.post('/:id/analyze', 
  authenticate,
  async (req: any, res) => {
    try {
      const { id } = req.params;
      
      // Find the product
      const product = await prisma.product.findFirst({
        where: {
          id,
          user_id: req.user.id
        }
      });
      
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      if (product.status === 'processing') {
        return res.status(400).json({ error: 'Product is already being analyzed' });
      }
      
      // Update status to processing
      await prisma.product.update({
        where: { id },
        data: { status: 'processing' }
      });
      
      try {
        // Prepare the analysis prompt
        const analysisPrompt = `
Phân tích sản phẩm "${product.name}" với thông tin sau:
${product.description ? `Mô tả: ${product.description}` : ''}
${product.image_url ? `Hình ảnh: ${product.image_url}` : ''}
${product.product_url ? `Link sản phẩm: ${product.product_url}` : ''}

Hãy phân tích và trả về kết quả theo format JSON sau:

{
  "target_audience": {
    "primary": "Nhóm khách hàng chính (tuổi, nghề nghiệp, sở thích)",
    "secondary": "Nhóm khách hàng phụ",
    "demographics": {
      "age_range": "Khoảng tuổi",
      "gender": "Tỷ lệ giới tính",
      "location": "Khu vực địa lý",
      "income_level": "Mức thu nhập"
    },
    "behaviors": ["Hành vi mua sắm", "Sở thích", "Thói quen sử dụng"],
    "painpoints": ["Vấn đề chính của khách hàng", "Nhu cầu chưa được đáp ứng"]
  },
  "market_analysis": {
    "market_size": "Quy mô thị trường (nhỏ/trung bình/lớn)",
    "competition_level": "Mức độ cạnh tranh",
    "growth_potential": "Tiềm năng tăng trưởng",
    "key_competitors": ["Tên đối thủ chính"]
  },
  "product_positioning": {
    "usp": ["Điểm bán hàng độc đáo", "Lợi thế cạnh tranh"],
    "price_positioning": "Định vị giá (cao/trung bình/thấp)",
    "value_proposition": "Giá trị mang lại cho khách hàng",
    "differentiation": ["Điểm khác biệt so với đối thủ"]
  },
  "marketing_recommendations": {
    "channels": ["Kênh marketing hiệu quả"],
    "messaging": ["Thông điệp chính"],
    "content_ideas": ["Ý tưởng nội dung"],
    "pricing_strategy": "Chiến lược giá"
  },
  "sales_potential": {
    "estimated_demand": "Nhu cầu ước tính",
    "profit_margin": "Biên lợi nhuận dự kiến",
    "roi_potential": "Tiềm năng ROI",
    "risk_level": "Mức độ rủi ro"
  }
}

Hãy phân tích dựa trên thị trường Việt Nam và ngành hàng điện tử tiêu dùng.
`;

        // Call OpenRouter API
        const completion = await openai.chat.completions.create({
          model: "openai/gpt-4o-mini-search-preview",
          messages: [
            {
              role: "user",
              content: analysisPrompt
            }
          ]
        });
        
        const analysisResult = completion.choices[0].message.content;
        
        // Parse the JSON response
        let parsedResult;
        try {
          // Extract JSON from the response (in case there's extra text)
          const jsonMatch = analysisResult?.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            parsedResult = JSON.parse(jsonMatch[0]);
          } else {
            throw new Error('No valid JSON found in response');
          }
        } catch (parseError) {
          console.error('Error parsing AI response:', parseError);
          throw new Error('Failed to parse AI analysis result');
        }
        
        // Update product with analysis result
        const updatedProduct = await prisma.product.update({
          where: { id },
          data: {
            status: 'done',
            analysis_result: parsedResult,
            analyzed_at: new Date()
          }
        });
        
        res.json({
          message: 'Product analysis completed successfully',
          product: updatedProduct
        });
        
      } catch (aiError) {
        console.error('AI analysis error:', aiError);
        
        // Update product status to error
        await prisma.product.update({
          where: { id },
          data: { 
            status: 'error',
            error_message: aiError instanceof Error ? aiError.message : 'Unknown error'
          }
        });
        
        res.status(500).json({ 
          error: 'AI analysis failed',
          details: aiError instanceof Error ? aiError.message : 'Unknown error'
        });
      }
      
    } catch (error) {
      console.error('Error analyzing product:', error);
      res.status(500).json({ error: 'Failed to analyze product' });
    }
  }
);

// Delete product
router.delete('/:id', 
  authenticate,
  async (req: any, res) => {
    try {
      const { id } = req.params;
      
      const product = await prisma.product.findFirst({
        where: {
          id,
          user_id: req.user.id
        }
      });
      
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      await prisma.product.delete({
        where: { id }
      });
      
      res.json({ message: 'Product deleted successfully' });
    } catch (error) {
      console.error('Error deleting product:', error);
      res.status(500).json({ error: 'Failed to delete product' });
    }
  }
);

export default router;
