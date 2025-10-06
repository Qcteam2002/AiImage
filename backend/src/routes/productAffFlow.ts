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
      // Call OpenRouter API for analysis
      const analysisResult = await analyzeProductWithAI(product, product.language || 'vi', product.segmentation_number || 3);
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
async function analyzeProductWithAI(product: any, language: string = 'vi', segmentationNumber: number = 3) {
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

**LƯU Ý QUAN TRỌNG:**
- Nếu Product Title là "TỰ ĐỘNG EXTRACT TỪ HÌNH ẢNH", hãy phân tích hình ảnh để tạo ra title sản phẩm chính xác
- Nếu Product Description là "TỰ ĐỘNG EXTRACT TỪ HÌNH ẢNH", hãy phân tích hình ảnh để tạo ra mô tả sản phẩm chi tiết
- Sử dụng thông tin từ hình ảnh để bổ sung cho phân tích thị trường

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

export default router;