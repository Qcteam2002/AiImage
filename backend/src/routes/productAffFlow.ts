import express, { Request, Response } from 'express';
import { prisma } from '../database/client';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import axios from 'axios';

const router = express.Router();

// Get all products
router.get('/', authenticate,   async (req: Request, res: Response) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
    console.log('🔍 [ProductAff] GET / - Fetching products');
    const { search, status, limit = 50, offset = 0 } = req.query;
    const userId = authenticatedReq.user?.id;

    if (!userId) {
      console.log('❌ [ProductAff] GET / - Unauthorized: No userId');
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const where: any = {
      userId: userId,
    };

    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
        { target_market: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    const [products, total] = await Promise.all([
      prisma.productAff.findMany({
        where,
        orderBy: { created_at: 'desc' },
        take: Number(limit),
        skip: Number(offset),
      }),
      prisma.productAff.count({ where }),
    ]);

    res.json({
      products,
      total,
      limit: Number(limit),
      offset: Number(offset),
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get single product
router.get('/:id', authenticate,   async (req: Request, res: Response) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
    const { id } = req.params;
    const userId = authenticatedReq.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const product = await prisma.productAff.findFirst({
      where: {
        id: id,
        userId: userId,
      },
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new product
router.post('/', authenticate,   async (req: Request, res: Response) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
    console.log('➕ [ProductAff] POST / - Creating new product');
    const { target_market, image1, image2, title, description, language = 'vi', segmentation_number = 3 } = req.body;
    const userId = authenticatedReq.user?.id;

    if (!userId) {
      console.log('❌ [ProductAff] POST / - Unauthorized: No userId');
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!target_market || !image1) {
      return res.status(400).json({ message: 'Target market and image1 are required' });
    }

    const product = await prisma.productAff.create({
      data: {
        target_market,
        image1,
        image2,
        title,
        description,
        language,
        segmentation_number,
        status: 'waiting',
        userId: userId,
      },
    });

    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update product
router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const authenticatedReq = req as AuthenticatedRequest;
    console.log('✏️ [ProductAff] PUT /:id - Updating product');
    const { id } = req.params;
    const { target_market, image1, image2, title, description } = req.body;
    const userId = authenticatedReq.user?.id;

    if (!userId) {
      console.log('❌ [ProductAff] PUT /:id - Unauthorized: No userId');
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Check if product exists and belongs to user
    const existingProduct = await prisma.productAff.findFirst({
      where: {
        id: id,
        userId: userId,
      },
    });

    if (!existingProduct) {
      console.log('❌ [ProductAff] PUT /:id - Product not found:', id);
      return res.status(404).json({ message: 'Product not found' });
    }

    // Only allow updating if status is not processing
    if (existingProduct.status === 'processing') {
      return res.status(400).json({ message: 'Cannot update product while analysis is in progress' });
    }

    const updateData: any = {};
    if (target_market !== undefined) updateData.target_market = target_market;
    if (image1 !== undefined) updateData.image1 = image1;
    if (image2 !== undefined) updateData.image2 = image2;
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;

    const updatedProduct = await prisma.productAff.update({
      where: { id: id },
      data: updateData,
    });

    console.log('✅ [ProductAff] PUT /:id - Product updated successfully');
    res.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Analyze product
router.post('/:id/analyze', authenticate,   async (req: Request, res: Response) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
    console.log('🤖 [ProductAff] POST /:id/analyze - Starting analysis');
    const { id } = req.params;
    const userId = authenticatedReq.user?.id;

    if (!userId) {
      console.log('❌ [ProductAff] POST /:id/analyze - Unauthorized: No userId');
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const product = await prisma.productAff.findFirst({
      where: {
        id: id,
        userId: userId,
      },
    });

    if (!product) {
      console.log('❌ [ProductAff] POST /:id/analyze - Product not found:', id);
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user has enough credits
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { credits: true }
    });

    if (!user) {
      console.log('❌ [ProductAff] POST /:id/analyze - User not found:', userId);
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.credits < 1) {
      console.log('❌ [ProductAff] POST /:id/analyze - Insufficient credits:', user.credits);
      return res.status(400).json({ 
        message: 'Insufficient credits. You need at least 1 credit to analyze a product.',
        credits: user.credits
      });
    }

    console.log('📝 [ProductAff] POST /:id/analyze - Product found:', {
      id: product.id,
      target_market: product.target_market,
      title: product.title
    });
    console.log('💰 [ProductAff] POST /:id/analyze - User credits:', user.credits);

    // Update status to processing
    await prisma.productAff.update({
      where: { id: id },
      data: { status: 'processing' },
    });
    console.log('🔄 [ProductAff] POST /:id/analyze - Status updated to processing');

    try {
      console.log('🚀 [ProductAff] POST /:id/analyze - Calling OpenRouter API');
      // Get current date for AI context
      const currentDate = new Date().toLocaleDateString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      console.log('📅 [ProductAff] POST /:id/analyze - Current date:', currentDate);
      
      // Call OpenRouter API for analysis with current date
      const analysisResult = await analyzeProductWithAI(product, product.language || 'vi', product.segmentation_number || 3, currentDate);
      console.log('✅ [ProductAff] POST /:id/analyze - AI analysis completed');
      
      // Update product with analysis result and deduct credit
      const updatedProduct = await prisma.$transaction(async (tx) => {
        // Update product status
        const updatedProduct = await tx.productAff.update({
        where: { id: id },
        data: {
          status: 'done',
          analysis_result: JSON.stringify(analysisResult),
          analyzed_at: new Date(),
        },
        });

        // Deduct 1 credit from user
        const updatedUser = await tx.user.update({
          where: { id: userId },
          data: {
            credits: {
              decrement: 1
            }
          },
          select: {
            id: true,
            email: true,
            credits: true
          }
        });

        console.log(`💰 [ProductAff] POST /:id/analyze - Credit deducted. User ${userId} now has ${updatedUser.credits} credits`);
        
        return updatedProduct;
      });

      res.json(updatedProduct);
    } catch (aiError) {
      console.error('AI Analysis error:', aiError);
      
      // Update status to error
      await prisma.productAff.update({
        where: { id: id },
        data: { status: 'error' },
      });

      res.status(500).json({ message: 'AI analysis failed' });
    }
  } catch (error) {
    console.error('Error analyzing product:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete product
router.delete('/:id', authenticate,   async (req: Request, res: Response) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
    const { id } = req.params;
    const userId = authenticatedReq.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const product = await prisma.productAff.findFirst({
      where: {
        id: id,
        userId: userId,
      },
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await prisma.productAff.delete({
      where: { id: id },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// AI Analysis function
async function analyzeProductWithAI(product: any, language: string = 'vi', segmentationNumber: number = 3, currentDate?: string) {
  const openRouterApiKey = process.env.OPENROUTER_API_KEY;
  
  if (!openRouterApiKey) {
    throw new Error('OpenRouter API key not configured');
  }

  // Language configuration
  const isVietnamese = language === 'vi';
  const languageConfig = {
    vi: {
      title: "Phân tích sản phẩm",
      context: "Tôi đang nghiên cứu và đánh giá tiềm năng kinh doanh của một sản phẩm theo hình thức **dropship hoặc affiliate**. Tôi cần một bản phân tích thị trường chi tiết, có cấu trúc logic, insight rõ ràng, để:",
      goals: [
        "Xác định khả năng bán hàng của sản phẩm",
        "Hiểu khách hàng mục tiêu đủ sâu để chọn kênh, angle, cách làm content",
        "Thiết kế các nội dung truyền thông hiệu quả (video, ads, caption…)"
      ],
      role: "Bạn là chuyên gia phân tích thị trường, hành vi khách hàng và chiến lược nội dung thương mại điện tử.",
      instruction: "Bạn không cần làm sản phẩm, chỉ cần giúp tôi *bán sản phẩm người khác làm* thông qua **content hiệu quả & insight đúng**.",
      requirement: "Khi tôi gửi tên sản phẩm + hình ảnh, thì bạn cần phải tìm kiếm các nguồn website uy tính và sau đó bạn cần trả về đầy đủ các phần sau, yêu cầu tất cả cần phải có số liệu chứng minh, data rõ ràng:"
    },
    en: {
      title: "Product Analysis",
      context: "I am researching and evaluating the business potential of a product through **dropship or affiliate** model. I need a detailed market analysis with logical structure and clear insights to:",
      goals: [
        "Determine the product's sales potential",
        "Understand target customers deeply enough to choose channels, angles, and content strategies",
        "Design effective communication content (videos, ads, captions...)"
      ],
      role: "You are a market analysis expert, customer behavior and e-commerce content strategy specialist.",
      instruction: "You don't need to make products, just help me *sell other people's products* through **effective content & correct insights**.",
      requirement: "When I send product name + images, you need to search reliable websites and then return all the following sections, requiring all to have supporting data and clear evidence:"
    }
  };

  const config = languageConfig[language as keyof typeof languageConfig] || languageConfig.vi;

  // Generate dynamic JSON template based on language
  const generateJsonTemplate = (isVietnamese: boolean) => {
    if (isVietnamese) {
      return `{
  "executive_summary": {
    "recommendation": "Gợi ý có nên bán hay không và tại sao",
    "key_points": [
      "Luận điểm 1",
      "Luận điểm 2", 
      "Luận điểm 3",
      "Luận điểm 4 (nếu có)"
    ],
    "biggest_opportunity": "Nội dung cơ hội (chi tiết vì sao đây là cơ hội lớn càng chi tiết càng tốt)",
    "biggest_risk": "Nội dung rủi ro (có sô liệu cụ thể càng chi tiêt càng tốt, ví dụ tạo sao có rủi ro đó bao nhiêu %)"
  },
  "market_and_keywords": {
    "sales_potential": "Cao / Trung bình / Thấp",
    "market_size_usd": 0,
    "cagr_percent": 0,
    "google_trends_change_percent": 0,
    "marketplace_data": {
      "aliexpress": {
        "listings": 0,
        "sales_per_month": 0,
        "growth_percent": null
      },
      "etsy": {
        "listings": 0,
        "sales_per_month": 0,
        "growth_percent": null
      },
      "amazon": {
        "listings": 0,
        "sales_per_month": 0,
        "growth_percent": null
      },
      "shopee": {
        "listings": 0,
        "sales_per_month": 0,
        "growth_percent": null
      }
    },
    "keywords": {
      "informational": [
        { "keyword": "", "volume": 0, "cpc": 0, "competition": "" }
      ],
      "transactional": [
        { "keyword": "", "volume": 0, "cpc": 0, "competition": "" }
      ],
      "comparative": [
        { "keyword": "", "volume": 0, "cpc": 0, "competition": "" }
      ],
      "painpoint_related": [
        { "keyword": "", "volume": 0, "cpc": 0, "competition": "" }
      ]
    },
    "sources": ["Statista", "GVR", "Marketplace Pulse", "TikTok Trends"]
  },
  "product_problems": {
    "resolved": [
      { "problem": "Vấn đề", "satisfaction_percent": 0 }
    ],
    "unresolved": [
      {
        "problem": "Vấn đề",
        "unsatisfied_percent": 0,
        "example_feedback": "Trích dẫn review nếu có"
      }
    ]
  }`;
    } else {
      return `{
  "executive_summary": {
    "recommendation": "Recommendation on whether to sell or not and why",
    "key_points": [
      "Key point 1",
      "Key point 2", 
      "Key point 3",
      "Key point 4 (if any)"
    ],
    "biggest_opportunity": "Opportunity content (detailed why this is a big opportunity, the more detailed the better)",
    "biggest_risk": "Risk content (with specific data, the more detailed the better, e.g. why this risk exists, what percentage)"
  },
  "market_and_keywords": {
    "sales_potential": "High / Medium / Low",
    "market_size_usd": 0,
    "cagr_percent": 0,
    "google_trends_change_percent": 0,
    "marketplace_data": {
      "aliexpress": {
        "listings": 0,
        "sales_per_month": 0,
        "growth_percent": null
      },
      "etsy": {
        "listings": 0,
        "sales_per_month": 0,
        "growth_percent": null
      },
      "amazon": {
        "listings": 0,
        "sales_per_month": 0,
        "growth_percent": null
      },
      "shopee": {
        "listings": 0,
        "sales_per_month": 0,
        "growth_percent": null
      }
    },
    "keywords": {
      "informational": [
        { "keyword": "", "volume": 0, "cpc": 0, "competition": "" }
      ],
      "transactional": [
        { "keyword": "", "volume": 0, "cpc": 0, "competition": "" }
      ],
      "comparative": [
        { "keyword": "", "volume": 0, "cpc": 0, "competition": "" }
      ],
      "painpoint_related": [
        { "keyword": "", "volume": 0, "cpc": 0, "competition": "" }
      ]
    },
    "sources": ["Statista", "GVR", "Marketplace Pulse", "TikTok Trends"]
  },
  "product_problems": {
    "resolved": [
      { "problem": "Problem", "satisfaction_percent": 0 }
    ],
    "unresolved": [
      {
        "problem": "Problem",
        "unsatisfied_percent": 0,
        "example_feedback": "Quote review if available"
      }
    ]
  }`;
    }
  };

  // Generate dynamic target_customers template
  const generateTargetCustomersTemplate = (count: number, isVietnamese: boolean) => {
    const template = [];
    for (let i = 1; i <= count; i++) {
      template.push(`  {
    "name": "${isVietnamese ? 'Tên nhóm khách hàng' : 'Customer Group'} ${i}",
    "market_share_percent": 0,
    "gender_ratio": { "male": 0, "female": 0 },
    "age_range": "xx–yy",
    "occupations": [],
    "locations": ["${isVietnamese ? 'Thành phố 1' : 'City 1'}", "${isVietnamese ? 'Thành phố 2' : 'City 2'}", "${isVietnamese ? 'Thành phố 3' : 'City 3'}"],
    "purchase_frequency": "${isVietnamese ? 'Theo mùa / Thường xuyên / Dịp lễ' : 'Seasonal / Regular / Holiday'}",
    "average_budget_usd": 0,
    "buying_behavior": "${isVietnamese ? 'Tìm gì? Mua ở đâu? Quyết định dựa vào?' : 'What do they search? Where do they buy? What influences decisions?'}",
    "usage_context": "${isVietnamese ? 'Dùng ở đâu, với ai, mục đích gì?' : 'Where do they use it, with whom, for what purpose?'}",
    "emotional_motivations": "${isVietnamese ? 'Cảm giác mong muốn' : 'Desired feelings'}",
    "common_painpoints": [
      "${isVietnamese ? 'Vấn đề 1' : 'Problem 1'}",
      "${isVietnamese ? 'Vấn đề 2' : 'Problem 2'}"
    ],
    "main_channels": ["TikTok", "Facebook", "Pinterest", "Google"],
    "repurchase_or_upsell": {
      "exists": true,
      "estimated_percent": 0
    },
    "painpoint_levels": {
      "high": {
        "percent": 0,
        "description": "${isVietnamese ? 'Mô tả vấn đề mức độ cao' : 'High-level problem description'}"
      },
      "medium": {
        "percent": 0,
        "description": "${isVietnamese ? 'Mô tả vấn đề mức độ trung bình' : 'Medium-level problem description'}"
      },
      "low": {
        "percent": 0,
        "description": "${isVietnamese ? 'Mô tả vấn đề mức độ thấp' : 'Low-level problem description'}"
      }
    },
    "solutions_and_content": [
      {
        "pain_point": "${isVietnamese ? 'Tên vấn đề' : 'Problem name'} 1",
        "percent_of_customers": 0,
        "usp": "${isVietnamese ? 'Giải pháp chính' : 'Main solution'}",
        "content_hook": "${isVietnamese ? 'Hook content dùng cho video/caption' : 'Content hook for video/caption'}",
        "ad_visual_idea": "${isVietnamese ? 'Kịch bản hình/video ngắn' : 'Short visual/video script'}"
      },
      {
        "pain_point": "${isVietnamese ? 'Tên vấn đề' : 'Problem name'} 2",
        "percent_of_customers": 0,
        "usp": "${isVietnamese ? 'Giải pháp chính' : 'Main solution'}",
        "content_hook": "${isVietnamese ? 'Hook content dùng cho video/caption' : 'Content hook for video/caption'}",
        "ad_visual_idea": "${isVietnamese ? 'Kịch bản hình/video ngắn' : 'Short visual/video script'}"
      },
      {
        "pain_point": "${isVietnamese ? 'Tên vấn đề' : 'Problem name'} 3",
        "percent_of_customers": 0,
        "usp": "${isVietnamese ? 'Giải pháp chính' : 'Main solution'}",
        "content_hook": "${isVietnamese ? 'Hook content dùng cho video/caption' : 'Content hook for video/caption'}",
        "ad_visual_idea": "${isVietnamese ? 'Kịch bản hình/video ngắn' : 'Short visual/video script'}"
      }
    ]
  }`);
    }
    return template.join(',\n');
  };

  const prompt = `# ${config.title}

# ✅ 📌 COMPLETE PROMPT FOR PRODUCT ANALYSIS (With Data)

*(Optimized version for Dropship / Affiliate – DATA VERSION + EXPANDED CUSTOMER SEGMENTATION)*

---

## 🎯 **Context**

${config.context}

${config.goals.map(goal => `- ${goal}`).join('\n')}

---

## 🧠 **Your Role**

${config.role}

${config.instruction}

## 📝 **${config.requirement}

---

---

### **0. Executive Summary**

Đề xuất: [Nên / Không nên / Nên nhưng có điều kiện] — tóm tắt 1–2 câu vì sao.

Điều kiện triển khai (nếu có): kênh ưu tiên, nhóm khách hàng, ngân sách test.

KPI tối thiểu: Gross margin ≥ __%, CPA/CAC ≤ __, BEP ≤ __ đơn/tháng.

Mức tự tin: __%.

3–4 luận điểm then chốt, sau đó xuống dòng mô tả chi tiết từng luận điểm và số liệu kèm theo để cũng cố

Nhu cầu & Xu hướng: Google Trends 12m = __%, SV = __; Nguồn: __. → Tác động: __.

Cạnh tranh & Giá: #listing = __, price range = __, top-3 share = __%; Nguồn: __. → Tác động: __.

Chi phí tiếp cận: CPC/CPA benchmark = /; CR = __%; Nguồn: __. → Tác động: __.

Biên lợi nhuận & vận hành: Giá vốn = __, phí sàn/ship = __, margin gộp = __%; Nguồn: __. → Tác động: __.

Cơ hội lớn nhất chi tiết tại sao đây là cơ hội lớn, có khả năng win bao nhiêu % dựa trên số liệu search web

Mô tả: __ (đòn bẩy: kênh/angle/USP).

Win-rate ước tính: __%.

Chỉ số kiểm chứng: SV = __, CTR = __%, CR = __%, CPC = __; Nguồn: __.

Kế hoạch tận dụng nhanh: bước 1 __ → bước 2 __ → bước 3 __.

Rủi ro lớn nhất chi tiết tại sao đây là rủi ro lớn, data nào dữ liệu nào để đúc kết được vấn đề này

Mô tả: __ (pháp lý/trend/logistics/copycat…).

Xác suất xảy ra: __% & Mức tác động: __ (doanh thu/margin).

Dấu hiệu cảnh báo sớm: __ (ví dụ CPC tăng >__%, report DMCA __%).

Bằng chứng dữ liệu: metric = __, giá trị = __; Nguồn: __.

Biện pháp giảm thiểu: __ (phương án B/C, thay angle, đổi kênh, đa dạng mẫu…).

---

## 1. Tiềm Năng Bán Hàng & Từ Khóa

**Khả năng bán hàng**

- Đánh giá: Cho đánh giá đúng nhất và số liệu theo đánh giá thế nào
- Quy mô thị trường: … USD (năm gần nhất), CAGR …% (giai đoạn 3–5 năm gần nhất).
- Xu hướng Google Trends: tăng/giảm …% trong 12 tháng.
- Dữ liệu TMĐT 3 tháng gần đây nhất (Amazon, Shopee, Etsy, AliExpress):
    - Số lượng listing
    - Sản phẩm bán/tháng (ước tính)
    - Mức tăng trưởng % so với cùng kỳ (3 tháng trước đó)
- **Nguồn tham khảo:** Statista, Grand View Research, Marketplace Insights, v.v.Statista, GVR, Ahrefs, Marketplace Pulse, TikTok Trends…

**20 từ khóa hiệu quả nhất có thể dùng để chạy** (chia 4 nhóm, mỗi từ khóa có Search Volume, CPC, Competition):

1. **Thông tin** (ví dụ: what is…, how to use…)
2. **Mua hàng** (buy, price, sale…)
3. **So sánh** (vs, best, top 10…)
4. **Liên quan đến vấn đề** (painpoint keyword…)

Mỗi nhóm 4-8 từ khóa, liệt kê từ cao → thấp.

## 2. Vấn Đề Sản Phẩm Giải Quyết

- **Vấn đề đã được giải quyết tốt:**
    - Liệt kê kèm % khách hàng hài lòng và tại sao hài lòng số liệu chi tiết nếu có. (từ survey/review marketplace).
- **Vấn đề chưa được giải quyết tốt (Cơ hội cải tiến):**
    - Liệt kê kèm % khách hàng chưa được serve tốt ở những vấn đề này hoặc nhu cầu chưa đáp ứng
    - Trích dẫn feedback thực tế từ review (Amazon/Etsy/Reddit…) nếu có.

### **3. Phân Tích 5 Nhóm Khách Hàng Mục Tiêu (BẢN MỞ RỘNG)**

### Mỗi nhóm cần phân tích đầy đủ bảng sau:

**QUAN TRỌNG:** Với mỗi nhóm khách hàng, hãy liệt kê cụ thể các thành phố/tỉnh mà nhóm đó tập trung sinh sống (ví dụ: Hà Nội, TP.HCM, Đà Nẵng, Cần Thơ, Hải Phòng...). Không dùng placeholder text.

### 🧑‍🤝‍🧑 **Nhóm X: [Tên nhóm khách hàng]**

| **Hạng mục** | **Nội dung cụ thể** |
| --- | --- |
| Phân khúc thị phần | % ước tính nhóm này chiếm |
| Giới tính | % Nam / Nữ |
| Độ tuổi chính | Khoảng tuổi chính, % phân bổ |
| Nghề nghiệp phổ biến | Văn phòng, nội trợ, học sinh, freelancer… |
| Vị trí địa lý chính | Liệt kê các thành phố/tỉnh cụ thể (ví dụ: Hà Nội, TP.HCM, Đà Nẵng, Cần Thơ...) |
| Tần suất mua hàng | Theo mùa / hàng tháng / dịp lễ |
| Ngân sách trung bình | $ / mỗi đơn hoặc mỗi năm |
| Hành vi tìm kiếm & mua | Họ tìm gì, mua ở đâu, ra quyết định theo yếu tố nào |
| Ngữ cảnh sử dụng | Mua để làm gì? Dùng ở đâu? Với ai? |
| Động lực cảm xúc chính | Cảm giác mong muốn sau khi mua (ví dụ: bé vui, mẹ an tâm…) |
| Pain Points thường gặp | Liệt kê 3–5 vấn đề chính |
| Kênh tiếp cận hiệu quả | TikTok, Facebook, Google, Shopee… |
| Tỷ lệ tái mua / upsell | Có / Không, % ước tính |
| Tỷ lệ tái mua / upsell | Có / Không, % ước tính |

---

### **Đánh giá Pain Points theo mức độ**

- **CAO:** … (% khách hàng)
- **TRUNG BÌNH:** … (% khách hàng)
- **THẤP:** … (% khách hàng)

---

### **Bảng đánh giá Pain Points theo mức độ và giải pháp đề xuất (chuẩn cấu trúc mới)**

| **Pain Point** | **Giải pháp (USP)** | **Gợi ý nội dung / content hook** | **Gợi ý Video / Hình ảnh Quảng Cáo (nếu có)** |
| --- | --- | --- | --- |
| [Vấn đề cụ thể phải thật chi tiết là khách hàng đang bị gì, bị thế nào] (% khách hàng bị) | [USP để giải quyết vấn đề của khách là gì, dễ hiểu, đúng insight] | [Câu nói/dòng text dùng làm content mở đầu, tiêu đề, caption… cần phải chi tiết hay và nên làm sao chứ ko ghi chung chung] | [Kịch bản video ngắn khoảng 20s và chia ra từng khung thời gian cụ thể thật chi tiết để tạo content cho các kênh social như tiktok hoặc instagram] |

📌 Lặp lại bảng này đầy đủ đúng với bảng trên cho **từng nhóm khách hàng mục tiêu** (3 nhóm)


---

### **🔚 Kết luận:**

- Nhóm nào nên tập trung trước khi chạy content?
- Angle nào tiềm năng nhất để chạy ads / organic post?
- Có thể upsell / kết hợp combo gì?
- Có rủi ro gì cần lưu ý khi bán sản phẩm này (về pháp lý, thị trường, nguồn hàng…)?

tương tự cho các nhóm còn lại, hiển thị đầy đủ ra, ví dụ co 3 nhóm thì mỗi nhóm nên có đầy đủ kết luận

---

## 📊 **Thông tin sản phẩm cần phân tích:**

**Target Market:** ${product.target_market}
**Product Title:** ${product.title || 'TỰ ĐỘNG EXTRACT TỪ HÌNH ẢNH'}
**Product Description:** ${product.description || 'TỰ ĐỘNG EXTRACT TỪ HÌNH ẢNH'}
**Product Image 1:** [Hình ảnh sản phẩm 1]
**Product Image 2:** ${product.image2 ? '[Hình ảnh sản phẩm 2]' : 'Không có hình ảnh thứ 2'}
**Ngày phân tích:** ${currentDate || new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}

**LƯU Ý QUAN TRỌNG:**
- Nếu Product Title là "TỰ ĐỘNG EXTRACT TỪ HÌNH ẢNH", hãy phân tích hình ảnh để tạo ra title sản phẩm chính xác
- Nếu Product Description là "TỰ ĐỘNG EXTRACT TỪ HÌNH ẢNH", hãy phân tích hình ảnh để tạo ra mô tả sản phẩm chi tiết
- Sử dụng thông tin từ hình ảnh để bổ sung cho phân tích thị trường
- **QUAN TRỌNG VỀ THỜI GIAN:** Ngày phân tích hiện tại là ${currentDate || new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}. Hãy sử dụng thông tin này để:
  - Đưa ra các insight về xu hướng thị trường hiện tại
  - Gợi ý thời điểm tốt nhất để launch sản phẩm
  - Phân tích các dịp lễ/sự kiện sắp tới có thể ảnh hưởng đến việc bán hàng
  - Đề xuất chiến lược marketing phù hợp với thời điểm hiện tại

---

## 📊 **JSON Response Requirements**

Return the following JSON structure (in ${isVietnamese ? 'Vietnamese' : 'English'}):

**IMPORTANT: Generate exactly ${segmentationNumber} customer segments in the target_customers array.**

\`\`\`json

${generateJsonTemplate(isVietnamese)},
"target_customers": [
${generateTargetCustomersTemplate(segmentationNumber, isVietnamese)}
],
  "conclusions": [
    {
      "title": "${isVietnamese ? 'Chiến lược 1: Tập trung vào nhóm khách hàng chính' : 'Strategy 1: Focus on Main Customer Groups'}",
      "focus_group_priority": "${isVietnamese ? 'Tên nhóm khách hàng nên chạy đầu tiên' : 'Customer group to target first'}",
      "best_content_angle": "${isVietnamese ? 'Angle tiềm năng nhất' : 'Most potential angle'}",
      "upsell_combo_suggestions": "${isVietnamese ? 'Ý tưởng upsell hoặc combo' : 'Upsell or combo ideas'}",
      "risks_to_consider": "${isVietnamese ? 'Pháp lý, mùa vụ, logistics, etc.' : 'Legal, seasonal, logistics, etc.'}"
    },
    {
      "title": "${isVietnamese ? 'Chiến lược 2: Mở rộng thị trường mới' : 'Strategy 2: Expand to New Markets'}",
      "focus_group_priority": "${isVietnamese ? 'Tên nhóm khách hàng nên chạy đầu tiên' : 'Customer group to target first'}",
      "best_content_angle": "${isVietnamese ? 'Angle tiềm năng nhất' : 'Most potential angle'}",
      "upsell_combo_suggestions": "${isVietnamese ? 'Ý tưởng upsell hoặc combo' : 'Upsell or combo ideas'}",
      "risks_to_consider": "${isVietnamese ? 'Pháp lý, mùa vụ, logistics, etc.' : 'Legal, seasonal, logistics, etc.'}"
    },
    {
      "title": "${isVietnamese ? 'Chiến lược 3: Tối ưu hóa nội dung hiện tại' : 'Strategy 3: Optimize Current Content'}",
      "focus_group_priority": "${isVietnamese ? 'Tên nhóm khách hàng nên chạy đầu tiên' : 'Customer group to target first'}",
      "best_content_angle": "${isVietnamese ? 'Angle tiềm năng nhất' : 'Most potential angle'}",
      "upsell_combo_suggestions": "${isVietnamese ? 'Ý tưởng upsell hoặc combo' : 'Upsell or combo ideas'}",
      "risks_to_consider": "${isVietnamese ? 'Pháp lý, mùa vụ, logistics, etc.' : 'Legal, seasonal, logistics, etc.'}"
    }
  ]
}
}
\`\`\`

${isVietnamese ? 'Hãy phân tích sản phẩm này và trả về kết quả theo đúng cấu trúc JSON trên.' : 'Please analyze this product and return the results according to the JSON structure above.'}`;

  const response = await axios.post(
    'https://openrouter.ai/api/v1/chat/completions',
    {
        model: 'google/gemini-2.5-flash-preview-09-2025',
      messages: [
        {
          role: 'system',
          content: isVietnamese 
            ? 'Bạn là chuyên gia phân tích thị trường và nhận diện sản phẩm. Bạn có thể phân tích hình ảnh để extract title và description sản phẩm. Trả về CHỈ JSON hợp lệ bằng tiếng Việt, không có text thêm, không có markdown formatting. Tất cả nội dung trong JSON phải được viết bằng tiếng Việt.'
            : 'You are a market analysis expert and product identification specialist. You can analyze images to extract product titles and descriptions. Return ONLY valid JSON in English, no additional text, no markdown formatting. All content in the JSON must be written in English.'
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 8000,
    },
    {
      headers: {
        'Authorization': `Bearer ${openRouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Product Analysis Aff',
      },
    }
  );

  const content = response.data.choices[0].message.content;
  
  try {
    // Try to find complete JSON object
    let jsonStart = content.indexOf('{');
    if (jsonStart === -1) {
      return { raw_analysis: content };
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
      console.warn('Incomplete JSON found, using raw content');
      return { raw_analysis: content };
    }
    
    const jsonString = content.substring(jsonStart, jsonEnd + 1);
    return JSON.parse(jsonString);
  } catch (parseError) {
    console.error('Error parsing AI response:', parseError);
    console.error('Content length:', content.length);
    console.error('Content preview:', content.substring(0, 500));
    return { raw_analysis: content };
  }
}

// Product Listing Optimizer endpoint
router.post('/:id/optimize', authenticate, async (req: Request, res: Response) => {
  try {
    const authenticatedReq = req as AuthenticatedRequest;
    const { id } = req.params;
    const { type, data } = req.body;
    const userId = authenticatedReq.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    console.log('🔍 [ProductListingOptimizer] Starting optimization for product:', id);
    console.log('🔍 [ProductListingOptimizer] Type:', type);
    console.log('🔍 [ProductListingOptimizer] Data keys:', Object.keys(data || {}));
    console.log('🔍 [ProductListingOptimizer] Full data:', JSON.stringify(data, null, 2));

    // Get the product analysis result
    const product = await prisma.productAff.findFirst({
      where: {
        id: id,
        userId: userId,
      },
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (!product.analysis_result) {
      return res.status(400).json({ message: 'No analysis result available' });
    }

    let analysisResult;
    try {
      analysisResult = typeof product.analysis_result === 'string' 
        ? JSON.parse(product.analysis_result) 
        : product.analysis_result;
    } catch (parseError) {
      console.error('Error parsing analysis result:', parseError);
      return res.status(400).json({ message: 'Invalid analysis result format' });
    }

    const targetMarket = product.target_market || 'global';
    const openRouterApiKey = process.env.OPENROUTER_API_KEY;

    if (!openRouterApiKey) {
      console.error('OpenRouter API key not found');
      return res.status(500).json({ message: 'AI service not configured' });
    }

    let prompt = '';

                if (type === 'keyword') {
                  const keywordList = data.keywords.map((keyword: string) => `- ${keyword}`).join('\n');
                  const tone = data.tone || 'Expert';
                  
                  prompt = `Act as an expert Amazon/e-commerce SEO copywriter for the ${targetMarket} market.

            Based on the product's original listing and this comprehensive keyword analysis, generate a new, compelling, and SEO-optimized product title and description.

            **Product Information:**
            * Original Title: "${data.original_title}"
            * Original Description: "${data.original_description}"

            **Comprehensive Keyword List (from analysis):**
            ${keywordList}

            **Writing Tone:**
            * Use a ${tone.toLowerCase()} tone throughout the content
            * Match the tone to the target audience and product type
            * Ensure consistency between title and description

            **Your Task:**
            1. Generate a new Product Title:
               - Clear, concise, includes 2–3 high-value transactional keywords near the beginning.
               - Under 200 characters.
               - Written in ${tone.toLowerCase()} tone.
            2. Generate a new Product Description:
               - Write in PROFESSIONAL HTML format for Shopify compatibility
               - Use advanced HTML structure: <h2>, <h3>, <h4>, <p>, <ul>, <ol>, <li>, <strong>, <em>, <br>, <table>, <tr>, <td>, <th>, <div>, <span>
               - Create a structured layout with clear sections:
                 * Hero section with main benefit
                 * Key features table with specifications
                 * Benefits list with bullet points
                 * Technical details section
                 * Call-to-action paragraph
               - Use professional typography: bold headers, italicized benefits, clear bullet points
               - Include comparison tables for specifications if relevant
               - Make it visually appealing and easy to scan
               - Use ${tone.toLowerCase()}, persuasive, trustworthy tone with clear value propositions
               
               **Example Structure:**
               <h2>🚀 [Main Benefit Headline]</h2>
               <p>[Compelling introduction paragraph]</p>
               
               <h3>✨ Key Features & Benefits</h3>
               <table>
                 <tr><th>Feature</th><th>Benefit</th><th>Why It Matters</th></tr>
                 <tr><td><strong>Feature 1</strong></td><td>Benefit description</td><td>Customer value</td></tr>
               </table>
               
               <h3>📋 Technical Specifications</h3>
               <ul>
                 <li><strong>Spec 1:</strong> Value with explanation</li>
                 <li><strong>Spec 2:</strong> Value with explanation</li>
               </ul>
               
               <h3>💡 Why Choose This Product?</h3>
               <p>[Social proof and unique selling proposition]</p>

            Output strictly as JSON with two keys:
            {
              "new_title": "...",
              "new_description": "..."
            }`;

                } else if (type === 'feature') {
                  const resolvedFeatures = data.resolved_features || [];
                  const unresolvedProblems = data.unresolved_problems || [];
                  const tone = data.tone || 'Expert';
                  
                  const resolvedFeaturesList = resolvedFeatures.map((feature: any) => 
                    `- Problem Solved: "${feature.problem}"\n  - The Feature (How we solve it): "${feature.reason}"`
                  ).join('\n\n');
                  
                  const unresolvedProblemsList = unresolvedProblems.map((problem: any) => 
                    `- Limitation: "${problem.problem}"\n  - Customer Feedback Example: "${problem.example_feedback}"`
                  ).join('\n\n');

                  prompt = `Act as an expert Product Copywriter. Your goal is to create a clear, benefit-driven product listing based on its proven features and known limitations.

**Product Information:**
* Product Name: ${product.title || 'Product'}
* Target Market: ${targetMarket}

**Product Feature Analysis:**

**1. Proven Product Features (What works well and solves customer problems):**
${resolvedFeaturesList}

**2. Known Issues & Limitations (What to be careful about when writing):**
${unresolvedProblemsList}

**Writing Tone:**
* Use a ${tone.toLowerCase()} tone throughout the content
* Match the tone to the target audience and product type
* Ensure consistency between title and description

**Your Task:**

1. **Generate a new Product Title:**
   - Highlight the product's strongest, most tangible feature from the "Proven Features" list.
   - Focus on the direct benefit to the customer. For example: "Bedsure Clump-Proof Comforter with 8 Secure Tabs - Machine Washable & Stays Fluffy".
   - Keep it concise and under 200 characters.
   - Written in ${tone.toLowerCase()} tone.

2. **Generate a new Product Description:**
   - Write in PROFESSIONAL HTML format for Shopify compatibility
   - Use advanced HTML structure: <h2>, <h3>, <h4>, <p>, <ul>, <ol>, <li>, <strong>, <em>, <br>, <table>, <tr>, <td>, <th>, <div>, <span>
   - Create a structured layout with clear sections:
     * Hero section highlighting the strongest proven feature
     * Features vs Benefits comparison table
     * Technical specifications table
     * Problem-Solution format with clear bullet points
     * Honest limitations section (if any)
     * Call-to-action with confidence
   - Use professional typography: bold headers, italicized benefits, clear bullet points
   - Include comparison tables showing "Before vs After" scenarios
   - **Crucially:** Handle the "Known Issues" with care. Do not make exaggerated claims related to them. For instance, for the 'All-Season' feature, frame it as "Ideal for most seasons" or "Provides balanced warmth for spring, fall, and air-conditioned rooms" instead of a blanket "perfect for all year round" statement. For "Fluffiness", manage expectations by stating "Follow instructions to restore its natural loft".
   - The tone should be confident about what the product does well, and honest about its limitations.
   - Use ${tone.toLowerCase()}, persuasive, trustworthy tone
   
   **Example Structure:**
   <h2>🏆 [Strongest Feature Headline]</h2>
   <p>[Confident introduction highlighting proven features]</p>
   
   <h3>✅ Proven Features That Work</h3>
   <table>
     <tr><th>Problem Solved</th><th>Our Solution</th><th>Customer Satisfaction</th></tr>
     <tr><td>Problem 1</td><td><strong>Feature description</strong></td><td>85% satisfied</td></tr>
   </table>
   
   <h3>🔧 Technical Excellence</h3>
   <ul>
     <li><strong>Feature 1:</strong> Detailed explanation with benefits</li>
     <li><strong>Feature 2:</strong> Detailed explanation with benefits</li>
   </ul>
   
   <h3>⚠️ Important Notes</h3>
   <p><em>For optimal results: [Honest limitations and usage tips]</em></p>
   
   <h3>🎯 Why This Works</h3>
   <p>[Confident closing with value proposition]</p>

Output strictly as JSON with two keys:
{
  "new_title": "...",
  "new_description": "..."
}`;

                } else if (type === 'segmentation') {
                  const segmentData = data.segment_data;
                  const painPointsList = segmentData.common_painpoints?.map((point: string) => `- ${point}`).join('\n') || '';
                  const solutionsList = segmentData.solutions_and_content?.map((item: any) => 
                    `- For the pain point "${item.pain_point}", our solution is "${item.solution}".`
                  ).join('\n') || '';
                  const tone = data.tone || 'Expert';

                  prompt = `Act as a specialist Direct-to-Consumer (DTC) copywriter. Your task is to write a highly targeted product listing that speaks directly to a specific customer segment.

            **Product Information:**
            * Product Name: ${product.title || 'Product'}
            * Target Market: ${targetMarket}

            **Target Audience Profile:**
            * Segment Name: "${segmentData.name}"
            * Common Pain Points:
            ${painPointsList}
            * Product Solutions:
            ${solutionsList}

            **Writing Tone:**
            * Use a ${tone.toLowerCase()} tone throughout the content
            * Match the tone to the target audience and product type
            * Ensure consistency between title and description

            **Your Task:**
            1. Generate a new Product Title:
               - Emotionally resonate with "${segmentData.name}".
               - Highlight the core benefit that solves their top pain point.
               - Keep under 150 characters.
               - Written in ${tone.toLowerCase()} tone.

            2. Generate a new Product Description:
               - Write in PROFESSIONAL HTML format for Shopify compatibility
               - Use advanced HTML structure: <h2>, <h3>, <h4>, <p>, <ul>, <ol>, <li>, <strong>, <em>, <br>, <table>, <tr>, <td>, <th>, <div>, <span>
               - Create a structured layout with clear sections:
                 * Hero section addressing their specific pain points
                 * Solution presentation with benefits table
                 * Feature list tailored to their needs
                 * Social proof and testimonials section
                 * Call-to-action with urgency
               - Use professional typography: bold headers, italicized benefits, clear bullet points
               - Include comparison tables showing before/after scenarios
               - Make it visually appealing and emotionally resonant
               - Use ${tone.toLowerCase()} tone that matches the segment (e.g., elegant for Home Décor, warm for Comfort Seekers).
               
               **Example Structure:**
               <h2>💝 [Emotional Headline for ${segmentData.name}]</h2>
               <p>[Address their specific pain points with empathy]</p>
               
               <h3>🎯 Perfect Solution for You</h3>
               <table>
                 <tr><th>Your Challenge</th><th>Our Solution</th><th>Your Benefit</th></tr>
                 <tr><td>Pain point 1</td><td><strong>How we solve it</strong></td><td>Emotional benefit</td></tr>
               </table>
               
               <h3>✨ What Makes This Special for ${segmentData.name}</h3>
               <ul>
                 <li><strong>Benefit 1:</strong> Tailored to your lifestyle</li>
                 <li><strong>Benefit 2:</strong> Solves your specific needs</li>
               </ul>
               
               <h3>🌟 Join Thousands of Happy Customers</h3>
               <p>[Social proof and call to action]</p>

            Output strictly as JSON with two keys:
            {
              "new_title": "...",
              "new_description": "..."
            }`;

                } else if (type === 'painpoint') {
                  const painpointData = data.painpoint_data;
                  const tone = data.tone || 'Expert';
                  
                  prompt = `Act as an expert Product Copywriter. Your goal is to create a compelling product listing that directly addresses a specific customer pain point.

**Product Information:**
* Product Name: ${product.title || 'Product'}
* Target Market: ${targetMarket}

**Customer Pain Point Analysis:**
* **Pain Point:** ${painpointData.painpoint}
* **Customer Segment:** ${painpointData.customer}
* **Problem Context:** This pain point affects ${painpointData.customer} who experience this specific challenge in their daily lives.

**Writing Tone:**
* Use a ${tone.toLowerCase()} tone throughout the content
* Focus on empathy and understanding of the customer's struggle
* Position the product as the solution to their specific problem
* Ensure consistency between title and description

**Your Task:**
1. Generate a new Product Title:
   - Lead with the pain point solution
   - Include emotional trigger words
   - Under 200 characters
   - Written in ${tone.toLowerCase()} tone

2. Generate a new Product Description:
   - Write in PROFESSIONAL HTML format for Shopify compatibility
   - Use advanced HTML structure: <h2>, <h3>, <h4>, <p>, <ul>, <ol>, <li>, <strong>, <em>, <br>, <table>, <tr>, <td>, <th>, <div>, <span>
   - Create a structured layout with clear sections:
     * Problem acknowledgment section (empathy)
     * Solution introduction
     * How it solves the specific pain point
     * Benefits and features
     * Social proof and call-to-action
   - Use professional typography: bold headers, italicized benefits, clear bullet points
   - Make it emotionally compelling and solution-focused
   - Use ${tone.toLowerCase()}, empathetic, solution-oriented tone
   
   **Example Structure:**
   <h2>😰 Tired of [Pain Point]?</h2>
   <p>[Empathetic acknowledgment of the problem]</p>
   
   <h3>✨ Finally, A Solution That Works</h3>
   <p>[How our product specifically addresses this pain point]</p>
   
   <h3>🎯 How We Solve Your [Pain Point] Problem</h3>
   <table>
     <tr><th>Your Challenge</th><th>Our Solution</th><th>Your Result</th></tr>
     <tr><td><strong>Pain Point</strong></td><td>How we solve it</td><td>Benefit you get</td></tr>
   </table>
   
   <h3>💡 Why This Works for ${painpointData.customer}</h3>
   <ul>
     <li><strong>Benefit 1:</strong> Specifically addresses your pain point</li>
     <li><strong>Benefit 2:</strong> Designed for your lifestyle</li>
   </ul>
   
   <h3>🌟 Join Others Who've Solved This Problem</h3>
   <p>[Social proof and call to action]</p>

Output strictly as JSON with two keys:
{
  "new_title": "...",
  "new_description": "..."
}`;

    } else {
      return res.status(400).json({ message: 'Invalid optimization type' });
    }

    console.log('🚀 [ProductListingOptimizer] Calling OpenRouter API...');
    console.log('🚀 [ProductListingOptimizer] Prompt length:', prompt.length);

    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model: 'openai/gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    }, {
      headers: {
        'Authorization': `Bearer ${openRouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Product Listing Optimizer',
      },
    });

    console.log('✅ [ProductListingOptimizer] OpenRouter API response received');
    console.log('✅ [ProductListingOptimizer] Response status:', response.status);

    const content = response.data.choices[0].message.content;
    
    try {
      // Try to find complete JSON object
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
      
      console.log('✅ [ProductListingOptimizer] Successfully parsed result');
      res.json(result);
      
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      console.error('Content length:', content.length);
      console.error('Content preview:', content.substring(0, 500));
      res.status(500).json({ message: 'Failed to parse AI response' });
    }

  } catch (error) {
    console.error('Error in product listing optimizer:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// AI Ads Generator endpoint
router.post('/:id/generate-ads', async (req, res) => {
  try {
    console.log('🎬 [AI Ads Generator] Request received:', req.params, req.body);
    
    const { id } = req.params;
    const { platform, mode, format, data, num_versions = 1, model = 'openai/gpt-4o-mini' } = req.body;

    console.log('🎬 [AI Ads Generator] Parsed params:', { id, platform, mode, format, data, num_versions, model });

    // Get product analysis data
    const product = await prisma.productAff.findUnique({
      where: { id }
    });

    console.log('🎬 [AI Ads Generator] Product found:', product ? 'Yes' : 'No');

    if (!product || !product.analysis_result) {
      console.log('🎬 [AI Ads Generator] Product or analysis_result not found');
      return res.status(404).json({ message: 'Product analysis not found' });
    }

    const analysisResult = JSON.parse(product.analysis_result);
    const targetMarket = product.target_market || 'Global';
    const productName = product.title;
    const productDescription = product.description;

    console.log('🎬 [AI Ads Generator] Analysis result parsed successfully');

    // --- TẠO MASTER CONTEXT ---
    const masterContext = {
      productName: productName,
      productDescription: productDescription ? productDescription.substring(0, 200) + '...' : 'Sản phẩm chất lượng cao',
      targetMarket: targetMarket,
      brandPersona: req.body.brand_persona || 'Hiện đại, đáng tin cậy và tập trung vào tính năng',
      adGoal: req.body.ad_goal || 'Tối đa hóa lượt nhấp chuột (CTR) và chuyển đổi cho sản phẩm mới',
      // --- Lấy dữ liệu chiến lược từ analysis_result ---
      biggestOpportunity: analysisResult.executive_summary?.biggest_opportunity || 'N/A',
      // Lấy chiến lược ưu tiên từ conclusions
      primaryStrategyAngle: analysisResult.conclusions?.[0]?.best_content_angle || 'Tập trung vào tính năng nổi bật nhất.'
    };

    console.log('🎬 [AI Ads Generator] Master context created:', masterContext);

    let prompt = '';

    // Build prompt based on mode
    if (mode === 'segment') {
      const segment = data.segment_data;
      const painPointsList = segment.common_painpoints?.map((p: string) => `- ${p}`).join('\n') || 'N/A';
      // Lấy các ý tưởng có sẵn từ data
      const inspirationalHooks = segment.solutions_and_content?.map((s: any) => `- "${s.content_hook}"`).join('\n') || 'N/A';
      const inspirationalVisuals = segment.solutions_and_content?.map((s: any) => `- "${s.ad_visual_idea}"`).join('\n') || 'N/A';
      
      prompt = `Bạn là một Giám đốc Sáng tạo tại một agency quảng cáo hàng đầu, chuyên xây dựng các chiến dịch ra mắt sản phẩm công nghệ trên social media.

**MASTER CONTEXT (Bối cảnh chiến dịch):**
*   **Sản phẩm:** ${masterContext.productName}
*   **Mô tả:** ${masterContext.productDescription}
*   **Thị trường:** ${masterContext.targetMarket}
*   **Tính cách thương hiệu:** ${masterContext.brandPersona}
*   **Mục tiêu quảng cáo:** ${masterContext.adGoal}
*   **Góc độ chiến lược chính:** ${masterContext.primaryStrategyAngle}
*   **Cơ hội lớn nhất cần khai thác:** ${masterContext.biggestOpportunity}

**NHIỆM VỤ:**
Viết một mẫu quảng cáo cho nền tảng **${platform}**, sử dụng framework **${format}**, nhắm thẳng vào phân khúc khách hàng sau:

*   **Tên phân khúc:** ${segment.name}
*   **Những "Nỗi đau" của họ:**
${painPointsList}

**NGUỒN CẢM HỨNG (Hãy phát triển dựa trên những ý tưởng này):**
*   **Ý tưởng Tiêu đề có sẵn:**
${inspirationalHooks}
*   **Ý tưởng Hình ảnh/Video có sẵn:**
${inspirationalVisuals}

**YÊU CẦU ĐẦU RA:**
Ngôn ngữ: **Tiếng Việt**.
Tạo **${num_versions} phiên bản** quảng cáo khác nhau để A/B test.

**QUAN TRỌNG - ĐỊNH DẠNG JSON:**
- Chỉ trả về JSON thuần túy, KHÔNG có text giải thích
- KHÔNG có dấu xuống dòng (\\n) trong JSON
- KHÔNG có backslash escape characters
- JSON phải valid và parse được
- Bắt đầu bằng { và kết thúc bằng }

**ĐẶC BIỆT CHO TIKTOK:**
- Nếu platform là TikTok, ad_visual_idea PHẢI là kịch bản video 30 giây
- Chia thành 5-7 cảnh rõ ràng với timeline cụ thể
- Mỗi cảnh phải có format: "Cảnh X (thời gian): mô tả hành động"
- Ví dụ: "Cảnh 1 (0-3s): Hook mạnh. Cảnh 2 (4-8s): Vấn đề. Cảnh 3 (9-15s): Giải pháp..."
{
  "versions": [
    {
      "ad_headline": "Phiên bản 1: Một tiêu đề chính được tinh chỉnh từ các 'ý tưởng có sẵn', đánh thẳng vào nỗi đau lớn nhất của phân khúc này.",
      "ad_copy": "Phiên bản 1: Nội dung quảng cáo theo framework ${format}, kết hợp nhuần nhuyễn giữa việc giải quyết nỗi đau và thể hiện cá tính của thương hiệu. Hãy làm cho nó sống động và thuyết phục hơn.",
      "ad_visual_idea": "Phiên bản 1: Tạo kịch bản video TikTok 30 giây với các cảnh được chia rõ ràng theo timeline. Mỗi cảnh phải có thời gian cụ thể và mô tả hành động chi tiết. Ví dụ: Cảnh 1 (0-3s): Mở đầu với vấn đề. Cảnh 2 (4-8s): Giới thiệu sản phẩm. Cảnh 3 (9-15s): Demo tính năng. Cảnh 4 (16-25s): Kết quả và lợi ích. Cảnh 5 (26-30s): Call to action.",
      "cta": "Lời kêu gọi hành động phù hợp với phân khúc và mục tiêu. Ví dụ: 'Sở hữu ngay hôm nay!'",
      "expected_performance": "Phiên bản 1: Dự kiến tăng CTR 25-35% và conversion rate 15-20% vì tiêu đề đánh thẳng vào nỗi đau lớn nhất của phân khúc, tạo sự đồng cảm mạnh mẽ và framework ${format} giúp dẫn dắt khách hàng qua hành trình mua hàng logic."
    }${num_versions > 1 ? `,
    {
      "ad_headline": "Phiên bản 2: Một góc tiếp cận khác, có thể tập trung vào lợi ích hoặc cảm xúc khác biệt.",
      "ad_copy": "Phiên bản 2: Nội dung với tone voice khác, có thể chuyên nghiệp hơn hoặc thân thiện hơn, nhưng vẫn theo framework ${format}.",
      "ad_visual_idea": "Phiên bản 2: Kịch bản video TikTok 30 giây với góc nhìn khác. Chia thành 5-6 cảnh rõ ràng với timeline cụ thể. Mỗi cảnh phải có thời gian bắt đầu-kết thúc và mô tả hành động chi tiết để dễ sản xuất.",
      "cta": "CTA khác biệt, có thể 'Khám phá ngay!' hoặc 'Trải nghiệm miễn phí!'",
      "expected_performance": "Phiên bản 2: Dự kiến tăng CTR 20-30% và conversion rate 12-18% vì tone voice khác biệt thu hút nhóm khách hàng khác, tạo sự đa dạng trong chiến dịch và giảm ad fatigue."
    }` : ''}${num_versions > 2 ? `,
    {
      "ad_headline": "Phiên bản 3: Góc tiếp cận thứ ba, có thể tập trung vào urgency hoặc social proof.",
      "ad_copy": "Phiên bản 3: Nội dung với approach khác, có thể sử dụng urgency, scarcity hoặc social proof, vẫn theo framework ${format}.",
      "ad_visual_idea": "Phiên bản 3: Kịch bản video TikTok 30 giây với concept hoàn toàn khác. Chia thành 6-7 cảnh với timeline chi tiết. Mỗi cảnh phải có thời gian cụ thể (ví dụ: Cảnh 1 (0-4s): Hook mạnh. Cảnh 2 (5-10s): Vấn đề. Cảnh 3 (11-18s): Giải pháp. Cảnh 4 (19-25s): Demo. Cảnh 5 (26-30s): CTA).",
      "cta": "CTA thứ ba, có thể 'Đặt hàng ngay!' hoặc 'Tham gia cùng hàng ngàn người!'",
      "expected_performance": "Phiên bản 3: Dự kiến tăng CTR 30-40% và conversion rate 20-25% vì urgency và social proof tạo tâm lý FOMO mạnh mẽ, thúc đẩy hành động nhanh chóng và tăng tỷ lệ chuyển đổi."
    }` : ''}
  ]
}`;

    } else if (mode === 'painpoint') {
      const painpointData = data.painpoint_data;
      // Tìm customer segment tương ứng để lấy thông tin context
      const customerSegment = analysisResult.target_customers?.find((c: any) => c.name === painpointData.customer);
      const segmentContext = customerSegment ? `
*   **Nhóm khách hàng:** ${customerSegment.name}
*   **Độ tuổi:** ${customerSegment.age_range || 'N/A'}
*   **Nghề nghiệp:** ${customerSegment.occupations?.join(', ') || 'N/A'}
*   **Vị trí:** ${customerSegment.locations?.join(', ') || 'N/A'}
*   **Hành vi mua hàng:** ${customerSegment.buying_behavior || 'N/A'}
*   **Động cơ cảm xúc:** ${customerSegment.emotional_motivations || 'N/A'}
      ` : '';
      
      // Tìm giải pháp từ product problems hoặc tạo generic solution
      const productSolution = analysisResult.product_problems?.resolved?.find((r: any) => 
        r.problem && painpointData.painpoint.toLowerCase().includes(r.problem.toLowerCase())
      )?.reason || 'Sản phẩm được thiết kế để giải quyết vấn đề này.';
      
      prompt = `Bạn là một chuyên gia sáng tạo nội dung quảng cáo, bậc thầy của việc kể chuyện dựa trên sự thấu hiểu khách hàng.

**MASTER CONTEXT (Bối cảnh chiến dịch):**
*   **Sản phẩm:** ${masterContext.productName}
*   **Mô tả:** ${masterContext.productDescription}
*   **Thị trường:** ${masterContext.targetMarket}
*   **Tính cách thương hiệu:** ${masterContext.brandPersona}
*   **Mục tiêu quảng cáo:** ${masterContext.adGoal}
*   **Góc độ chiến lược chính:** ${masterContext.primaryStrategyAngle}

**THÔNG TIN NHÓM KHÁCH HÀNG:**
${segmentContext}

**NHIỆM VỤ:**
Viết một mẫu quảng cáo cho nền tảng **${platform}** tập trung giải quyết một "nỗi đau" cụ thể của khách hàng, sử dụng framework **${format}** (ví dụ: PAS - Problem, Agitate, Solve).

*   **Vấn đề cần giải quyết:** ${painpointData.painpoint}
*   **Nhóm khách hàng gặp vấn đề:** ${painpointData.customer}
*   **Giải pháp của chúng ta:** ${productSolution}

**YÊU CẦU ĐẦU RA:**
Ngôn ngữ: **Tiếng Việt**.
Tạo **${num_versions} phiên bản** quảng cáo khác nhau để A/B test.

**QUAN TRỌNG - ĐỊNH DẠNG JSON:**
- Chỉ trả về JSON thuần túy, KHÔNG có text giải thích
- KHÔNG có dấu xuống dòng (\\n) trong JSON
- KHÔNG có backslash escape characters
- JSON phải valid và parse được
- Bắt đầu bằng { và kết thúc bằng }

**ĐẶC BIỆT CHO TIKTOK:**
- Nếu platform là TikTok, ad_visual_idea PHẢI là kịch bản video 30 giây
- Chia thành 5-7 cảnh rõ ràng với timeline cụ thể
- Mỗi cảnh phải có format: "Cảnh X (thời gian): mô tả hành động"
- Ví dụ: "Cảnh 1 (0-3s): Hook mạnh. Cảnh 2 (4-8s): Vấn đề. Cảnh 3 (9-15s): Giải pháp..."
{
  "versions": [
    {
      "ad_headline": "Phiên bản 1: Tiêu đề giật tít, nêu bật vấn đề hoặc đặt một câu hỏi dựa trên feedback của khách hàng.",
      "ad_copy": "Phiên bản 1: Nội dung quảng cáo theo framework ${format}. Bắt đầu bằng việc trích dẫn hoặc diễn giải lại feedback của khách hàng để tạo sự đồng cảm, sau đó giới thiệu sản phẩm như một giải pháp hoàn hảo.",
      "ad_visual_idea": "Phiên bản 1: Kịch bản video TikTok 30 giây thể hiện sự tương phản 'trước-sau'. Chia thành 5-6 cảnh rõ ràng: Cảnh 1 (0-4s): Vấn đề hiện tại. Cảnh 2 (5-10s): Giới thiệu sản phẩm. Cảnh 3 (11-18s): Demo giải pháp. Cảnh 4 (19-25s): Kết quả 'sau'. Cảnh 5 (26-30s): CTA. Mỗi cảnh phải có thời gian cụ thể và mô tả hành động chi tiết.",
      "cta": "Lời kêu gọi hành động mang tính giải pháp. Ví dụ: 'Trải nghiệm sự khác biệt!'",
      "expected_performance": "Phiên bản 1: Dự kiến tăng CTR 30-40% và conversion rate 18-25% vì tương phản 'trước-sau' tạo visual impact mạnh, dễ hiểu và thuyết phục khách hàng về hiệu quả sản phẩm."
    }${num_versions > 1 ? `,
    {
      "ad_headline": "Phiên bản 2: Góc tiếp cận khác, có thể tập trung vào giải pháp hoặc kết quả.",
      "ad_copy": "Phiên bản 2: Nội dung với tone khác, có thể chuyên nghiệp hơn hoặc thân thiện hơn, vẫn theo framework ${format}.",
      "ad_visual_idea": "Phiên bản 2: Kịch bản video TikTok 30 giây với góc nhìn khác. Chia thành 6 cảnh: Cảnh 1 (0-3s): Hook. Cảnh 2 (4-8s): Vấn đề. Cảnh 3 (9-14s): Giải pháp. Cảnh 4 (15-22s): Demo sử dụng. Cảnh 5 (23-27s): Lợi ích. Cảnh 6 (28-30s): CTA. Mỗi cảnh có timeline cụ thể và mô tả chi tiết.",
      "cta": "CTA khác biệt, có thể 'Giải quyết ngay!' hoặc 'Thử ngay hôm nay!'",
      "expected_performance": "Phiên bản 2: Dự kiến tăng CTR 25-35% và conversion rate 15-22% vì góc nhìn khác thu hút audience khác, tăng reach và giảm competition với version 1."
    }` : ''}${num_versions > 2 ? `,
    {
      "ad_headline": "Phiên bản 3: Góc tiếp cận thứ ba, có thể sử dụng urgency hoặc social proof.",
      "ad_copy": "Phiên bản 3: Nội dung với approach khác, có thể sử dụng urgency, scarcity hoặc social proof, vẫn theo framework ${format}.",
      "ad_visual_idea": "Phiên bản 3: Kịch bản video TikTok 30 giây với concept testimonial/before-after. Chia thành 7 cảnh: Cảnh 1 (0-2s): Hook testimonial. Cảnh 2 (3-7s): Vấn đề 'trước'. Cảnh 3 (8-12s): Giới thiệu sản phẩm. Cảnh 4 (13-19s): Demo 'sau'. Cảnh 5 (20-24s): So sánh trước-sau. Cảnh 6 (25-28s): Social proof. Cảnh 7 (29-30s): CTA. Timeline chi tiết cho từng cảnh.",
      "cta": "CTA thứ ba, có thể 'Không bỏ lỡ!' hoặc 'Hàng ngàn người đã tin tưởng!'",
      "expected_performance": "Phiên bản 3: Dự kiến tăng CTR 35-45% và conversion rate 22-30% vì testimonial và social proof tạo trust mạnh, giảm hesitation và tăng confidence trong quyết định mua hàng."
    }` : ''}
  ]
}`;

    } else if (mode === 'feature') {
      const feature = data.feature_data;
      
      prompt = `Bạn là một copywriter chuyên về chuyển đổi, có khả năng biến những tính năng khô khan thành những lợi ích không thể chối từ.

**MASTER CONTEXT (Bối cảnh chiến dịch):**
*   **Sản phẩm:** ${masterContext.productName}
*   **Mô tả:** ${masterContext.productDescription}
*   **Thị trường:** ${masterContext.targetMarket}
*   **Tính cách thương hiệu:** ${masterContext.brandPersona}
*   **Mục tiêu quảng cáo:** ${masterContext.adGoal}
*   **Góc độ chiến lược chính:** ${masterContext.primaryStrategyAngle}
*   **Cơ hội lớn nhất cần khai thác:** ${masterContext.biggestOpportunity}

**NHIỆM VỤ:**
Viết một mẫu quảng cáo cho nền tảng **${platform}** tập trung vào việc chuyển đổi một tính năng thành lợi ích, sử dụng framework **${format}** (ví dụ: FAB - Features, Advantages, Benefits). Hãy liên kết tính năng này với cơ hội lớn nhất của sản phẩm nếu có thể.

*   **Tính năng cốt lõi:** ${feature.problem} // Dù key là 'problem', trong context này nó là 'tính năng đã giải quyết được vấn đề'
*   **Lợi ích trực tiếp cho khách hàng:** ${feature.reason} // Dữ liệu này không có trong JSON mới, nhưng có thể suy ra từ \`problem\` và \`satisfaction_percent\`
*   **Tỉ lệ hài lòng:** ${feature.satisfaction_percent}%

**YÊU CẦU ĐẦU RA:**
Ngôn ngữ: **Tiếng Việt**.
Tạo **${num_versions} phiên bản** quảng cáo khác nhau để A/B test.

**QUAN TRỌNG - ĐỊNH DẠNG JSON:**
- Chỉ trả về JSON thuần túy, KHÔNG có text giải thích
- KHÔNG có dấu xuống dòng (\\n) trong JSON
- KHÔNG có backslash escape characters
- JSON phải valid và parse được
- Bắt đầu bằng { và kết thúc bằng }

**ĐẶC BIỆT CHO TIKTOK:**
- Nếu platform là TikTok, ad_visual_idea PHẢI là kịch bản video 30 giây
- Chia thành 5-7 cảnh rõ ràng với timeline cụ thể
- Mỗi cảnh phải có format: "Cảnh X (thời gian): mô tả hành động"
- Ví dụ: "Cảnh 1 (0-3s): Hook mạnh. Cảnh 2 (4-8s): Vấn đề. Cảnh 3 (9-15s): Giải pháp..."
{
  "versions": [
    {
      "ad_headline": "Phiên bản 1: Một tiêu đề tập trung vào kết quả cuối cùng mà khách hàng nhận được, nhấn mạnh sự hài lòng. Ví dụ: '95% người dùng hài lòng với tính năng Tự động Tắt/Mở'.",
      "ad_copy": "Phiên bản 1: Nội dung quảng cáo theo framework ${format}. Giới thiệu tính năng, giải thích tại sao nó vượt trội và mô tả lợi ích khách hàng nhận được. Sử dụng con số '${feature.satisfaction_percent}%' như một bằng chứng xã hội mạnh mẽ.",
      "ad_visual_idea": "Phiên bản 1: Kịch bản video TikTok 30 giây demo tính năng. Chia thành 6 cảnh: Cảnh 1 (0-3s): Hook với tính năng. Cảnh 2 (4-8s): Vấn đề cần giải quyết. Cảnh 3 (9-15s): Demo tính năng hoạt động. Cảnh 4 (16-22s): Lợi ích thực tế. Cảnh 5 (23-27s): So sánh với sản phẩm khác. Cảnh 6 (28-30s): CTA. Mỗi cảnh có timeline cụ thể và mô tả chi tiết.",
      "cta": "Lời kêu gọi hành động rõ ràng. Ví dụ: 'Mua ngay để trải nghiệm!'",
      "expected_performance": "Phiên bản 1: Dự kiến tăng CTR 28-38% và conversion rate 16-24% vì demo tính năng trực quan tạo trust, giảm uncertainty và tăng confidence trong sản phẩm."
    }${num_versions > 1 ? `,
    {
      "ad_headline": "Phiên bản 2: Góc tiếp cận khác, có thể tập trung vào tính năng hoặc lợi ích khác biệt.",
      "ad_copy": "Phiên bản 2: Nội dung với tone khác, có thể chuyên nghiệp hơn hoặc thân thiện hơn, vẫn theo framework ${format}.",
      "ad_visual_idea": "Phiên bản 2: Kịch bản video TikTok 30 giây với góc nhìn khác. Chia thành 5 cảnh: Cảnh 1 (0-4s): Hook với lợi ích. Cảnh 2 (5-10s): Giới thiệu tính năng. Cảnh 3 (11-18s): Quá trình sử dụng. Cảnh 4 (19-25s): Kết quả cuối cùng. Cảnh 5 (26-30s): CTA. Timeline chi tiết cho từng cảnh.",
      "cta": "CTA khác biệt, có thể 'Khám phá tính năng!' hoặc 'Trải nghiệm ngay!'",
      "expected_performance": "Phiên bản 2: Dự kiến tăng CTR 22-32% và conversion rate 14-20% vì focus vào lợi ích thực tế thu hút khách hàng quan tâm đến value, tăng quality traffic."
    }` : ''}${num_versions > 2 ? `,
    {
      "ad_headline": "Phiên bản 3: Góc tiếp cận thứ ba, có thể sử dụng urgency hoặc social proof.",
      "ad_copy": "Phiên bản 3: Nội dung với approach khác, có thể sử dụng urgency, scarcity hoặc social proof, vẫn theo framework ${format}.",
      "ad_visual_idea": "Phiên bản 3: Kịch bản video TikTok 30 giây với concept so sánh/testimonial. Chia thành 7 cảnh: Cảnh 1 (0-2s): Hook so sánh. Cảnh 2 (3-7s): Sản phẩm cũ/vấn đề. Cảnh 3 (8-12s): Giới thiệu sản phẩm mới. Cảnh 4 (13-19s): Demo tính năng vượt trội. Cảnh 5 (20-24s): Testimonial/feedback. Cảnh 6 (25-28s): So sánh trực tiếp. Cảnh 7 (29-30s): CTA. Mỗi cảnh có timeline cụ thể.",
      "cta": "CTA thứ ba, có thể 'Đừng bỏ lỡ!' hoặc 'Hàng ngàn người đã tin tưởng!'",
      "expected_performance": "Phiên bản 3: Dự kiến tăng CTR 32-42% và conversion rate 20-28% vì so sánh trực tiếp tạo competitive advantage rõ ràng, giúp khách hàng thấy được sự vượt trội của sản phẩm."
    }` : ''}
  ]
}`;
    }

    console.log('🎬 [AI Ads Generator] Prompt built, calling AI service...');
    console.log('🎬 [AI Ads Generator] Prompt preview:', prompt.substring(0, 200) + '...');

    // Call AI service
    const aiResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.OPENROUTER_REFERER || 'http://localhost:3000',
        'X-Title': 'AIComercer Ads Generator'
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7
      })
    });

    console.log('🎬 [AI Ads Generator] AI response status:', aiResponse.status);

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('🎬 [AI Ads Generator] AI service error:', errorText);
      throw new Error(`AI service error: ${aiResponse.status} - ${errorText}`);
    }

    const aiData = await aiResponse.json() as any;
    const aiContent = aiData.choices?.[0]?.message?.content;

    console.log('🎬 [AI Ads Generator] AI content received:', aiContent ? 'Yes' : 'No');

    if (!aiContent) {
      console.error('🎬 [AI Ads Generator] No content from AI:', aiData);
      throw new Error('No content from AI');
    }

    // Parse AI response with improved error handling
    let adResult;
    try {
      // Clean the AI response first
      let cleanContent = aiContent.trim();
      
      // Remove any text before the first { and after the last }
      const firstBrace = cleanContent.indexOf('{');
      const lastBrace = cleanContent.lastIndexOf('}');
      
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        cleanContent = cleanContent.substring(firstBrace, lastBrace + 1);
      }
      
      // Try to fix common JSON issues
      cleanContent = cleanContent
        .replace(/\\n/g, ' ')  // Replace \n with space
        .replace(/\\"/g, '"')  // Fix escaped quotes
        .replace(/\\'/g, "'")  // Fix escaped single quotes
        .replace(/\\\\/g, '\\'); // Fix double backslashes
      
      console.log('🎬 [AI Ads Generator] Cleaned content:', cleanContent.substring(0, 200) + '...');
      
      adResult = JSON.parse(cleanContent);
      console.log('🎬 [AI Ads Generator] JSON parsed successfully');
      
      // Handle multiple versions format
      if (adResult.versions && Array.isArray(adResult.versions)) {
        adResult = { versions: adResult.versions };
      }
      
    } catch (parseError) {
      console.log('🎬 [AI Ads Generator] JSON parse failed:', parseError instanceof Error ? parseError.message : String(parseError));
      console.log('🎬 [AI Ads Generator] Raw content:', aiContent.substring(0, 500) + '...');
      
      // Try to extract JSON from the content
      try {
        const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const extractedJson = jsonMatch[0]
            .replace(/\\n/g, ' ')
            .replace(/\\"/g, '"')
            .replace(/\\'/g, "'");
          
          adResult = JSON.parse(extractedJson);
          console.log('🎬 [AI Ads Generator] Extracted JSON parsed successfully');
          
          if (adResult.versions && Array.isArray(adResult.versions)) {
            adResult = { versions: adResult.versions };
          }
        } else {
          throw new Error('No JSON found in content');
        }
      } catch (extractError) {
        console.log('🎬 [AI Ads Generator] JSON extraction failed, using fallback');
        // Fallback if JSON parsing fails
        adResult = {
          ad_headline: "Sản phẩm chất lượng cao",
          ad_copy: aiContent,
          ad_visual_idea: "Tạo video showcase sản phẩm",
          cta: "Mua ngay"
        };
      }
    }

    console.log('🎬 [AI Ads Generator] Returning result:', adResult);
    res.json(adResult);

  } catch (error) {
    console.error('🎬 [AI Ads Generator] Error:', error);
    res.status(500).json({ message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

export default router;