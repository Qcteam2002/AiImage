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
    const { target_market, image1, image2, title, description } = req.body;
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
      const analysisResult = await analyzeProductWithAI(product);
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
async function analyzeProductWithAI(product: any) {
  const openRouterApiKey = process.env.OPENROUTER_API_KEY;
  
  if (!openRouterApiKey) {
    throw new Error('OpenRouter API key not configured');
  }

  const prompt = `# Analyze product

# ✅ 📌 PROMPT HOÀN CHỈNH KHI PHÂN TÍCH SẢN PHẨM(Có Số Liệu)

*(Phiên bản tối ưu cho Dropship / Affiliate – BẢN CÓ SỐ LIỆU + PHÂN KHÚC KHÁCH HÀNG MỞ RỘNG)*

---

## 🎯 **Bối cảnh**

Tôi đang nghiên cứu và đánh giá tiềm năng kinh doanh của một sản phẩm theo hình thức **dropship hoặc affiliate**. Tôi cần một bản phân tích thị trường chi tiết, có cấu trúc logic, insight rõ ràng, để:

- Xác định khả năng bán hàng của sản phẩm
- Hiểu khách hàng mục tiêu đủ sâu để chọn kênh, angle, cách làm content
- Thiết kế các nội dung truyền thông hiệu quả (video, ads, caption…)

---

## 🧠 **Vai trò của bạn**

Bạn là chuyên gia phân tích thị trường, hành vi khách hàng và chiến lược nội dung thương mại điện tử.

Bạn không cần làm sản phẩm, chỉ cần giúp tôi *bán sản phẩm người khác làm* thông qua **content hiệu quả & insight đúng**.

## 📝 **Khi tôi gửi tên sản phẩm + hình ảnh**, thì bạn cần phải tìm kiếm các nguồn website uy tính và sau đó bạn cần trả về đầy đủ các phần sau, yêu cầu tất cả cần phải có số liệu chứng minh, data rõ ràng:

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

### 🧑‍🤝‍🧑 **Nhóm X: [Tên nhóm khách hàng]**

| **Hạng mục** | **Nội dung cụ thể** |
| --- | --- |
| Phân khúc thị phần | % ước tính nhóm này chiếm |
| Giới tính | % Nam / Nữ |
| Độ tuổi chính | Khoảng tuổi chính, % phân bổ |
| Nghề nghiệp phổ biến | Văn phòng, nội trợ, học sinh, freelancer… |
| Vị trí địa lý chính | Urban / Suburban / Rural / theo quốc gia cụ thể |
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

## 📊 **Yêu cầu trả về JSON**

Trả về đúng cấu trúc JSON sau (bằng tiếng việt):

\`\`\`json

{
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
  },
"target_customers": [
  {
    "name": "Tên nhóm khách hàng 1",
    "market_share_percent": 0,
    "gender_ratio": { "male": 0, "female": 0 },
    "age_range": "xx–yy",
    "occupations": [],
    "locations": "DANH SÁCH CÁC LOCATION CỦA CÁC TẬP SEGEMENTATION THEO TARGET MARKET ĐÃ ĐƯA RA",
    "purchase_frequency": "Theo mùa / Thường xuyên / Dịp lễ",
    "average_budget_usd": 0,
    "buying_behavior": "Tìm gì? Mua ở đâu? Quyết định dựa vào?",
    "usage_context": "Dùng ở đâu, với ai, mục đích gì?",
    "emotional_motivations": "Cảm giác mong muốn",
    "common_painpoints": [
      "Vấn đề 1",
      "Vấn đề 2"
    ],
    "main_channels": ["TikTok", "Facebook", "Pinterest", "Google"],
    "repurchase_or_upsell": {
      "exists": true,
      "estimated_percent": 0
    },
    "painpoint_levels": {
      "high": {
        "percent": 0,
        "description": "Mô tả vấn đề mức độ cao"
      },
      "medium": {
        "percent": 0,
        "description": "Mô tả vấn đề mức độ trung bình"
      },
      "low": {
        "percent": 0,
        "description": "Mô tả vấn đề mức độ thấp"
      }
    },
    "solutions_and_content": [
      {
        "pain_point": "Tên vấn đề",
        "percent_of_customers": 0,
        "usp": "Giải pháp chính",
        "content_hook": "Hook content dùng cho video/caption",
        "ad_visual_idea": "Kịch bản hình/video ngắn"
      },
            {
        "pain_point": "Tên vấn đề 2",
        "percent_of_customers": 0,
        "usp": "Giải pháp chính",
        "content_hook": "Hook content dùng cho video/caption",
        "ad_visual_idea": "Kịch bản hình/video ngắn"
      },
      {
        "pain_point": "Tên vấn đề 3",
        "percent_of_customers": 0,
        "usp": "Giải pháp chính",
        "content_hook": "Hook content dùng cho video/caption",
        "ad_visual_idea": "Kịch bản hình/video ngắn"
      }
    ]
  },
  {
    "name": "Tên nhóm khách hàng 2",
    "market_share_percent": 0,
    "gender_ratio": { "male": 0, "female": 0 },
    "age_range": "xx–yy",
    "occupations": [],
    "locations": "DANH SÁCH CÁC LOCATION CỦA CÁC TẬP SEGEMENTATION THEO TARGET MARKET ĐÃ ĐƯA RA",
    "purchase_frequency": "Theo mùa / Thường xuyên / Dịp lễ",
    "average_budget_usd": 0,
    "buying_behavior": "Tìm gì? Mua ở đâu? Quyết định dựa vào?",
    "usage_context": "Dùng ở đâu, với ai, mục đích gì?",
    "emotional_motivations": "Cảm giác mong muốn",
    "common_painpoints": [
      "Vấn đề 1",
      "Vấn đề 2"
    ],
    "main_channels": ["TikTok", "Facebook", "Pinterest", "Google"],
    "repurchase_or_upsell": {
      "exists": true,
      "estimated_percent": 0
    },
    "painpoint_levels": {
      "high": {
        "percent": 0,
        "description": "Mô tả vấn đề mức độ cao"
      },
      "medium": {
        "percent": 0,
        "description": "Mô tả vấn đề mức độ trung bình"
      },
      "low": {
        "percent": 0,
        "description": "Mô tả vấn đề mức độ thấp"
      }
    },
    "solutions_and_content": [
      {
        "pain_point": "Tên vấn đề",
        "percent_of_customers": 0,
        "usp": "Giải pháp chính",
        "content_hook": "Hook content dùng cho video/caption",
        "ad_visual_idea": "Kịch bản hình/video ngắn"
      },
            {
        "pain_point": "Tên vấn đề 2",
        "percent_of_customers": 0,
        "usp": "Giải pháp chính",
        "content_hook": "Hook content dùng cho video/caption",
        "ad_visual_idea": "Kịch bản hình/video ngắn"
      },
      {
        "pain_point": "Tên vấn đề 3",
        "percent_of_customers": 0,
        "usp": "Giải pháp chính",
        "content_hook": "Hook content dùng cho video/caption",
        "ad_visual_idea": "Kịch bản hình/video ngắn"
      }
    ]
  },
  {
    "name": "Tên nhóm khách hàng 3",
    "market_share_percent": 0,
    "gender_ratio": { "male": 0, "female": 0 },
    "age_range": "xx–yy",
    "occupations": [],
    "locations": "DANH SÁCH CÁC LOCATION CỦA CÁC TẬP SEGEMENTATION THEO TARGET MARKET ĐÃ ĐƯA RA",
    "purchase_frequency": "Theo mùa / Thường xuyên / Dịp lễ",
    "average_budget_usd": 0,
    "buying_behavior": "Tìm gì? Mua ở đâu? Quyết định dựa vào?",
    "usage_context": "Dùng ở đâu, với ai, mục đích gì?",
    "emotional_motivations": "Cảm giác mong muốn",
    "common_painpoints": [
      "Vấn đề 1",
      "Vấn đề 2"
    ],
    "main_channels": ["TikTok", "Facebook", "Pinterest", "Google"],
    "repurchase_or_upsell": {
      "exists": true,
      "estimated_percent": 0
    },
    "painpoint_levels": {
      "high": {
        "percent": 0,
        "description": "Mô tả vấn đề mức độ cao"
      },
      "medium": {
        "percent": 0,
        "description": "Mô tả vấn đề mức độ trung bình"
      },
      "low": {
        "percent": 0,
        "description": "Mô tả vấn đề mức độ thấp"
      }
    },
    "solutions_and_content": [
      {
        "pain_point": "Tên vấn đề 1",
        "percent_of_customers": 0,
        "usp": "Giải pháp chính",
        "content_hook": "Hook content dùng cho video/caption",
        "ad_visual_idea": "Kịch bản hình/video ngắn"
      },
      {
        "pain_point": "Tên vấn đề 2",
        "percent_of_customers": 0,
        "usp": "Giải pháp chính",
        "content_hook": "Hook content dùng cho video/caption",
        "ad_visual_idea": "Kịch bản hình/video ngắn"
      },
      {
        "pain_point": "Tên vấn đề 3",
        "percent_of_customers": 0,
        "usp": "Giải pháp chính",
        "content_hook": "Hook content dùng cho video/caption",
        "ad_visual_idea": "Kịch bản hình/video ngắn"
      }
    ]
  },
  {
    "name": "Tên nhóm khách hàng 4",
    "market_share_percent": 0,
    "gender_ratio": { "male": 0, "female": 0 },
    "age_range": "xx–yy",
    "occupations": [],
    "locations": "DANH SÁCH CÁC LOCATION CỦA CÁC TẬP SEGEMENTATION THEO TARGET MARKET ĐÃ ĐƯA RA",
    "purchase_frequency": "Theo mùa / Thường xuyên / Dịp lễ",
    "average_budget_usd": 0,
    "buying_behavior": "Tìm gì? Mua ở đâu? Quyết định dựa vào?",
    "usage_context": "Dùng ở đâu, với ai, mục đích gì?",
    "emotional_motivations": "Cảm giác mong muốn",
    "common_painpoints": [
      "Vấn đề 1",
      "Vấn đề 2"
    ],
    "main_channels": ["TikTok", "Facebook", "Pinterest", "Google"],
    "repurchase_or_upsell": {
      "exists": true,
      "estimated_percent": 0
    },
    "painpoint_levels": {
      "high": {
        "percent": 0,
        "description": "Mô tả vấn đề mức độ cao"
      },
      "medium": {
        "percent": 0,
        "description": "Mô tả vấn đề mức độ trung bình"
      },
      "low": {
        "percent": 0,
        "description": "Mô tả vấn đề mức độ thấp"
      }
    },
    "solutions_and_content": [
      {
        "pain_point": "Tên vấn đề 1",
        "percent_of_customers": 0,
        "usp": "Giải pháp chính",
        "content_hook": "Hook content dùng cho video/caption",
        "ad_visual_idea": "Kịch bản hình/video ngắn"
      },
      {
        "pain_point": "Tên vấn đề 2",
        "percent_of_customers": 0,
        "usp": "Giải pháp chính",
        "content_hook": "Hook content dùng cho video/caption",
        "ad_visual_idea": "Kịch bản hình/video ngắn"
      },
      {
        "pain_point": "Tên vấn đề 3",
        "percent_of_customers": 0,
        "usp": "Giải pháp chính",
        "content_hook": "Hook content dùng cho video/caption",
        "ad_visual_idea": "Kịch bản hình/video ngắn"
      }
    ]
  },
  {
    "name": "Tên nhóm khách hàng 5",
    "market_share_percent": 0,
    "gender_ratio": { "male": 0, "female": 0 },
    "age_range": "xx–yy",
    "occupations": [],
    "locations": "DANH SÁCH CÁC LOCATION CỦA CÁC TẬP SEGEMENTATION THEO TARGET MARKET ĐÃ ĐƯA RA",
    "purchase_frequency": "Theo mùa / Thường xuyên / Dịp lễ",
    "average_budget_usd": 0,
    "buying_behavior": "Tìm gì? Mua ở đâu? Quyết định dựa vào?",
    "usage_context": "Dùng ở đâu, với ai, mục đích gì?",
    "emotional_motivations": "Cảm giác mong muốn",
    "common_painpoints": [
      "Vấn đề 1",
      "Vấn đề 2"
    ],
    "main_channels": ["TikTok", "Facebook", "Pinterest", "Google"],
    "repurchase_or_upsell": {
      "exists": true,
      "estimated_percent": 0
    },
    "painpoint_levels": {
      "high": {
        "percent": 0,
        "description": "Mô tả vấn đề mức độ cao"
      },
      "medium": {
        "percent": 0,
        "description": "Mô tả vấn đề mức độ trung bình"
      },
      "low": {
        "percent": 0,
        "description": "Mô tả vấn đề mức độ thấp"
      }
    },
    "solutions_and_content": [
      {
        "pain_point": "Tên vấn đề 1",
        "percent_of_customers": 0,
        "usp": "Giải pháp chính",
        "content_hook": "Hook content dùng cho video/caption",
        "ad_visual_idea": "Kịch bản hình/video ngắn"
      },
      {
        "pain_point": "Tên vấn đề 2",
        "percent_of_customers": 0,
        "usp": "Giải pháp chính",
        "content_hook": "Hook content dùng cho video/caption",
        "ad_visual_idea": "Kịch bản hình/video ngắn"
      },
      {
        "pain_point": "Tên vấn đề 3",
        "percent_of_customers": 0,
        "usp": "Giải pháp chính",
        "content_hook": "Hook content dùng cho video/caption",
        "ad_visual_idea": "Kịch bản hình/video ngắn"
      }
    ]
  }
]
,
  "conclusions": [
    {
      "title": "Chiến lược 1: Tập trung vào nhóm khách hàng chính",
      "focus_group_priority": "Tên nhóm khách hàng nên chạy đầu tiên",
      "best_content_angle": "Angle tiềm năng nhất",
      "upsell_combo_suggestions": "Ý tưởng upsell hoặc combo",
      "risks_to_consider": "Pháp lý, mùa vụ, logistics, etc."
    },
    {
      "title": "Chiến lược 2: Mở rộng thị trường mới",
      "focus_group_priority": "Tên nhóm khách hàng nên chạy đầu tiên",
      "best_content_angle": "Angle tiềm năng nhất",
      "upsell_combo_suggestions": "Ý tưởng upsell hoặc combo",
      "risks_to_consider": "Pháp lý, mùa vụ, logistics, etc."
    },
    {
      "title": "Chiến lược 3: Tối ưu hóa nội dung hiện tại",
      "focus_group_priority": "Tên nhóm khách hàng nên chạy đầu tiên",
      "best_content_angle": "Angle tiềm năng nhất",
      "upsell_combo_suggestions": "Ý tưởng upsell hoặc combo",
      "risks_to_consider": "Pháp lý, mùa vụ, logistics, etc."
    }
  ]
}
}
\`\`\`

Hãy phân tích sản phẩm này và trả về kết quả theo đúng cấu trúc JSON trên.`;

  const response = await axios.post(
    'https://openrouter.ai/api/v1/chat/completions',
    {
        model: 'google/gemini-2.5-flash-preview-09-2025',
      messages: [
        {
          role: 'system',
          content: 'Bạn là chuyên gia phân tích thị trường và nhận diện sản phẩm. Bạn có thể phân tích hình ảnh để extract title và description sản phẩm. Trả về CHỈ JSON hợp lệ, không có text thêm, không có markdown formatting.'
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

export default router;