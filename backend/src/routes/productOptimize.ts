import express from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import axios from 'axios';

const router = express.Router();
const prisma = new PrismaClient();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// Get all products
router.get('/products', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { created_at: 'desc' }
    });
    
    res.json({ products });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add new product
router.post('/products', async (req, res) => {
  try {
    const { title, description, images } = req.body;
    console.log('Received product data:', { title, description, images });
    
    // Get or create a default user for product optimize
    let defaultUser = await prisma.user.findFirst({
      where: { email: 'product-optimize@system.com' }
    });
    
    if (!defaultUser) {
      defaultUser = await prisma.user.create({
        data: {
          email: 'product-optimize@system.com',
          password: 'system-password',
          name: 'Product Optimize System',
          credits: 999999,
          isActive: true,
          isVerified: true
        }
      });
    }
    
    const imageUrl = images && images.length > 0 ? images[0] : null;
    console.log('Creating product with image_url:', imageUrl);
    
    const product = await prisma.product.create({
      data: {
        user_id: defaultUser.id,
        name: title,
        description,
        image_url: imageUrl,
        status: 'done',
      }
    });
    
    console.log('Created product:', product);
    
    res.json({ product });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete product
router.delete('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.product.delete({
      where: { id }
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Suggest data API - Get keywords, segments, painpoints
router.post('/suggest-data', async (req, res) => {
  try {
    const { product_title, product_description, product_id, target_market } = req.body;
    
    const openRouterApiKey = process.env.OPENROUTER_API_KEY;
    if (!openRouterApiKey) {
      return res.status(500).json({ error: 'OpenRouter API key not configured' });
    }

    // Map country codes to full names for better AI understanding
    const marketNames: Record<string, string> = {
      'vi': 'Vietnam',
      'us': 'United States',
      'id': 'Indonesia',
      'th': 'Thailand',
      'my': 'Malaysia',
      'ph': 'Philippines',
      'sg': 'Singapore',
      'jp': 'Japan',
      'kr': 'South Korea',
      'au': 'Australia'
    };
    const marketName = marketNames[target_market || 'vi'] || 'Vietnam';

    const prompt = `# Phân Tích Sản Phẩm Để Gợi Ý Keywords và Phân Khúc

Bạn là chuyên gia phân tích thị trường. Hãy phân tích sản phẩm sau và trả về dữ liệu gợi ý:

**Sản phẩm:** ${product_title}
**Mô tả:** ${product_description}
**Target Market:** ${marketName}

## Yêu cầu:
1. **Keywords:** Tạo 10 keywords cho mỗi loại (informational, transactional, comparative, painpoint_related) - phù hợp với thị trường ${marketName}
2. **Target Customers:** Tạo 3 phân khúc khách hàng với painpoints cụ thể - phù hợp với văn hóa và đặc điểm người dùng ở ${marketName}
3. **Dữ liệu phải thực tế và có thể sử dụng được**

## Trả về JSON với cấu trúc:
\`\`\`json
{
  "keywords": {
    "informational": [
      { "keyword": "từ khóa thông tin 1", "volume": 1000, "cpc": 0.5, "competition": "Low" }
    ],
    "transactional": [
      { "keyword": "từ khóa mua hàng 1", "volume": 500, "cpc": 1.2, "competition": "Medium" }
    ],
    "comparative": [
      { "keyword": "từ khóa so sánh 1", "volume": 300, "cpc": 0.8, "competition": "High" }
    ],
    "painpoint_related": [
      { "keyword": "từ khóa vấn đề 1", "volume": 800, "cpc": 0.6, "competition": "Medium" }
    ]
  },
  "target_customers": [
    {
      "name": "Tên phân khúc 1",
      "common_painpoints": ["Vấn đề 1", "Vấn đề 2", "Vấn đề 3"],
      "market_share_percent": 35,
      "age_range": "25-35",
      "locations": ["Hà Nội", "TP.HCM", "Đà Nẵng"]
    }
  ]
}
\`\`\`

Hãy phân tích và trả về kết quả theo đúng cấu trúc JSON trên.`;

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'google/gemini-2.5-flash-preview-09-2025',
        messages: [
          {
            role: 'system',
            content: 'Bạn là chuyên gia phân tích thị trường. Trả về CHỈ JSON hợp lệ, không có text thêm, không có markdown formatting.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 3000,
      },
      {
        headers: {
          'Authorization': `Bearer ${openRouterApiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'Product Optimize Suggest',
        },
      }
    );

    const content = response.data.choices[0].message.content;
    
    try {
      // Try to parse JSON response
      let jsonStart = content.indexOf('{');
      if (jsonStart === -1) {
        throw new Error('No JSON found in response');
      }
      
      // Find matching closing brace
      let braceCount = 0;
      let jsonEnd = -1;
      for (let i = jsonStart; i < content.length; i++) {
        if (content[i] === '{') braceCount++;
        if (content[i] === '}') braceCount--;
        if (braceCount === 0) {
          jsonEnd = i;
          break;
        }
      }
      
      if (jsonEnd === -1) {
        throw new Error('Incomplete JSON found');
      }
      
      const jsonString = content.substring(jsonStart, jsonEnd + 1);
      const result = JSON.parse(jsonString);
      
      // Save to cache if product_id is provided
      if (product_id) {
        try {
          await prisma.suggestCache.upsert({
            where: { product_id },
            update: {
              suggest_data: JSON.stringify(result),
              updated_at: new Date()
            },
            create: {
              product_id,
              suggest_data: JSON.stringify(result)
            }
          });
        } catch (cacheError) {
          console.error('Error saving suggest cache:', cacheError);
          // Don't fail the request if cache save fails
        }
      }
      
      res.json(result);
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      console.error('Content:', content);
      
      // Fallback response
      res.json({
        keywords: {
          informational: [
            { keyword: "cách sử dụng sản phẩm", volume: 1000, cpc: 0.5, competition: "Low" },
            { keyword: "hướng dẫn sản phẩm", volume: 800, cpc: 0.4, competition: "Low" },
            { keyword: "thông tin sản phẩm", volume: 1200, cpc: 0.6, competition: "Medium" },
            { keyword: "đánh giá sản phẩm", volume: 900, cpc: 0.7, competition: "Medium" },
            { keyword: "so sánh sản phẩm", volume: 600, cpc: 0.8, competition: "High" },
            { keyword: "ưu nhược điểm", volume: 500, cpc: 0.5, competition: "Low" },
            { keyword: "có nên mua", volume: 700, cpc: 0.9, competition: "High" },
            { keyword: "giá trị sản phẩm", volume: 400, cpc: 0.6, competition: "Medium" },
            { keyword: "chất lượng sản phẩm", volume: 800, cpc: 0.7, competition: "Medium" },
            { keyword: "hiệu quả sản phẩm", volume: 600, cpc: 0.8, competition: "High" }
          ],
          transactional: [
            { keyword: "mua sản phẩm", volume: 2000, cpc: 1.5, competition: "High" },
            { keyword: "giá sản phẩm", volume: 1500, cpc: 1.2, competition: "High" },
            { keyword: "đặt hàng sản phẩm", volume: 800, cpc: 1.8, competition: "Medium" },
            { keyword: "shopee sản phẩm", volume: 1200, cpc: 1.0, competition: "High" },
            { keyword: "lazada sản phẩm", volume: 600, cpc: 1.1, competition: "Medium" },
            { keyword: "tiki sản phẩm", volume: 400, cpc: 1.3, competition: "Medium" },
            { keyword: "sendo sản phẩm", volume: 300, cpc: 0.9, competition: "Low" },
            { keyword: "khuyến mãi sản phẩm", volume: 1000, cpc: 1.4, competition: "High" },
            { keyword: "giảm giá sản phẩm", volume: 900, cpc: 1.6, competition: "High" },
            { keyword: "combo sản phẩm", volume: 500, cpc: 1.2, competition: "Medium" }
          ],
          comparative: [
            { keyword: "sản phẩm nào tốt", volume: 800, cpc: 1.0, competition: "High" },
            { keyword: "so sánh sản phẩm", volume: 600, cpc: 0.8, competition: "High" },
            { keyword: "sản phẩm vs sản phẩm", volume: 400, cpc: 0.9, competition: "Medium" },
            { keyword: "top sản phẩm", volume: 700, cpc: 1.1, competition: "High" },
            { keyword: "best sản phẩm", volume: 500, cpc: 1.2, competition: "High" },
            { keyword: "sản phẩm tốt nhất", volume: 600, cpc: 1.0, competition: "High" },
            { keyword: "sản phẩm chất lượng", volume: 400, cpc: 0.7, competition: "Medium" },
            { keyword: "sản phẩm uy tín", volume: 300, cpc: 0.8, competition: "Medium" },
            { keyword: "sản phẩm giá rẻ", volume: 500, cpc: 0.6, competition: "High" },
            { keyword: "sản phẩm cao cấp", volume: 200, cpc: 1.5, competition: "Low" }
          ],
          painpoint_related: [
            { keyword: "vấn đề sản phẩm", volume: 600, cpc: 0.7, competition: "Medium" },
            { keyword: "khó khăn sản phẩm", volume: 400, cpc: 0.6, competition: "Low" },
            { keyword: "thách thức sản phẩm", volume: 300, cpc: 0.8, competition: "Low" },
            { keyword: "giải pháp sản phẩm", volume: 500, cpc: 0.9, competition: "Medium" },
            { keyword: "cải thiện sản phẩm", volume: 400, cpc: 0.7, competition: "Medium" },
            { keyword: "tối ưu sản phẩm", volume: 300, cpc: 0.8, competition: "Low" },
            { keyword: "hiệu quả sản phẩm", volume: 600, cpc: 0.8, competition: "High" },
            { keyword: "kết quả sản phẩm", volume: 500, cpc: 0.7, competition: "Medium" },
            { keyword: "lợi ích sản phẩm", volume: 700, cpc: 0.6, competition: "Medium" },
            { keyword: "tác dụng sản phẩm", volume: 400, cpc: 0.8, competition: "Medium" }
          ]
        },
        target_customers: [
          {
            name: "Người dùng trẻ tuổi (18-25)",
            common_painpoints: ["Không biết cách sử dụng", "Lo lắng về chất lượng", "Muốn tiết kiệm chi phí"],
            market_share_percent: 30,
            age_range: "18-25",
            locations: ["Hà Nội", "TP.HCM", "Đà Nẵng"]
          },
          {
            name: "Người dùng trung niên (26-40)",
            common_painpoints: ["Cần hiệu quả cao", "Quan tâm đến an toàn", "Muốn tiết kiệm thời gian"],
            market_share_percent: 45,
            age_range: "26-40",
            locations: ["TP.HCM", "Hà Nội", "Cần Thơ"]
          },
          {
            name: "Người dùng cao tuổi (41+)",
            common_painpoints: ["Khó sử dụng công nghệ", "Cần hướng dẫn chi tiết", "Quan tâm đến độ bền"],
            market_share_percent: 25,
            age_range: "41+",
            locations: ["Hà Nội", "TP.HCM", "Hải Phòng"]
          }
        ]
      });
    }
  } catch (error) {
    console.error('Error in suggest-data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Optimize content API
router.post('/optimize', async (req, res) => {
  try {
    const { type, data, product_id } = req.body;
    
    const openRouterApiKey = process.env.OPENROUTER_API_KEY;
    if (!openRouterApiKey) {
      return res.status(500).json({ error: 'OpenRouter API key not configured' });
    }

    // Get product information including images
    let product = null;
    if (product_id) {
      product = await prisma.product.findUnique({
        where: { id: product_id }
      });
    }

    let prompt = '';

    switch (type) {
      case 'keyword':
        prompt = `# Tối Ưu Hóa Nội Dung Dựa Trên Keywords

**Sản phẩm:** ${data.product_title}
**Mô tả gốc:** ${data.product_description}
**Keywords:** ${data.keywords.join(', ')}
**Tone:** ${data.tone}
${product?.image_url ? `**Hình ảnh sản phẩm:** ${product.image_url}` : ''}

Hãy tạo tiêu đề và mô tả tối ưu hóa SEO dựa trên keywords đã chọn. Nội dung phải tự nhiên, hấp dẫn và chứa keywords một cách hợp lý.

**Yêu cầu đặc biệt:**
- Tạo HTML description đẹp với layout responsive
- Sử dụng thẻ HTML như <h3>, <p>, <ul>, <li>, <strong>, <em>
- Nếu có hình ảnh, embed vào description với thẻ <img> và styling đẹp
- Tạo bố cục hấp dẫn với sections rõ ràng
- Sử dụng CSS inline cho styling

Trả về JSON:
\`\`\`json
{
  "new_title": "Tiêu đề tối ưu hóa",
  "new_description": "HTML description đẹp với layout responsive và hình ảnh"
}
\`\`\``;
        break;

      case 'segmentation':
        prompt = `# Tối Ưu Hóa Nội Dung Cho Phân Khúc Khách Hàng

**Sản phẩm:** ${data.product_title}
**Mô tả gốc:** ${data.product_description}
**Phân khúc:** ${data.segment_data.name}
**Tone:** ${data.tone}
${product?.image_url ? `**Hình ảnh sản phẩm:** ${product.image_url}` : ''}

Hãy tạo tiêu đề và mô tả phù hợp với phân khúc khách hàng này. Nội dung phải thu hút và giải quyết nhu cầu cụ thể của nhóm khách hàng.

**Yêu cầu đặc biệt:**
- Tạo HTML description đẹp với layout responsive
- Sử dụng thẻ HTML như <h3>, <p>, <ul>, <li>, <strong>, <em>
- Nếu có hình ảnh, embed vào description với thẻ <img> và styling đẹp
- Tạo bố cục hấp dẫn với sections rõ ràng
- Sử dụng CSS inline cho styling
- Tập trung vào lợi ích cho phân khúc khách hàng cụ thể

Trả về JSON:
\`\`\`json
{
  "new_title": "Tiêu đề tối ưu hóa",
  "new_description": "HTML description đẹp với layout responsive và hình ảnh"
}
\`\`\``;
        break;

      case 'painpoint':
        prompt = `# Tối Ưu Hóa Nội Dung Dựa Trên Pain Point

**Sản phẩm:** ${data.product_title}
**Mô tả gốc:** ${data.product_description}
**Pain Point:** ${data.painpoint_data.painpoint}
**Khách hàng:** ${data.painpoint_data.customer}
**Tone:** ${data.tone}
${product?.image_url ? `**Hình ảnh sản phẩm:** ${product.image_url}` : ''}

Hãy tạo tiêu đề và mô tả tập trung vào giải quyết pain point cụ thể. Nội dung phải thuyết phục và cho thấy sản phẩm giải quyết vấn đề này như thế nào.

**Yêu cầu đặc biệt:**
- Tạo HTML description đẹp với layout responsive
- Sử dụng thẻ HTML như <h3>, <p>, <ul>, <li>, <strong>, <em>
- Nếu có hình ảnh, embed vào description với thẻ <img> và styling đẹp
- Tạo bố cục hấp dẫn với sections rõ ràng
- Sử dụng CSS inline cho styling
- Tập trung vào giải quyết pain point cụ thể
- Tạo cảm giác cấp thiết và thuyết phục

Trả về JSON:
\`\`\`json
{
  "new_title": "Tiêu đề tối ưu hóa",
  "new_description": "HTML description đẹp với layout responsive và hình ảnh"
}
\`\`\``;
        break;

      default:
        return res.status(400).json({ error: 'Invalid optimization type' });
    }

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'openai/gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Bạn là chuyên gia copywriting và SEO. Trả về CHỈ JSON hợp lệ, không có text thêm, không có markdown formatting.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      },
      {
        headers: {
          'Authorization': `Bearer ${openRouterApiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'Product Optimize',
        },
      }
    );

    const content = response.data.choices[0].message.content;
    
    try {
      // Try to parse JSON response
      let jsonStart = content.indexOf('{');
      if (jsonStart === -1) {
        throw new Error('No JSON found in response');
      }
      
      // Find matching closing brace
      let braceCount = 0;
      let jsonEnd = -1;
      for (let i = jsonStart; i < content.length; i++) {
        if (content[i] === '{') braceCount++;
        if (content[i] === '}') braceCount--;
        if (braceCount === 0) {
          jsonEnd = i;
          break;
        }
      }
      
      if (jsonEnd === -1) {
        throw new Error('Incomplete JSON found');
      }
      
      const jsonString = content.substring(jsonStart, jsonEnd + 1);
      const result = JSON.parse(jsonString);
      
      res.json(result);
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      console.error('Content:', content);
      
      // Fallback response
      res.json({
        new_title: data.product_title,
        new_description: data.product_description
      });
    }
  } catch (error) {
    console.error('Error in optimize:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Load cached suggest data
router.get('/suggest-cache/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    
    const cache = await prisma.suggestCache.findUnique({
      where: { product_id: productId }
    });
    
    if (!cache) {
      return res.status(404).json({ error: 'No cached data found' });
    }
    
    const suggestData = JSON.parse(cache.suggest_data);
    res.json(suggestData);
  } catch (error) {
    console.error('Error loading suggest cache:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Generate Ads for Product Optimize
router.post('/generate-ads/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { platform, mode, format, num_versions, language, model, data } = req.body;
    
    const openRouterApiKey = process.env.OPENROUTER_API_KEY;
    if (!openRouterApiKey) {
      return res.status(500).json({ error: 'OpenRouter API key not configured' });
    }

    // Get product data
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Create prompt based on mode and data
    let prompt = `# Tạo Quảng Cáo ${platform === 'facebook' ? 'Facebook' : platform === 'instagram' ? 'Instagram' : 'TikTok'}

**Sản phẩm:** ${product.name}
**Mô tả:** ${product.description || 'Không có mô tả'}

**Nền tảng:** ${platform}
**Định dạng:** ${format}
**Số phiên bản:** ${num_versions}
**Ngôn ngữ:** ${language || 'vi'}

`;

    if (mode === 'segment' && data.segment_data) {
      prompt += `**Phân khúc khách hàng:** ${data.segment_data.name}
**Độ tuổi:** ${data.segment_data.age_range}
**Vị trí:** ${data.segment_data.locations?.join(', ')}
**Pain points:** ${data.segment_data.common_painpoints?.join(', ')}
`;
    } else if (mode === 'painpoint' && data.painpoint_data) {
      prompt += `**Pain point:** ${data.painpoint_data.painpoint}
**Khách hàng:** ${data.painpoint_data.customer}
`;
    } else if (mode === 'feature' && data.feature_data) {
      prompt += `**Tính năng:** ${data.feature_data.problem}
**Mức độ hài lòng:** ${data.feature_data.satisfaction_percent}%
`;
    } else if (mode === 'keyword' && data.keyword_data) {
      prompt += `**Từ khóa:** ${data.keyword_data.keywords.join(', ')}
`;
    }

    prompt += `
## Yêu cầu:
1. Tạo ${num_versions} phiên bản quảng cáo khác nhau
2. Mỗi phiên bản phải có: ad_headline, ad_copy, cta
3. ${platform === 'tiktok' ? 'Thêm ad_visual_idea cho video script' : ''}
4. Phù hợp với định dạng ${format}
5. Ngôn ngữ ${language || 'tiếng Việt'}

## Trả về JSON:
\`\`\`json
{
  "versions": [
    {
      "ad_headline": "Tiêu đề quảng cáo",
      "ad_copy": "Nội dung quảng cáo chi tiết...",
      "cta": "Call to Action",
      ${platform === 'tiktok' ? '"ad_visual_idea": "Ý tưởng video script",' : ''}
      "expected_performance": "Dự đoán hiệu suất"
    }
  ]
}
\`\`\`

Hãy tạo quảng cáo hấp dẫn và hiệu quả!`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Product Optimize Ads Generator',
      },
      body: JSON.stringify({
        model: model || 'openai/gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Bạn là chuyên gia tạo quảng cáo. Trả về CHỈ JSON hợp lệ, không có text thêm, không có markdown formatting.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 3000,
      })
    });

    const result = await response.json() as any;
    const content = result.choices[0].message.content;
    
    try {
      // Parse JSON response
      let jsonStart = content.indexOf('{');
      if (jsonStart === -1) {
        throw new Error('No JSON found in response');
      }
      
      let braceCount = 0;
      let jsonEnd = -1;
      for (let i = jsonStart; i < content.length; i++) {
        if (content[i] === '{') braceCount++;
        if (content[i] === '}') braceCount--;
        if (braceCount === 0) {
          jsonEnd = i;
          break;
        }
      }
      
      if (jsonEnd === -1) {
        throw new Error('Incomplete JSON found');
      }
      
      const jsonString = content.substring(jsonStart, jsonEnd + 1);
      const adResult = JSON.parse(jsonString);
      
      res.json(adResult);
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      console.error('Content:', content);
      
      // Fallback response
      res.json({
        versions: [
          {
            ad_headline: `Khám phá ${product.name} - Giải pháp hoàn hảo cho bạn`,
            ad_copy: `${product.description || 'Sản phẩm chất lượng cao với nhiều tính năng vượt trội. Được thiết kế để mang lại trải nghiệm tuyệt vời cho người dùng.'}\n\n✨ Chất lượng đảm bảo\n🚀 Giao hàng nhanh chóng\n💯 Hỗ trợ 24/7`,
            cta: "Mua ngay",
            ...(platform === 'tiktok' && { ad_visual_idea: "Video 15 giây: Hiển thị sản phẩm từ nhiều góc độ, nhấn mạnh tính năng chính, kết thúc với CTA mạnh mẽ" }),
            expected_performance: "Dự kiến CTR cao với targeting chính xác"
          }
        ]
      });
    }
  } catch (error) {
    console.error('Error in generate-ads:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Advanced Optimize API - supports multiple variants and advanced options
router.post('/optimize-advanced', async (req, res) => {
  try {
    const {
      product_title,
      product_description,
      features_keywords,
      special_instructions,
      tone,
      optimization_goal,
      customer_segment,
      target_platform,
      target_market,
      main_keywords,
      painpoint,
      brand_tone_reference,
      include_emoji,
      include_hashtags,
      include_cta,
      output_format,
      language_output,
      num_variants,
      product_id
    } = req.body;
    
    const openRouterApiKey = process.env.OPENROUTER_API_KEY;
    if (!openRouterApiKey) {
      return res.status(500).json({ error: 'OpenRouter API key not configured' });
    }

    // Get product image if product_id is provided
    let productImageUrl = null;
    if (product_id) {
      const product = await prisma.product.findUnique({
        where: { id: product_id }
      });
      productImageUrl = product?.image_url;
    }

    // Build concise prompt
    let prompt = `# Product Content Optimization

**Product:** ${product_title}
**Description:** ${product_description || 'N/A'}
${features_keywords ? `**Features:** ${features_keywords}` : ''}
${painpoint ? `**Pain Point:** ${painpoint}` : ''}
${main_keywords && main_keywords.length > 0 ? `**Keywords:** ${main_keywords.join(', ')}` : ''}

**Settings:** Tone: ${tone}, Goal: ${optimization_goal}, Market: ${target_market}, Lang: ${language_output}
${include_emoji ? 'Add emojis. ' : ''}${include_hashtags ? 'Add hashtags. ' : ''}${include_cta ? 'Add CTA. ' : ''}
${special_instructions ? `Instructions: ${special_instructions}` : ''}

**Task:** Generate ${num_variants} variant(s). Each variant must have:
- "title": SEO-optimized title
- "description": HTML description with modern styling (gradients, cards, spacing)
${include_hashtags ? `- "hashtags": Array of ${main_keywords && main_keywords.length > 0 ? main_keywords.map((k: string) => '#' + k.replace(/\s+/g, '')).join(', ') : 'relevant hashtags'}` : ''}

**Copywriting:** Emotional hooks, benefit-driven, power words, specificity, urgency.
**HTML Design:** Modern gradients, rounded corners, highlight boxes, clear hierarchy.

{ "variants": [{ "variant_name": "name", "optimization_focus": "focus", "new_title": "title", "new_description": "HTML description" }] }`;

    // Call OpenRouter API
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'openai/gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an ELITE e-commerce copywriter, conversion optimization expert, and master storyteller. You've generated millions in revenue through compelling product copy. You understand psychology, persuasion, and what makes people click "Buy Now". 

Your writing is:
- Emotionally engaging and benefit-driven (not feature-focused)
- Uses vivid, sensory language that creates mental images
- Incorporates storytelling and social proof naturally
- Creates urgency and exclusivity without being pushy
- Modern, fresh, and never boring or generic

You also excel at creating STUNNING, modern HTML designs with beautiful gradients, perfect spacing, and visual hierarchy.

Language: ${language_output}

Return ONLY valid JSON, no markdown code blocks, no extra text. Make every word count. Make it ELITE! 💎`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.95, // High temperature for maximum creativity
        max_tokens: 5000, // Increased for more detailed content
      },
      {
        headers: {
          'Authorization': `Bearer ${openRouterApiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'Product Optimize Advanced',
        },
      }
    );

    const content = response.data.choices[0].message.content;
    
    try {
      // Parse JSON response
      let jsonStart = content.indexOf('{');
      if (jsonStart === -1) {
        throw new Error('No JSON found in response');
      }
      
      let braceCount = 0;
      let jsonEnd = -1;
      for (let i = jsonStart; i < content.length; i++) {
        if (content[i] === '{') braceCount++;
        if (content[i] === '}') braceCount--;
        if (braceCount === 0) {
          jsonEnd = i;
          break;
        }
      }
      
      if (jsonEnd === -1) {
        throw new Error('Incomplete JSON found');
      }
      
      const jsonString = content.substring(jsonStart, jsonEnd + 1);
      const result = JSON.parse(jsonString);
      
      // Ensure variants array exists
      if (!result.variants || !Array.isArray(result.variants)) {
        throw new Error('Invalid response format: missing variants array');
      }

      // Add variant names if missing
      result.variants = result.variants.map((variant: any, index: number) => ({
        variant_name: variant.variant_name || `Version ${index + 1}`,
        optimization_focus: variant.optimization_focus || optimization_goal,
        new_title: variant.new_title,
        new_description: variant.new_description
      }));
      
      res.json(result);
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      console.error('Content:', content);
      
      // Fallback: Generate simple variants
      const fallbackVariants = [];
      for (let i = 0; i < num_variants; i++) {
        fallbackVariants.push({
          variant_name: `Version ${i + 1}`,
          optimization_focus: optimization_goal,
          new_title: `${product_title}${include_emoji ? ' ✨' : ''} - ${
            i === 0 ? 'Best Quality' : i === 1 ? 'Premium Choice' : 'Top Rated'
          }`,
          new_description: `<div style="font-family: Arial, sans-serif; line-height: 1.8;">
            <h3 style="color: #333; font-size: 1.2em; margin-bottom: 12px;">${include_emoji ? '🌟' : ''}${product_title}</h3>
            <p style="color: #555; margin-bottom: 15px;">${product_description || 'High-quality product with excellent features.'}</p>
            ${features_keywords ? `<p style="color: #555;"><strong>Features:</strong> ${features_keywords}</p>` : ''}
            ${productImageUrl ? `<img src="${productImageUrl}" style="max-width: 100%; border-radius: 8px; margin: 15px 0;" alt="${product_title}" />` : ''}
            <ul style="list-style: none; padding-left: 0; margin: 15px 0;">
              <li style="margin-bottom: 8px;">${include_emoji ? '✅' : '•'} Premium quality guarantee</li>
              <li style="margin-bottom: 8px;">${include_emoji ? '🚀' : '•'} Fast shipping available</li>
              <li style="margin-bottom: 8px;">${include_emoji ? '💯' : '•'} 24/7 customer support</li>
            </ul>
            ${include_cta ? `<div style="margin-top: 20px; padding: 15px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 8px; text-align: center; font-weight: bold;">
              ${include_emoji ? '🛒' : ''} Order Now - Limited Stock!
            </div>` : ''}
            ${include_hashtags ? `<p style="color: #888; margin-top: 15px; font-size: 0.9em;">${main_keywords && main_keywords.length > 0 ? main_keywords.map((k: string) => '#' + k.replace(/\s+/g, '')).join(' ') : '#quality #product #bestseller'}</p>` : ''}
          </div>`
        });
      }
      
      res.json({ variants: fallbackVariants });
    }
  } catch (error) {
    console.error('Error in optimize-advanced:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Generate Landing Page for Product
router.post('/generate-landing-page', async (req, res) => {
  try {
    const {
      product_id,
      product_title,
      product_description,
      product_image,
      target_audience,
      usp,
      pain_points,
      key_benefits,
      pricing,
      cta_text,
      landing_goal,
      color_scheme,
      ai_model, // Model selection
      include_testimonials,
      include_faq,
      include_pricing,
      language
    } = req.body;
    
    const openRouterApiKey = process.env.OPENROUTER_API_KEY;
    if (!openRouterApiKey) {
      return res.status(500).json({ error: 'OpenRouter API key not configured' });
    }

    // Map color scheme to actual colors - Beautiful, modern palettes
    const colorSchemes: Record<string, any> = {
      'luxury-gold': {
        primary: '#d4af37',
        secondary: '#1a1a1a',
        accent: '#f4d03f',
        text: '#1a1a1a',
        name: '💎 Luxury Gold - Sang trọng, đẳng cấp'
      },
      'rose-gold': {
        primary: '#e8b4b8',
        secondary: '#c9a0dc',
        accent: '#ffc0cb',
        text: '#4a4a4a',
        name: '🌹 Rose Gold - Nữ tính, tinh tế'
      },
      'ocean-blue': {
        primary: '#0077be',
        secondary: '#0099cc',
        accent: '#00d4ff',
        text: '#1a1a1a',
        name: '🌊 Ocean Blue - Chuyên nghiệp, tin cậy'
      },
      'sunset-orange': {
        primary: '#ff6b35',
        secondary: '#f7931e',
        accent: '#ffc107',
        text: '#2d2d2d',
        name: '🌅 Sunset Orange - Năng động, sáng tạo'
      },
      'forest-green': {
        primary: '#2d6a4f',
        secondary: '#52b788',
        accent: '#95d5b2',
        text: '#1b4332',
        name: '🌿 Forest Green - Tự nhiên, thân thiện môi trường'
      },
      'royal-purple': {
        primary: '#6a0dad',
        secondary: '#9b59b6',
        accent: '#ba68c8',
        text: '#2d2d2d',
        name: '👑 Royal Purple - Quý phái, sang trọng'
      },
      'elegant-black': {
        primary: '#1a1a1a',
        secondary: '#4a4a4a',
        accent: '#d4af37',
        text: '#1a1a1a',
        name: '🖤 Elegant Black - Tối giản, hiện đại'
      },
      'coral-pink': {
        primary: '#ff6b9d',
        secondary: '#ff8fab',
        accent: '#ffb3c6',
        text: '#2d2d2d',
        name: '🌸 Coral Pink - Trẻ trung, dễ thương'
      }
    };

    const colors = colorSchemes[color_scheme] || colorSchemes['ocean-blue']; // Default: Ocean Blue

    // Map landing goal to CTA strategy
    const goalStrategies: Record<string, string> = {
      'direct_sale': 'Direct call-to-action for immediate purchase with urgency and scarcity',
      'lead_generation': 'Focus on collecting email/contact info with lead magnet or free trial',
      'pre_order': 'Build excitement for upcoming launch with waitlist/early bird offers',
      'learn_more': 'Educational approach with detailed information and gradual conversion'
    };

    const ctaStrategy = goalStrategies[landing_goal] || goalStrategies['direct_sale'];

    // Build landing page prompt with premium template reference
    const prompt = `# Elite Landing Page Generator

YOU ARE A WORLD-CLASS LANDING PAGE DESIGNER. Create a STUNNING, high-converting HTML landing page.

## Design Inspiration Reference
Study and apply design excellence from premium templates:
**Suxnix Homepage:** https://themegenix.net/wp/suxnix/
**Suxnix Product Page:** https://themegenix.net/wp/suxnix/product/sneaky-supplements/

### Landing Page Structure (Apply These Standards):
- **Hero Section:** Full-width gradient overlay, product image (float animation), compelling headline, subheadline, prominent CTA
- **Visual Hierarchy:** Large headings (3-4em), clear sections with 80-100px padding
- **Product Showcase:**
  - Large product image with zoom/lightbox effect
  - Price display (original + sale price with strikethrough)
  - 5-star rating display
  - Clear SKU, category, tags
  - Prominent "Add to Cart" / CTA button (gradient, large, with hover effect)
- **Description Sections:**
  - "The True Strength of [Product]" - Detailed benefits paragraph
  - "The Basics" - Bullet point list with checkmarks
  - Each section with clear H4 headings
- **Cards Design:** Rounded corners (15-20px), subtle shadows, hover effects (scale 1.05)
- **Color Gradients:** Smooth linear-gradient(135deg, color1, color2)
- **Icons & Emojis:** Strategic use for visual interest (✓, ⭐, 🚀, 💎, 📦)
- **Typography:** Modern sans-serif, line-height 1.6-1.8
- **Section Flow:** Hero → Problem → Product Showcase → Features → Benefits → Pricing → Testimonials → FAQ → CTA
- **Trust Elements:** Badges, guarantees, "5.00 out of 5" ratings, security icons
- **Related Products:** Grid of 3-4 related items (if applicable)
- **CSS Animations:** Float, pulse, fadeInUp, hover transforms

## Product Info
- **Name:** ${product_title}
- **Description:** ${product_description}
${product_image ? `- **Image:** ${product_image}` : ''}
- **Target:** ${target_audience}
- **USP:** ${usp}
${pain_points ? `- **Pain Points:** ${pain_points}` : ''}
- **Benefits:** ${key_benefits}
${pricing ? `- **Price:** ${pricing}` : ''}

## 🎨 CRITICAL COLOR SCHEME (MUST APPLY EXACTLY)
**YOU MUST USE THESE EXACT COLORS THROUGHOUT THE ENTIRE PAGE:**
- **Primary Color:** ${colors.primary} (Main buttons, headlines, CTAs, primary sections)
- **Secondary Color:** ${colors.secondary} (Secondary buttons, accents, borders)
- **Accent Color:** ${colors.accent} (Highlights, hover states, badges)
- **Text Color:** ${colors.text} (All text content)

**COLOR USAGE RULES (MANDATORY):**
1. All CTA buttons MUST use: background: linear-gradient(135deg, ${colors.primary}, ${colors.secondary})
2. All section headings (H1, H2) MUST use: color: ${colors.primary}
3. All hover effects MUST use: ${colors.accent}
4. All borders/accents MUST use: ${colors.accent}
5. All body text MUST use: color: ${colors.text}
6. Hero section background: linear-gradient(135deg, ${colors.primary}20, ${colors.secondary}20)
7. Cards gradient backgrounds: Use variations of primary/secondary with transparency

## Design Specifications
- **Goal:** ${landing_goal} - ${ctaStrategy}
- **CTA:** "${cta_text}"
- **Language:** ${language}
- **Sections:** Hero, Product Showcase, Benefits, Features${include_testimonials ? ', Testimonials' : ''}${include_faq ? ', FAQ' : ''}${include_pricing ? ', Pricing' : ''}, Final CTA

## Mandatory Requirements
1. **Complete HTML** with inline CSS (no external files, all styles in <style> tag)
2. **Premium Modern Design**:
   - Smooth gradients (linear-gradient with 2-3 colors)
   - Card shadows: box-shadow: 0 10px 30px rgba(0,0,0,0.1)
   - Rounded corners: 15-25px border-radius
   - Full-width sections with max-width: 1200px containers
3. **Sticky Header**: Fixed navigation with logo, menu, CTA button, smooth scroll links
4. **Hero Section** (100vh or 600px min-height):
   - Gradient overlay background
   - H1 headline (3-4em) with emotional hook
   - Subheadline explaining benefit (1.2em)
   - ${product_image ? 'Product image with CSS float/pulse animation' : 'Gradient background with shape decorations'}
   - Prominent CTA button (60px height, gradient, shadow, hover transform)
5. **Product Showcase Section** (Apply Suxnix Product Page Style):
   - Grid layout: Product image left (40%), Details right (60%)
   - Large product image with border-radius: 15px, box-shadow
   - 5-star rating: ⭐⭐⭐⭐⭐ (5.00 out of 5)
   - Product title H2 (2em, bold)
   - Price display: ${pricing ? `~~Original ${pricing}~~ **Sale Price** (strikethrough + green)` : 'Prominent pricing with discount badge'}
   - SKU, Category, Tags in small gray text
   - Short product summary (2-3 sentences)
   - Large "Add to Cart" button (gradient, 60px height, icon)
   - Trust badges below button (Free Shipping, Guarantee, etc.)
6. **Description Sections**:
   - H4: "The True Strength of ${product_title}"
   - Full paragraph explaining unique benefits
   - H4: "The Basics:"
   - Bullet list with ✓ checkmarks for key features
7. **Problem/Pain Points**: 3 cards with icons, yellow/orange gradients, clear problem statements
8. **Benefits Section**: ${key_benefits.split(',').length} benefit cards
   - Icon or emoji for each
   - Gradient backgrounds (different colors per card)
   - Hover: scale(1.05), enhanced shadow
9. **Features Section**: Grid layout (2-3 columns) with checkmarks/icons
${include_testimonials ? '10. **Testimonials Section** (Like Product Reviews):\n   - 3 customer testimonials with 5-star ratings ⭐⭐⭐⭐⭐\n   - Profile photo (CSS circle), name, date\n   - Quote styling with borders\n   - "5.00 out of 5" aggregate rating display' : ''}
${include_faq ? '11. **FAQ Accordion**: 5-7 Q&As, collapsible with CSS (details/summary), style with borders' : ''}
${include_pricing ? `12. **Pricing Section**: 1-3 pricing tiers (like product variants), highlight ${pricing || 'best value'}, feature checkmarks, CTA buttons` : ''}
13. **Final CTA Section**: Full-width, gradient background, large heading, urgency text, CTA button
14. **Trust Elements Row**: Badges (✓ Free Shipping, ✓ Money-back Guarantee, ✓ 24/7 Support, ✓ Secure Checkout)
15. **Footer**: Company info, links, social icons (CSS only)
16. **Mobile Responsive**: Media queries for ≤768px, ≤480px (Stack product showcase, full-width cards)
17. **CSS Animations**: 
   - @keyframes float, pulse, fadeInUp
   - Hover transforms on cards/buttons
   - Smooth transitions (0.3s ease)

## 🎨 DESIGN REQUIREMENTS

**Fonts:** Google Fonts - Oswald (headings) + Roboto (body)
**Colors:** Primary ${colors.primary}, Secondary ${colors.secondary}, Accent ${colors.accent}, Text ${colors.text}
**Layout:** .container (max-width: 1200px), sections (100px padding), responsive

**Typography:** H1 3.5rem/Oswald, H2 2.5rem/Oswald, P 1.1rem/Roboto, line-height 1.8
**Buttons:** Gradient (primary→secondary), 50px radius, 18px×48px padding, hover: translateY(-3px)
**Cards:** 20px radius, 40px padding, 5px left border (accent), hover: translateY(-8px)

**Structure:** Hero → Product Showcase → Description → Benefits → ${include_testimonials ? 'Testimonials → ' : ''}${include_faq ? 'FAQ → ' : ''}${include_pricing ? 'Pricing → ' : ''}Final CTA → Footer

**Critical:** Return ONLY complete HTML. Use inline CSS. Apply colors exactly as specified. Professional e-commerce design like Suxnix template.`;

    // Use selected model or default to DeepSeek V3.2
    const selectedModel = ai_model || 'deepseek/deepseek-v3.2-exp';
    console.log(`🤖 Generating landing page with model: ${selectedModel}`);

    // Call OpenRouter API with dynamic model selection
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: selectedModel, // Dynamic model selection for testing/comparison
        messages: [
          {
            role: 'system',
            content: 'You are an elite landing page designer and conversion copywriter. You create STUNNING, modern, high-converting HTML landing pages with beautiful inline CSS, smooth animations, and compelling copy. Return ONLY the complete HTML code starting with <!DOCTYPE html>, no markdown formatting, no explanations.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.85,
        max_tokens: 8000, // DeepSeek can handle more tokens
      },
      {
        headers: {
          'Authorization': `Bearer ${openRouterApiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'Landing Page Generator',
        },
      }
    );

    // Debug log the full response
    console.log('🔍 OpenRouter Response Status:', response.status);
    console.log('🔍 OpenRouter Response Data:', JSON.stringify(response.data, null, 2));

    // Check if response has the expected structure
    if (!response.data || !response.data.choices || response.data.choices.length === 0) {
      console.error('❌ Invalid API response structure:', response.data);
      return res.status(500).json({ 
        error: 'Invalid response from AI service',
        details: 'The AI model did not return a valid response. Please try again or select a different model.',
        debug: response.data
      });
    }

    let htmlContent = response.data.choices[0].message.content;
    
    if (!htmlContent) {
      console.error('❌ Empty content from AI model');
      return res.status(500).json({ 
        error: 'Empty response from AI service',
        details: 'The AI model returned an empty response. Please try again.'
      });
    }

    console.log('✅ Got HTML content, length:', htmlContent.length);
    
    // Extract HTML if wrapped in markdown
    const htmlMatch = htmlContent.match(/```html\s*([\s\S]*?)\s*```/);
    if (htmlMatch) {
      htmlContent = htmlMatch[1];
    } else if (htmlContent.includes('```')) {
      // Remove any markdown code blocks
      htmlContent = htmlContent.replace(/```[\s\S]*?\n/g, '').replace(/```/g, '');
    }
    
    // Ensure it starts with DOCTYPE
    if (!htmlContent.trim().startsWith('<!DOCTYPE')) {
      const doctypeMatch = htmlContent.match(/(<!DOCTYPE[\s\S]*)/i);
      if (doctypeMatch) {
        htmlContent = doctypeMatch[1];
      }
    }

    res.json({ 
      html: htmlContent.trim(),
      success: true 
    });
  } catch (error: any) {
    console.error('❌ Error generating landing page:', error);
    console.error('Error details:', error.response?.data || error.message);
    
    // Handle rate limit errors specifically
    if (error.response?.status === 429) {
      return res.status(429).json({ 
        error: 'Rate limit exceeded. Please wait a moment and try again.',
        details: 'The AI service is temporarily unavailable. Please try again in 30 seconds.'
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to generate landing page',
      message: error.message || 'Internal server error'
    });
  }
});

export default router;
