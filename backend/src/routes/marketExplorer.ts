import express, { Request, Response } from 'express';
import { prisma } from '../database/client';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import axios from 'axios';

const router = express.Router();

// Get all market explorers
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const authenticatedReq = req as AuthenticatedRequest;
    console.log('🔍 [MarketExplorer] GET / - Fetching market explorers');
    const { search, status, limit = 50, offset = 0 } = req.query;
    const userId = authenticatedReq.user?.id;

    if (!userId) {
      console.log('❌ [MarketExplorer] GET / - Unauthorized: No userId');
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const where: any = {
      userId: userId,
    };

    if (search) {
      where.OR = [
        { target_country: { contains: search as string, mode: 'insensitive' } },
        { business_model: { contains: search as string, mode: 'insensitive' } },
        { industry_category: { contains: search as string, mode: 'insensitive' } },
        { business_goals: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    const [marketExplorers, total] = await Promise.all([
      prisma.marketExplorer.findMany({
        where,
        orderBy: { created_at: 'desc' },
        take: Number(limit),
        skip: Number(offset),
      }),
      prisma.marketExplorer.count({ where }),
    ]);

    res.json({
      marketExplorers,
      total,
      limit: Number(limit),
      offset: Number(offset),
    });
  } catch (error) {
    console.error('Error fetching market explorers:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get single market explorer
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const authenticatedReq = req as AuthenticatedRequest;
    const { id } = req.params;
    const userId = authenticatedReq.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const marketExplorer = await prisma.marketExplorer.findFirst({
      where: {
        id: id,
        userId: userId,
      },
    });

    if (!marketExplorer) {
      return res.status(404).json({ message: 'Market explorer not found' });
    }

    res.json(marketExplorer);
  } catch (error) {
    console.error('Error fetching market explorer:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new market explorer
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const authenticatedReq = req as AuthenticatedRequest;
    console.log('➕ [MarketExplorer] POST / - Creating new market explorer');
    console.log('📥 Request body:', req.body);
    const { 
      target_country, 
      business_model, 
      industry_category, 
      product_features, 
      business_goals, 
      language = 'vi',
      customer_segments_count = 1,
      niche_count = 3
    } = req.body;
    console.log('📊 Extracted customer_segments_count:', customer_segments_count);
    console.log('📊 Extracted niche_count:', niche_count);
    const userId = authenticatedReq.user?.id;

    if (!userId) {
      console.log('❌ [MarketExplorer] POST / - Unauthorized: No userId');
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!target_country || !business_model) {
      return res.status(400).json({ 
        message: 'Target country and business model are required' 
      });
    }

    const marketExplorer = await prisma.marketExplorer.create({
      data: {
        target_country,
        business_model,
        industry_category: industry_category || null,
        product_features: product_features || null,
        business_goals: business_goals || null,
        language,
        customer_segments_count: Number(customer_segments_count) || 1,
        niche_count: Number(niche_count) || 3,
        userId,
        status: 'waiting',
      },
    });

    console.log('✅ [MarketExplorer] POST / - Market explorer created:', marketExplorer.id);
    res.status(201).json(marketExplorer);
  } catch (error) {
    console.error('Error creating market explorer:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Analyze market explorer
router.post('/:id/analyze', authenticate, async (req: Request, res: Response) => {
  try {
    const authenticatedReq = req as AuthenticatedRequest;
    const { id } = req.params;
    const userId = authenticatedReq.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const marketExplorer = await prisma.marketExplorer.findFirst({
      where: {
        id: id,
        userId: userId,
      },
    });

    if (!marketExplorer) {
      return res.status(404).json({ message: 'Market explorer not found' });
    }

    if (marketExplorer.status === 'processing') {
      return res.status(400).json({ message: 'Analysis already in progress' });
    }

    // Update status to processing
    await prisma.marketExplorer.update({
      where: { id },
      data: { 
        status: 'processing',
        error_message: null,
      },
    });

    // Start analysis in background
    analyzeMarketExplorer(marketExplorer);

    res.json({ 
      message: 'Analysis started', 
      status: 'processing',
      id: marketExplorer.id 
    });
  } catch (error) {
    console.error('Error starting market analysis:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete market explorer
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const authenticatedReq = req as AuthenticatedRequest;
    const { id } = req.params;
    const userId = authenticatedReq.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const marketExplorer = await prisma.marketExplorer.findFirst({
      where: {
        id: id,
        userId: userId,
      },
    });

    if (!marketExplorer) {
      return res.status(404).json({ message: 'Market explorer not found' });
    }

    await prisma.marketExplorer.delete({
      where: { id },
    });

    res.json({ message: 'Market explorer deleted successfully' });
  } catch (error) {
    console.error('Error deleting market explorer:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Background analysis function
async function analyzeMarketExplorer(marketExplorer: any) {
  try {
    console.log('🔍 [MarketExplorer] Starting analysis for:', marketExplorer.id);
    
    const isVietnamese = marketExplorer.target_country?.toLowerCase().includes('vietnam') || 
                        marketExplorer.target_country?.toLowerCase().includes('việt nam') ||
                        marketExplorer.target_country === 'VN';
    
    // Create the comprehensive prompt
    const prompt = `🧭 **Tên Prompt:** MarketExplorer – Phân Tích Thị Trường, Đối Thủ, Khách Hàng & Cơ Hội (v4.0 - Data-Driven + Verifiable Sources)

**🤖 Vai trò của AI:** Bạn là một AI phân tích thị trường e-commerce chuyên sâu. Nhiệm vụ của bạn là tổng hợp dữ liệu vĩ mô và vi mô từ các nguồn đáng tin cậy (Statista, SimilarWeb, eMarketer, Google Trends, báo cáo ngành...) để tạo ra một báo cáo chiến lược duy nhất dưới dạng JSON.

**Quy tắc tối quan trọng:**
- Dữ liệu phải có nguồn: Mọi số liệu thống kê quan trọng (thị phần, CAGR, doanh thu...) phải đi kèm trường "data_source" để kiểm chứng.
- Ưu tiên lượng hóa: Chuyển đổi mọi trường mô tả (vd: "cao", "trung bình") thành thang điểm số (vd: 1-100) để dễ dàng so sánh và xử lý.
- Tư duy từng bước: Trước khi tạo JSON, hãy suy nghĩ nội bộ để xác định các nguồn dữ liệu, phân tích và logic để đưa ra các điểm số và đề xuất.
- Location phải cụ thể: Trong "location_distribution", phải trả về TÊN THÀNH PHỐ/TỈNH CỤ THỂ của quốc gia mục tiêu, KHÔNG phải "Urban/Suburban/Rural". Ví dụ: Vietnam → ["Hồ Chí Minh", "Hà Nội", "Đà Nẵng"], USA → ["New York", "Los Angeles", "Chicago"].
- Mô hình kinh doanh: "Self-Business" có nghĩa là tự sản xuất, tự kinh doanh (như in áo, làm đồ handmade, sản xuất sản phẩm riêng). Trong "model_suitability" phải có "self_business_score" cho tất cả các niche.
- Số lượng niche: Phải trả về đúng số lượng ngành hàng/niche theo yêu cầu (${marketExplorer.niche_count || 3} ngành hàng). Không được ít hơn hoặc nhiều hơn số lượng yêu cầu.
- **Tự động suggest category**: Nếu người dùng không cung cấp ngành hàng cụ thể, AI phải tự phân tích thị trường và đề xuất các ngành hàng/niche có tiềm năng cao nhất dựa trên quốc gia mục tiêu và mô hình kinh doanh. Ưu tiên các ngành hàng đang tăng trưởng mạnh và phù hợp với mô hình kinh doanh được chọn.
- **NGÔN NGỮ TRẢ VỀ: ${marketExplorer.language === 'vi' ? 'TIẾNG VIỆT' : 'ENGLISH'}** - Tất cả nội dung trong JSON phải được viết bằng ${marketExplorer.language === 'vi' ? 'tiếng Việt' : 'English'}. Không được trả về tiếng Anh khi user chọn tiếng Việt.
- Output duy nhất là JSON: Không giải thích, không giới thiệu, không dùng markdown. Chỉ trả về một khối mã JSON hợp lệ.

🧩 **Đầu vào yêu cầu từ người dùng:**
- **Quốc gia mục tiêu:** ${marketExplorer.target_country}
- **Mô hình kinh doanh:** ${marketExplorer.business_model}
- **Ngành hàng hoặc sản phẩm (tùy chọn):** ${marketExplorer.industry_category || 'Chưa xác định - AI sẽ tự phân tích và đề xuất các ngành hàng/niche tiềm năng nhất dựa trên thị trường và mô hình kinh doanh'}
- **Mục tiêu kinh doanh:** ${marketExplorer.business_goals || 'Chưa xác định - AI sẽ phân tích tổng quát'}
- **Số lượng nhóm khách hàng cần phân tích:** ${marketExplorer.customer_segments_count || 1} nhóm
- **Số lượng ngành hàng/niche cần phân tích:** ${marketExplorer.niche_count || 3} ngành hàng
- **Ngôn ngữ trả về:** ${marketExplorer.language === 'vi' ? 'Tiếng Việt' : 'English'}

🎯 **Mục tiêu của hệ thống:**
1. Cung cấp một báo cáo JSON duy nhất, toàn diện, chứa dữ liệu định lượng mới nhất (ưu tiên 2024-2025).
2. Mỗi nhận định phải được chứng minh bằng số liệu và nguồn trích dẫn.
3. Các đề xuất phải phù hợp chặt chẽ với mô hình kinh doanh và mục tiêu người dùng cung cấp.
4. Cấu trúc JSON phải chuẩn và sẵn sàng để tích hợp vào các hệ thống khác (dashboard, AI xử lý phụ trợ).

📊 **Đầu ra yêu cầu (Cấu trúc JSON v4.0):**

{
  "00_executive_summary": {
    "report_metadata": {
      "report_title": "Tổng quan thị trường e-commerce ${marketExplorer.target_country} – ${marketExplorer.business_model} ${marketExplorer.industry_category || 'Đa ngành'}",
      "report_version": "MarketExplorer v4.1",
      "data_timeframe": "2024–2026",
      "forecast_horizon": "2027",
      "confidence_level_percent": 92,
      "last_updated": "2025-10-05",
      "data_sources_primary": ["Statista", "DataReportal", "eMarketer", "SimilarWeb", "Google Trends"]
    },
    "market_highlights": {
      "market_value_usd_billion": {
        "2024": 31,
        "2025": 38,
        "2026": 45,
        "2027_forecast": 52
      },
      "cagr_percent": 24.5,
      "user_base_million": {
        "2024": 63,
        "2025": 68,
        "2026": 73
      },
      "penetration_rate_percent": 67.5,
      "arpu_usd": 448,
      "summary_insight": "Thị trường e-commerce ${marketExplorer.target_country} đang tăng trưởng mạnh nhờ thâm nhập di động cao (>90%) và bùng nổ social commerce. Giai đoạn 2024–2026 được dự báo sẽ chuyển dịch từ tăng trưởng theo khối lượng sang tăng trưởng theo giá trị (AOV tăng đều 5–8%/năm)."
    },
    "key_findings": [
      {
        "theme": "Tăng trưởng thị trường",
        "finding": "Quy mô thị trường TMĐT ${marketExplorer.target_country} dự kiến đạt US$38B vào 2025 và US$45B vào 2026, CAGR 24.5% (2024–2026).",
        "data_source": "Statista Digital Market Outlook 2025"
      },
      {
        "theme": "Hành vi người tiêu dùng",
        "finding": "Người tiêu dùng chuyển mạnh sang mobile commerce (82% giao dịch) và social commerce (dự kiến 20% GMV vào 2026). Nhóm Gen Z chi tiêu trung bình tăng 18% YoY.",
        "data_source": "DataReportal 2025 / eMarketer 2026 Projection"
      },
      {
        "theme": "Cạnh tranh & đối thủ",
        "finding": "Thị trường duy trì mức cạnh tranh trung bình (Market Concentration Score: 65/100). Shopee dẫn đầu với 45.5% thị phần, TikTok Shop dự kiến đạt 15% vào 2026.",
        "data_source": "SimilarWeb Q2 2025 / Metric.vn Forecast Model"
      },
      {
        "theme": "Cơ hội tăng trưởng",
        "finding": "Mô hình ${marketExplorer.business_model} có cơ hội cao nhất trong niche 'Đồ gia dụng thông minh & tiện ích' với điểm tiềm năng 88/100 và lợi nhuận dự kiến tăng 25% trong 2026.",
        "data_source": "Google Trends / Shopify Insights 2025–2026"
      }
    ],
    "growth_drivers_and_challenges": {
      "key_drivers": [
        "Tỷ lệ sử dụng smartphone >90% và thanh toán số chiếm 80% tổng giao dịch.",
        "Chi tiêu trực tuyến bình quân tăng 6–8%/năm.",
        "Social commerce và livestream bán hàng dự kiến tăng trưởng 35% YoY đến 2026."
      ],
      "key_challenges": [
        "Chi phí quảng cáo tăng 18–25%/năm trên TikTok & Meta.",
        "Hạn chế trong logistics cross-border và chi phí vận chuyển cao hơn khu vực 15%.",
        "Niềm tin tiêu dùng với hàng nhập khẩu và hoàn tiền vẫn là rào cản."
      ]
    },
    "strategic_outlook": {
      "top_opportunities": [
        {
          "area": "Dropshipping sản phẩm tiện ích thông minh (2024–2026)",
          "impact_score": 92,
          "confidence_score": 0.9,
          "summary": "Xu hướng smart living tiếp tục tăng mạnh đến 2026, đặc biệt nhờ video viral trên TikTok Shop và KOC review."
        },
        {
          "area": "Affiliate sản phẩm chăm sóc sức khỏe & làm đẹp",
          "impact_score": 84,
          "confidence_score": 0.87,
          "summary": "Thị trường wellness online dự kiến tăng trưởng 19% CAGR đến 2026; affiliate phù hợp cho nội dung chuyên sâu & hướng dẫn sử dụng."
        }
      ],
      "market_outlook_summary": "Giai đoạn 2024–2026 là thời điểm bùng nổ của 'Experience-driven Commerce' — người tiêu dùng chi tiêu cho trải nghiệm, cảm xúc và giá trị thương hiệu thay vì chỉ giá rẻ."
    },
    "strategic_recommendations": [
      {
        "priority_rank": 1,
        "recommendation": "Tập trung xây dựng video UGC ngắn để chiếm lĩnh social commerce và tăng CR ≥2.5% trong 3 tháng.",
        "expected_impact": "Tăng CTR 2–3%, CR 2.5–3% trong quý đầu tiên.",
        "confidence_score": 0.92
      },
      {
        "priority_rank": 2,
        "recommendation": "Đa dạng hóa kênh quảng cáo native (TikTok Ads, Google Discovery, Meta Advantage+).",
        "expected_impact": "Giảm CAC trung bình 15–20% trong 60 ngày đầu.",
        "confidence_score": 0.88
      },
      {
        "priority_rank": 3,
        "recommendation": "Tối ưu logistics nội địa & chính sách đổi trả để tăng Trust Index ≥80/100 trước 2026.",
        "expected_impact": "Cải thiện tỉ lệ giữ chân khách hàng (CRR) thêm 10–12%.",
        "confidence_score": 0.9
      }
    ],
    "visualization_suggestions": {
      "market_growth_over_time": "multi_year_line_chart",
      "growth_drivers_vs_challenges": "dual_axis_column_chart",
      "opportunity_matrix": "impact_confidence_bubble_chart"
    }
  },
  
  "A_market_overview": {
    "market_size": {
      "value_usd": 30000000000,
      "cagr_percent": 24.5,
      "yoy_change_percent": 6.2,
      "data_source": "Statista Digital Market Outlook 2025"
    },
    "user_metrics": {
      "count": 68000000,
      "penetration_rate_percent": 67.5,
      "arpu_usd": 448,
      "mobile_shopping_ratio_percent": 82,
      "data_source": "DataReportal Digital 2025"
    },
    "key_trends": [
      {
        "trend_name": "Social Commerce & Livestreaming",
        "supporting_data": "Doanh số qua social commerce chiếm 15% tổng GMV, tăng 300% YoY.",
        "growth_index_score": 95,
        "data_source": "eMarketer Social Commerce Report"
      }
    ],
    "top_segments_by_revenue": [
      {"segment_name": "Thời trang & Phụ kiện", "revenue_share_percent": 28},
      {"segment_name": "Điện tử & Gia dụng", "revenue_share_percent": 25}
    ],
    "pestle_analysis": {
      "political": {"description": "Chính sách hỗ trợ logistics xuyên biên giới.", "impact_score": 80},
      "economic": {"description": "GDP tăng 6.5%, lạm phát được kiểm soát.", "impact_score": 85},
      "social": {"description": "Dân số trẻ, am hiểu công nghệ.", "impact_score": 90},
      "technological": {"description": "Phổ cập 5G và thanh toán điện tử >90%.", "impact_score": 95},
      "legal": {"description": "Luật bảo vệ người tiêu dùng chặt chẽ.", "impact_score": 60},
      "environmental": {"description": "Nhu cầu sản phẩm bền vững tăng.", "impact_score": 75}
    }
  },
"B_competitor_landscape": {
  "market_structure": {
    "market_concentration_score": 65,
    "market_fragmentation_index": 0.35,
    "market_total_value_usd_billion": 38,
    "competitive_intensity_level": "Moderate",
    "data_source": "Statista 2025 / SimilarWeb 2025",
    "insight_summary": "Thị trường TMĐT ${marketExplorer.target_country} đang ở giai đoạn cạnh tranh trung bình, 3 sàn top đầu chiếm 80% thị phần. Cơ hội nằm ở các mô hình ngách và kênh social commerce mới nổi (TikTok Shop, affiliate niche sites)."
  },
  "top_players": [
    {
      "competitor_name": "Shopee",
      "market_share_percent": {
        "2024": 46.2,
        "2025": 45.5,
        "2026_forecast": 44.1
      },
      "avg_monthly_visits_million": 180,
      "app_downloads_million": 160,
      "customer_retention_rate_percent": 72,
      "ad_spend_estimate_usd_million": 95,
      "business_model": "Marketplace (C2C + B2C)",
      "key_strengths": [
        "Hệ sinh thái tích hợp (ví điện tử, food, logistics)",
        "Chiến lược trợ giá & free shipping",
        "Thu hút mạnh Gen Z & người tiêu dùng giá nhạy cảm"
      ],
      "key_weaknesses": [
        "Chất lượng hàng hóa không đồng đều",
        "Tỷ lệ hoàn đơn cao hơn 15% so với trung bình ngành"
      ],
      "core_channels": ["App", "Social Commerce (TikTok Integration)", "Shopee Live"],
      "estimated_cac_usd": 4.8,
      "aov_usd": 23,
      "data_source": "SimilarWeb / Metric.vn / Data.ai 2025"
    },
    {
      "competitor_name": "Lazada",
      "market_share_percent": {
        "2024": 20.5,
        "2025": 20.1,
        "2026_forecast": 19.3
      },
      "avg_monthly_visits_million": 110,
      "customer_retention_rate_percent": 68,
      "ad_spend_estimate_usd_million": 70,
      "business_model": "Marketplace (B2C)",
      "key_strengths": [
        "LazMall tạo niềm tin về hàng chính hãng",
        "Logistics nội địa mạnh (Lazada Logistics Network)",
        "Chiến dịch marketing hợp tác với KOL"
      ],
      "key_weaknesses": [
        "Traffic tăng chậm, thiếu nội dung viral",
        "UX mua hàng phức tạp hơn Shopee"
      ],
      "core_channels": ["App", "Facebook Ads", "LazLive"],
      "estimated_cac_usd": 5.4,
      "aov_usd": 28,
      "data_source": "SimilarWeb / AppRadar / eMarketer 2025"
    },
    {
      "competitor_name": "TikTok Shop",
      "market_share_percent": {
        "2024": 10.5,
        "2025": 15.0,
        "2026_forecast": 18.5
      },
      "avg_monthly_visits_million": 85,
      "conversion_rate_percent": 3.8,
      "ad_spend_estimate_usd_million": 120,
      "business_model": "Social Commerce",
      "key_strengths": [
        "Livestream & UGC giúp tăng chuyển đổi",
        "Chi phí quảng cáo thấp hơn 25% so với Meta",
        "Tiếp cận mạnh mẽ Gen Z & Gen Alpha"
      ],
      "key_weaknesses": [
        "Giá trị đơn hàng (AOV) thấp",
        "Hạn chế sản phẩm có thương hiệu lớn"
      ],
      "core_channels": ["TikTok", "Affiliate Network", "Influencer KOC"],
      "estimated_cac_usd": 3.1,
      "aov_usd": 18,
      "data_source": "eMarketer Social Commerce Report 2025 / TikTok Insights 2025"
    }
  ],
  "competitive_gap_analysis": {
    "white_space_opportunities": [
      {
        "niche": "Eco-friendly & Sustainable Goods",
        "current_player_focus": "Low",
        "potential_index_score": 89,
        "insight": "Cả Shopee và Lazada chưa có phân khúc mạnh về sản phẩm xanh, cơ hội tốt cho dropship & affiliate nội dung giáo dục."
      },
      {
        "niche": "Premium Beauty & Wellness",
        "current_player_focus": "Medium",
        "potential_index_score": 82,
        "insight": "TikTok Shop tăng trưởng mạnh, nhưng chưa có nền tảng đánh giá đáng tin cậy → phù hợp với affiliate content chuyên sâu."
      }
    ],
    "channel_opportunity_matrix": [
      {"channel": "TikTok Shop", "avg_cac_usd": 3.1, "avg_cr_percent": 3.8, "avg_aov_usd": 18, "growth_score": 92},
      {"channel": "Instagram Reels", "avg_cac_usd": 4.2, "avg_cr_percent": 2.9, "avg_aov_usd": 25, "growth_score": 84},
      {"channel": "Google Shopping", "avg_cac_usd": 5.8, "avg_cr_percent": 2.1, "avg_aov_usd": 35, "growth_score": 76}
    ],
    "data_source": "Aggregated analysis from SimilarWeb, AdsSpy, TikTok Creative Center 2025"
  },
  "chart_data": {
    "market_share_over_time": [
      {"year": 2024, "Shopee": 46.2, "Lazada": 20.5, "TikTok Shop": 10.5, "Others": 22.8},
      {"year": 2025, "Shopee": 45.5, "Lazada": 20.1, "TikTok Shop": 15.0, "Others": 19.4},
      {"year": 2026, "Shopee": 44.1, "Lazada": 19.3, "TikTok Shop": 18.5, "Others": 18.1}
    ],
    "traffic_sources_distribution": [
      {"platform": "Shopee", "organic_percent": 42, "paid_percent": 58},
      {"platform": "Lazada", "organic_percent": 50, "paid_percent": 50},
      {"platform": "TikTok Shop", "organic_percent": 65, "paid_percent": 35}
    ],
    "ad_spend_trend": [
      {"year": 2024, "Shopee": 85, "Lazada": 70, "TikTok Shop": 95},
      {"year": 2025, "Shopee": 95, "Lazada": 70, "TikTok Shop": 120}
    ]
  },
  "insight_summary": "Shopee duy trì vị thế dẫn đầu nhưng tăng trưởng đang chậm lại. TikTok Shop trở thành đối thủ tăng trưởng nhanh nhất với CAGR 34% (2024–2026). Cơ hội nằm ở sản phẩm ngách, giá trị cao, và kênh social commerce với chi phí chuyển đổi thấp."
}
,
"C_customer_segments": [
  {
    "segment_name": "Gen Z (Student & Early Career)",
    "segment_size_percent": 22.5,
    "priority_rank": 1,
    "confidence_score": 0.9,
    "demographics": {
      "age_range": [18, 24],
      "gender_ratio": {"female": 52, "male": 48},
      "avg_income_usd_per_month": 450,
      "location_distribution": ["Tên các thành phố/tỉnh chính của quốc gia mục tiêu"]
    },
    "psychographics": {
      "values": ["Cá nhân hóa", "Thời thượng", "Trải nghiệm mới"],
      "motivations": ["Bắt trend nhanh", "Khẳng định bản thân", "Ảnh hưởng bởi KOL/KOC"],
      "pain_points": ["Giá cao", "Hàng giao chậm", "Sợ hàng fake"]
    },
    "online_behavior": {
      "main_channels": ["TikTok", "Instagram"],
      "purchase_influencers": ["Video ngắn", "KOC review", "Giảm giá Flash sale"],
      "avg_time_online_hr_per_day": 4.8,
      "device_usage": {"mobile_percent": 88, "desktop_percent": 12}
    },
    "purchasing_power": {
      "aov_usd": [50, 150],
      "purchase_frequency_per_month": 3.5,
      "price_sensitivity_score": 80
    },
    "customer_journey": {
      "awareness": "Qua influencer & short videos",
      "consideration": "Đọc review, xem unboxing video",
      "conversion": "Mua qua TikTok Shop hoặc link affiliate",
      "retention": "Tham gia mini game, flash sale tuần"
    },
    "marketing_strategy": {
      "core_message": "Thời trang, công nghệ & lối sống gắn liền cá tính",
      "effective_channels": ["TikTok Shop", "UGC Ads", "Influencer collab"],
      "content_examples": [
        "Video 'unbox honest review'",
        "Series 3 ngày thử sản phẩm thật",
        "Livestream 'trend thử thách' theo hot KOL"
      ]
    },
    "related_niches": ["Phụ kiện thời trang", "Đồ công nghệ mini", "Sản phẩm học tập tiện ích"],
    "data_source": "DataReportal / Think with Google / TikTok Insight 2025",
    "chart_data": {
      "channel_usage": [
        {"platform": "TikTok", "percent": 70},
        {"platform": "Instagram", "percent": 20},
        {"platform": "YouTube", "percent": 10}
      ],
      "spending_pattern": [
        {"category": "Thời trang", "share_percent": 35},
        {"category": "Mỹ phẩm", "share_percent": 25},
        {"category": "Đồ công nghệ", "share_percent": 20},
        {"category": "Khác", "share_percent": 20}
      ]
    }
  },
  {
    "segment_name": "Young Professionals (Millennials & Gen X)",
    "segment_size_percent": 28.5,
    "priority_rank": 2,
    "confidence_score": 0.87,
    "demographics": {
      "age_range": [25, 45],
      "gender_ratio": {"female": 49, "male": 51},
      "avg_income_usd_per_month": 1200,
      "location_distribution": ["Tên các thành phố/tỉnh chính của quốc gia mục tiêu"]
    },
    "psychographics": {
      "values": ["Hiệu suất", "Chất lượng", "Sức khỏe & bền vững"],
      "motivations": ["Tiết kiệm thời gian", "Mua sắm có mục tiêu", "Tránh stress mua sắm"],
      "pain_points": ["Quá nhiều lựa chọn", "Thiếu thông tin minh bạch"]
    },
    "online_behavior": {
      "main_channels": ["Google Search", "Facebook", "YouTube"],
      "purchase_influencers": ["Đánh giá dài", "Blog chuyên môn", "KOL đáng tin cậy"],
      "avg_time_online_hr_per_day": 5.1,
      "device_usage": {"mobile_percent": 65, "desktop_percent": 35}
    },
    "purchasing_power": {
      "aov_usd": [150, 400],
      "purchase_frequency_per_month": 2.1,
      "price_sensitivity_score": 45
    },
    "customer_journey": {
      "awareness": "Qua tìm kiếm Google & quảng cáo remarketing",
      "consideration": "So sánh review, xem video dài",
      "conversion": "Mua qua sàn e-commerce hoặc website thương hiệu",
      "retention": "Chương trình thành viên, email follow-up"
    },
    "marketing_strategy": {
      "core_message": "Sản phẩm đáng tin cậy cho cuộc sống tiện nghi",
      "effective_channels": ["Google Ads", "Email Automation", "Blog SEO"],
      "content_examples": [
        "Case study: 'Tôi tiết kiệm 1 giờ/ngày nhờ sản phẩm X'",
        "Review chuyên gia hoặc tech blog",
        "Email series hướng dẫn tối ưu sử dụng"
      ]
    },
    "related_niches": ["Gia dụng thông minh", "Sức khỏe & lifestyle", "Văn phòng tiện ích"],
    "data_source": "Statista / SimilarWeb / Google Market Insight 2025",
    "chart_data": {
      "channel_usage": [
        {"platform": "Facebook", "percent": 40},
        {"platform": "Google Search", "percent": 35},
        {"platform": "YouTube", "percent": 25}
      ],
      "spending_pattern": [
        {"category": "Gia dụng", "share_percent": 30},
        {"category": "Sức khỏe", "share_percent": 25},
        {"category": "Công nghệ", "share_percent": 20},
        {"category": "Khác", "share_percent": 25}
      ]
    }
  }
],
  "D_niche_opportunities": [
    // Phải trả về đúng ${marketExplorer.niche_count || 3} ngành hàng/niche theo yêu cầu
    {
      "niche_name": "Đồ gia dụng thông minh & tiện ích",
      "target_customer_segment": "Millennials thành thị",
      "model_suitability": {
        "dropshipping_score": 90,
        "affiliate_score": 70,
        "self_business_score": 85,
        "reason": "Sản phẩm dễ demo qua video (tốt cho Dropship), nội dung review chuyên sâu (tốt cho Affiliate), có thể tự sản xuất và kiểm soát chất lượng (tốt cho Tự kinh doanh)."
      },
      "competition_profit_metrics": {
        "competition_level_score": 55,
        "note": "Thang điểm 1-100, điểm càng cao cạnh tranh càng gay gắt.",
        "estimated_profit_margin_percent": [30, 50],
        "data_source": "Phân tích từ Google Trends & các tool spy ads"
      },
      "potential_score": 88,
      "potential_score_breakdown": {
        "market_demand_score": 90,
        "low_competition_score": 70,
        "profitability_score": 95,
        "trend_alignment_score": 90
      },
      "product_ideas": [
        "Máy hút bụi cầm tay không dây",
        "Ổ cắm điện thông minh điều khiển qua app"
      ],
      "marketing_strategy": {
        "core_message": "Giải pháp thông minh cho ngôi nhà hiện đại, tiết kiệm thời gian.",
        "recommended_channels": ["TikTok Shop", "YouTube Shorts (Affiliate review)", "SEO Blog"],
        "content_angle": "Tập trung vào video 'trước & sau' khi sử dụng sản phẩm."
      }
    }
  ],
  "E_risk_analysis": {
    "market_risks": [
      {"risk": "Cạnh tranh về giá từ các sàn lớn", "severity_score": 80, "mitigation": "Tạo thương hiệu riêng, tập trung vào chất lượng và dịch vụ khách hàng."},
      {"risk": "Thay đổi thuật toán của các kênh quảng cáo (Facebook, TikTok)", "severity_score": 75, "mitigation": "Xây dựng đa kênh, tập trung vào owned media (email list, SEO)."}
    ],
    "operational_risks": [
      {"risk": "Vấn đề logistics (chậm trễ, thất lạc hàng)", "severity_score": 70, "mitigation": "Làm việc với các đơn vị fulfillment uy tín (3PL), có chính sách hoàn tiền rõ ràng."},
      {"risk": "Tỷ giá hối đoái biến động (nếu nhập hàng)", "severity_score": 60, "mitigation": "Sử dụng các công cụ phòng hộ tài chính hoặc đàm phán giá cố định theo quý."}
    ]
  },
  "F_strategic_notes_and_tools": {
    "regulations_taxes": {"vat_gst_percent": 10, "note": "Cần đăng ký kinh doanh và tuân thủ luật bảo vệ người tiêu dùng."},
    "payment_gateways": ["COD", "MoMo", "VNPay-QR", "Visa/Mastercard"],
    "logistics_providers": ["GHN", "GHTK", "Viettel Post"],
    "recommended_tools": [
      {"tool": "Google Trends", "use_case": "Nghiên cứu xu hướng từ khóa."},
      {"tool": "SimilarWeb", "use_case": "Phân tích traffic và chiến lược của đối thủ."},
      {"tool": "Metric.vn", "use_case": "Phân tích dữ liệu sàn TMĐT tại Việt Nam."}
    ]
  }
}`;

    // Get OpenRouter API key
    const openRouterApiKey = process.env.OPENROUTER_API_KEY;
    if (!openRouterApiKey) {
      console.error('❌ [MarketExplorer] OPENROUTER_API_KEY not found');
      throw new Error('OpenRouter API key not configured');
    }

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'google/gemini-2.5-flash-preview-09-2025',
        messages: [
          {
            role: 'system',
            content: isVietnamese 
              ? 'Bạn là chuyên gia phân tích thị trường e-commerce toàn cầu. Trả về CHỈ JSON hợp lệ bằng tiếng Việt, không có text thêm, không có markdown formatting. Tất cả nội dung trong JSON phải được viết bằng tiếng Việt.'
              : 'You are a global e-commerce market analysis expert. Return ONLY valid JSON in English, no additional text, no markdown formatting. All content in the JSON must be written in English.'
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

    const analysisResult = response.data.choices[0].message.content;
    
    // Update the market explorer with results
    await prisma.marketExplorer.update({
      where: { id: marketExplorer.id },
      data: {
        status: 'done',
        analysis_result: analysisResult,
        analyzed_at: new Date(),
        error_message: null,
      },
    });

    console.log('✅ [MarketExplorer] Analysis completed for:', marketExplorer.id);
  } catch (error) {
    console.error('❌ [MarketExplorer] Analysis failed for:', marketExplorer.id, error);
    
    // Update with error status
    await prisma.marketExplorer.update({
      where: { id: marketExplorer.id },
      data: {
        status: 'error',
        error_message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
    });
  }
}

export default router;
