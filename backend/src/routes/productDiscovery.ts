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

// Product Discovery API endpoint
router.post('/suggest', async (req, res) => {
  try {
    console.log('🔍 [Product Discovery] Request received:', req.body);
    
    const { 
      business_model, 
      niches, 
      competition_level, 
      target_market, 
      time_factor = 'evergreen',
      language = 'vi',
      submit_date
    } = req.body;

    console.log('🔍 [Product Discovery] Parsed params:', { 
      business_model, 
      niches, 
      competition_level, 
      target_market, 
      time_factor, 
      language,
      submit_date
    });

    // Build comprehensive prompt for AI
    const prompt = `Bạn là một nhà phân tích xu hướng và chiến lược gia sản phẩm E-commerce hàng đầu. Nhiệm vụ của bạn là tìm ra các cơ hội sản phẩm tiềm năng cho một doanh nhân mới bắt đầu, dựa trên các tiêu chí họ cung cấp.

**TIÊU CHÍ CỦA NGƯỜI DÙNG:**
- **Mô hình Kinh doanh:** ${business_model}
- **Lĩnh vực quan tâm:** ${niches.join(', ')}
- **Mức độ cạnh tranh mong muốn:** ${competition_level}
- **Thị trường mục tiêu:** ${target_market}
- **Yếu tố thời gian:** ${time_factor}
- **Ngôn ngữ:** ${language}
- **Ngày submit:** ${submit_date ? new Date(submit_date).toLocaleDateString('vi-VN', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    weekday: 'long'
  }) : 'Không xác định'}

**QUY TRÌNH LÀM VIỆC CỦA BẠN:**

1. **Phân tích Thời điểm:** Dựa vào yếu tố thời gian đã chọn và ngày submit hiện tại, hãy xác định các cơ hội phù hợp.
   - **Nếu là "seasonal":** Dựa vào ngày submit (${submit_date ? new Date(submit_date).toLocaleDateString('vi-VN', { 
     year: 'numeric', 
     month: 'long', 
     day: 'numeric'
   }) : 'hiện tại'}), hãy xác định dịp lễ lớn sắp tới tại thị trường ${target_market}. Ví dụ: nếu đang là tháng 11-12, tập trung vào Tết Nguyên Đán; nếu đang là tháng 9-10, tập trung vào Halloween/Black Friday.
   - **Nếu là "short_term":** Hãy sử dụng công cụ tìm kiếm của bạn để tìm các chủ đề, meme, câu nói viral đang thịnh hành trong 30 ngày qua tại ${target_market} (tính từ ngày submit).
   - **Nếu là "evergreen":** Hãy tập trung vào các ngách có nhu cầu ổn định, không phụ thuộc vào mùa vụ.
2. **Brainstorm:** Dựa trên các lĩnh vực quan tâm, liệt kê 5-10 ý tưởng sản phẩm ngách phù hợp với mô hình kinh doanh đã chọn.

3. **Thu thập dữ liệu:** Với mỗi ý tưởng, hãy sử dụng công cụ tìm kiếm của bạn để thu thập các dữ liệu sau cho thị trường ${target_market}:
   - Ước tính lượng tìm kiếm hàng tháng (Search Volume).
   - Xu hướng trên Google Trends (12 tháng qua).
   - Mức độ cạnh tranh (số lượng listing trên Amazon/eBay, chi phí CPC cho từ khóa chính).
   - Khoảng giá bán lẻ phổ biến.
   - Ước tính giá vốn (ví dụ từ AliExpress cho dropshipping, hoặc chi phí sản xuất cơ bản).

4. **Phân tích & Chấm điểm:** Dựa trên dữ liệu thu thập, hãy đánh giá từng ý tưởng và chọn ra 3-4 cơ hội tốt nhất. Một cơ hội tốt cần có sự cân bằng giữa nhu cầu cao, cạnh tranh có thể quản lý được, và tiềm năng lợi nhuận tốt.

5. **Tạo Báo cáo:** Với mỗi cơ hội được chọn, hãy trình bày thông tin theo định dạng JSON dưới đây.

**YÊU CẦU ĐẦU RA:**
Ngôn ngữ: **${language === 'vi' ? 'Tiếng Việt' : 'English'}**.
Trả về một mảng JSON (JSON array), mỗi object trong mảng là một cơ hội sản phẩm.

**QUAN TRỌNG - ĐỊNH DẠNG JSON:**
- Chỉ trả về JSON thuần túy, KHÔNG có text giải thích
- KHÔNG có dấu xuống dòng (\\n) trong JSON
- KHÔNG có backslash escape characters
- JSON phải valid và parse được
- Bắt đầu bằng [ và kết thúc bằng ]

[
  {
    "product_name": "Tên sản phẩm gợi ý",
    "image_query": "Từ khóa để tìm hình ảnh minh họa cho sản phẩm này",
    "metrics": {
      "demand_score": 8,
      "competition_score": 4,
      "profit_potential": "Cao",
      "trend": "Tăng trưởng"
    },
    "timing_analysis": {
      "type": "Seasonal",
      "window": "Tháng 12 - Tháng 2",
      "reason": "Đây là sản phẩm phục vụ cho dịp Tết Âm Lịch, nhu cầu mua sắm quà tặng và trang trí tăng đột biến."
    },
    "ai_summary": "Một đoạn văn ngắn (2-3 câu) giải thích tại sao sản phẩm này là một cơ hội tốt.",
    "detailed_analysis": {
      "opportunity_overview": "Giải thích sâu hơn về thị trường và lý do tại sao đây là thời điểm tốt để tham gia.",
      "target_customer_profile": {
        "description": "Mô tả ngắn về khách hàng mục tiêu.",
        "pain_points": ["Nỗi đau 1", "Nỗi đau 2"]
      },
      "marketing_angles": ["Góc độ marketing 1", "Góc độ marketing 2", "Góc độ marketing 3"],
      "potential_risks": ["Rủi ro tiềm ẩn 1", "Rủi ro tiềm ẩn 2"]
    },
    "shopee_search": {
      "keywords": [
        "Từ khóa 1 để tìm trên Shopee",
        "Từ khóa 2 để tìm trên Shopee",
        "Từ khóa 3 để tìm trên Shopee"
      ],
      "search_url": "https://shopee.vn/search?keyword=tu%20khoa%20san%20pham"
    }
  }
]`;

    console.log('🔍 [Product Discovery] Prompt built, calling AI service...');

    // Call AI service
    const aiResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.OPENROUTER_REFERER || 'http://localhost:3000',
        'X-Title': 'AIComercer Product Discovery'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-preview-09-2025',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 3000,
        temperature: 0.7
      })
    });

    console.log('🔍 [Product Discovery] AI response status:', aiResponse.status);

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('🔍 [Product Discovery] AI service error:', errorText);
      throw new Error(`AI service error: ${aiResponse.status} - ${errorText}`);
    }

    const aiData = await aiResponse.json() as any;
    const aiContent = aiData.choices?.[0]?.message?.content;

    console.log('🔍 [Product Discovery] AI content received:', aiContent ? 'Yes' : 'No');

    if (!aiContent) {
      console.error('🔍 [Product Discovery] No content from AI:', aiData);
      throw new Error('No content from AI');
    }

    // Parse AI response with improved error handling
    let opportunities;
    try {
      // Clean the AI response first
      let cleanContent = aiContent.trim();
      
      // Remove any text before the first [ and after the last ]
      const firstBracket = cleanContent.indexOf('[');
      const lastBracket = cleanContent.lastIndexOf(']');
      
      if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
        cleanContent = cleanContent.substring(firstBracket, lastBracket + 1);
      }
      
      // Try to fix common JSON issues
      cleanContent = cleanContent
        .replace(/\\n/g, ' ')  // Replace \n with space
        .replace(/\\"/g, '"')  // Fix escaped quotes
        .replace(/\\'/g, "'")  // Fix escaped single quotes
        .replace(/\\\\/g, '\\'); // Fix double backslashes
      
      console.log('🔍 [Product Discovery] Cleaned content:', cleanContent.substring(0, 200) + '...');
      
      opportunities = JSON.parse(cleanContent);
      console.log('🔍 [Product Discovery] JSON parsed successfully');
      
    } catch (parseError) {
      console.log('🔍 [Product Discovery] JSON parse failed:', parseError instanceof Error ? parseError.message : String(parseError));
      console.log('🔍 [Product Discovery] Raw content:', aiContent.substring(0, 500) + '...');
      
      // Try to extract JSON from the content
      try {
        const jsonMatch = aiContent.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const extractedJson = jsonMatch[0]
            .replace(/\\n/g, ' ')
            .replace(/\\"/g, '"')
            .replace(/\\'/g, "'");
          
          opportunities = JSON.parse(extractedJson);
          console.log('🔍 [Product Discovery] Extracted JSON parsed successfully');
        } else {
          throw new Error('No JSON found in content');
        }
      } catch (extractError) {
        console.log('🔍 [Product Discovery] JSON extraction failed, using fallback');
        // Fallback if JSON parsing fails
        opportunities = [
          {
            product_name: "Sản phẩm tiềm năng",
            image_query: "trending product",
            metrics: {
              demand_score: 7,
              competition_score: 5,
              profit_potential: "Trung bình",
              trend: "Ổn định"
            },
            timing_analysis: {
              type: "Evergreen",
              window: "Quanh năm",
              reason: "Sản phẩm có nhu cầu ổn định"
            },
            ai_summary: "Đây là một cơ hội sản phẩm tiềm năng dựa trên phân tích thị trường.",
            detailed_analysis: {
              opportunity_overview: "Thị trường có tiềm năng phát triển tốt.",
              target_customer_profile: {
                description: "Khách hàng mục tiêu chính",
                pain_points: ["Vấn đề 1", "Vấn đề 2"]
              },
              marketing_angles: ["Góc độ 1", "Góc độ 2"],
              potential_risks: ["Rủi ro 1", "Rủi ro 2"]
            }
          }
        ];
      }
    }

    console.log('🔍 [Product Discovery] Returning opportunities:', opportunities.length);
    res.json({ opportunities });

  } catch (error) {
    console.error('🔍 [Product Discovery] Error:', error);
    res.status(500).json({ message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Test endpoint for product discovery
router.post('/suggest-test', async (req, res) => {
  try {
    console.log('🧪 [Product Discovery Test] Request received:', req.body);
    
    const { 
      business_model, 
      country, 
      product_count = 5,
      start_date,
      end_date,
      submit_date,
      existing_ideas = []
    } = req.body;

    console.log('🧪 [Product Discovery Test] Parsed params:', { 
      business_model, 
      country, 
      product_count,
      start_date,
      end_date,
      submit_date,
      existing_ideas_count: existing_ideas.length
    });

    // Build comprehensive prompt for AI
    const prompt = `Bạn là chuyên gia phân tích sản phẩm E-commerce. Tạo ${product_count} sản phẩm cho mô hình ${business_model} tại ${country} trong thời gian ${start_date} đến ${end_date}.

YÊU CẦU:
- Tên sản phẩm THẬT, cụ thể, không generic
- JSON hợp lệ 100%, không có newline trong string
- Không trùng lặp với ý tưởng hiện có

${existing_ideas.length > 0 ? `Ý TƯỞNG HIỆN CÓ (TRÁNH TRÙNG LẶP):
${existing_ideas.map((idea: any) => `- ${idea.product_name || idea}`).join('\n')}` : ''}

TRẢ VỀ JSON ARRAY:
Trả về một mảng JSON (JSON array), mỗi object trong mảng là một cơ hội sản phẩm.

**BẮT BUỘC VỀ THỜI GIAN:**
- Trong "timing_analysis", trường "window" PHẢI đúng chính xác: "${start_date} - ${end_date}" (bao gồm cả ngày kết thúc).
- Thêm trường "window_months": một mảng liệt kê tất cả các tháng trong khoảng thời gian trên theo định dạng YYYY-MM (bao gồm cả tháng bắt đầu và kết thúc). Ví dụ: ["2025-10", "2025-11", "2025-12"].

**QUAN TRỌNG - ĐỊNH DẠNG JSON:**
- CHỈ trả về JSON thuần túy, KHÔNG có bất kỳ text giải thích nào
- KHÔNG có dấu xuống dòng (\\n) trong JSON
- KHÔNG có backslash escape characters
- JSON phải valid và parse được
- Bắt đầu bằng [ và kết thúc bằng ]
- KHÔNG được thêm bất kỳ text nào trước hoặc sau JSON
- KHÔNG được giải thích về việc thu thập dữ liệu hay hạn chế của AI
- PHẢI tạo ra tên sản phẩm THẬT, cụ thể, không được dùng tên generic như "Sản phẩm Premium affiliate 1"
- Mỗi sản phẩm phải có tên riêng biệt, mô tả chi tiết và thông tin thực tế

[
  {
    "product_name": "Tên sản phẩm gợi ý",
    "category": "Danh mục sản phẩm (ví dụ: Thời trang, Điện tử, Gia dụng, Làm đẹp, Thể thao, v.v.)",
    "image_query": "Từ khóa để tìm hình ảnh minh họa cho sản phẩm này",
    "metrics": {
      "demand_score": 8,
      "competition_score": 4,
      "profit_potential": "Cao",
      "trend": "Tăng trưởng"
    },
    "timing_analysis": {
      "type": "Seasonal",
      "window": "Tháng 12 - Tháng 2",
      "reason": "Đây là sản phẩm phục vụ cho dịp Tết Âm Lịch, nhu cầu mua sắm quà tặng và trang trí tăng đột biến."
    },
    "ai_summary": "Một đoạn văn ngắn (2-3 câu) giải thích tại sao sản phẩm này là một cơ hội tốt.",
    "detailed_analysis": {
      "opportunity_overview": "Giải thích sâu hơn về thị trường và lý do tại sao đây là thời điểm tốt để tham gia.",
      "target_customer_profile": {
        "description": "Mô tả ngắn về khách hàng mục tiêu.",
        "pain_points": ["Nỗi đau 1", "Nỗi đau 2"]
      },
      "marketing_angles": ["Góc độ marketing 1", "Góc độ marketing 2", "Góc độ marketing 3"],
      "potential_risks": ["Rủi ro tiềm ẩn 1", "Rủi ro tiềm ẩn 2"]
    }
  }
]`;

    console.log('🧪 [Product Discovery Test] Prompt built, calling AI service...');

    // Retry mechanism for AI calls
    let aiResponse;
    let aiContent;
    let retryCount = 0;
    const maxRetries = 2;

    while (retryCount <= maxRetries) {
      try {
        aiResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': process.env.OPENROUTER_REFERER || 'http://localhost:3000',
            'X-Title': 'AIComercer Product Discovery Test'
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash-preview-09-2025',
            messages: [
              {
                role: 'user',
                content: prompt
              }
            ],
            max_tokens: 4000,
            temperature: 0.3 // Lower temperature for more consistent JSON
          })
        });

        console.log('🧪 [Product Discovery Test] AI response status:', aiResponse.status);

        if (!aiResponse.ok) {
          const errorText = await aiResponse.text();
          console.error('🧪 [Product Discovery Test] AI service error:', errorText);
          throw new Error(`AI service error: ${aiResponse.status} - ${errorText}`);
        }

        const aiData = await aiResponse.json() as any;
        aiContent = aiData.choices?.[0]?.message?.content;

        console.log('🧪 [Product Discovery Test] AI content received:', aiContent ? 'Yes' : 'No');

        if (!aiContent) {
          console.error('🧪 [Product Discovery Test] No content from AI:', aiData);
          throw new Error('No content from AI');
        }

        // Try to parse the content
        let testParse = aiContent.trim();
        testParse = testParse.replace(/```json\s*/g, '').replace(/```\s*/g, '');
        const firstBracket = testParse.indexOf('[');
        const lastBracket = testParse.lastIndexOf(']');
        if (firstBracket !== -1 && lastBracket !== -1) {
          testParse = testParse.substring(firstBracket, lastBracket + 1);
        }
        
        // Quick validation - if it looks like valid JSON, break
        if (testParse.startsWith('[') && testParse.endsWith(']')) {
          console.log('🧪 [Product Discovery Test] AI response looks valid, proceeding with parsing');
          break;
        } else {
          throw new Error('AI response does not contain valid JSON array');
        }

      } catch (error) {
        retryCount++;
        console.log(`🧪 [Product Discovery Test] Attempt ${retryCount} failed:`, error instanceof Error ? error.message : String(error));
        
        if (retryCount > maxRetries) {
          throw error;
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // aiContent is already extracted in the retry loop above

    // Parse AI response with improved error handling
    let opportunities;
    try {
      // Clean the AI response first
      let cleanContent = aiContent.trim();
      
      // Remove any text before the first [ and after the last ]
      const firstBracket = cleanContent.indexOf('[');
      const lastBracket = cleanContent.lastIndexOf(']');
      
      if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
        cleanContent = cleanContent.substring(firstBracket, lastBracket + 1);
      }
      
      // Try to fix common JSON issues
      cleanContent = cleanContent
        .replace(/\\n/g, ' ')  // Replace \n with space
        .replace(/\\"/g, '"')  // Fix escaped quotes
        .replace(/\\'/g, "'")  // Fix escaped single quotes
        .replace(/\\\\/g, '\\') // Fix double backslashes
        .replace(/\n/g, ' ')   // Replace actual newlines with space
        .replace(/\r/g, ' ')   // Replace carriage returns
        .replace(/\t/g, ' ')   // Replace tabs
        .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
        .replace(/,\s*}/g, '}') // Remove trailing commas before }
        .replace(/,\s*]/g, ']'); // Remove trailing commas before ]
      
      console.log('🧪 [Product Discovery Test] Cleaned content:', cleanContent.substring(0, 200) + '...');
      
      opportunities = JSON.parse(cleanContent);
      console.log('🧪 [Product Discovery Test] JSON parsed successfully');
      
    } catch (parseError) {
      console.log('🧪 [Product Discovery Test] JSON parse failed:', parseError instanceof Error ? parseError.message : String(parseError));
      console.log('🧪 [Product Discovery Test] Raw content:', aiContent.substring(0, 500) + '...');
      
      // Try multiple extraction methods
      try {
        // Method 1: Find JSON array with regex
        const jsonMatch = aiContent.match(/\[[\s\S]*?\]/);
        if (jsonMatch) {
          let extractedJson = jsonMatch[0]
            .replace(/\\n/g, ' ')
            .replace(/\\"/g, '"')
            .replace(/\\'/g, "'")
            .replace(/\n/g, ' ')
            .replace(/\r/g, ' ')
            .replace(/\t/g, ' ');
          
          opportunities = JSON.parse(extractedJson);
          console.log('🧪 [Product Discovery Test] Extracted JSON parsed successfully');
        } else {
          // Method 2: Try to find complete JSON objects
          const jsonObjects = aiContent.match(/\{[^{}]*"product_name"[^{}]*\}/g);
          if (jsonObjects && jsonObjects.length > 0) {
            const jsonArray = '[' + jsonObjects.join(',') + ']';
            opportunities = JSON.parse(jsonArray);
            console.log('🧪 [Product Discovery Test] JSON objects extracted successfully');
          } else {
            throw new Error('No JSON found in content');
          }
        }
      } catch (extractError) {
        console.log('🧪 [Product Discovery Test] JSON extraction failed, using fallback');
        // Fallback if JSON parsing fails - create mock data based on request
        const mockProducts = [];
        const productTypes = ["Premium", "Budget", "Eco-friendly", "Tech", "Lifestyle", "Health", "Beauty", "Home", "Sports", "Travel"];
        
        for (let i = 1; i <= Math.min(product_count, 5); i++) {
          const productType = productTypes[(i - 1) % productTypes.length];
          const productName = existing_ideas.length > 0 
            ? `Sản phẩm ${productType} ${business_model} ${i + existing_ideas.length} - ${country}`
            : `Sản phẩm ${productType} ${business_model} ${i} - ${country}`;
            
          mockProducts.push({
            product_name: productName,
            image_query: `${productType} ${business_model} product`,
            metrics: {
              demand_score: Math.floor(Math.random() * 4) + 6, // 6-10
              competition_score: Math.floor(Math.random() * 4) + 3, // 3-6
              profit_potential: ["Cao", "Trung bình", "Thấp"][Math.floor(Math.random() * 3)],
              trend: ["Tăng trưởng", "Ổn định", "Giảm"][Math.floor(Math.random() * 3)]
            },
            timing_analysis: {
              type: "Seasonal",
              window: `${start_date} - ${end_date}`,
              reason: `Sản phẩm ${productType} phù hợp với thời gian từ ${start_date} đến ${end_date} tại ${country}`
            },
            ai_summary: `Đây là cơ hội sản phẩm ${productType} ${business_model} tiềm năng cho thị trường ${country} trong khoảng thời gian đã chọn.`,
            detailed_analysis: {
              opportunity_overview: `Thị trường ${country} có tiềm năng phát triển tốt cho mô hình ${business_model} với sản phẩm ${productType}.`,
              target_customer_profile: {
                description: `Khách hàng mục tiêu tại ${country} quan tâm đến ${productType} ${business_model}`,
                pain_points: ["Vấn đề 1", "Vấn đề 2"]
              },
              marketing_angles: [`Góc độ ${productType} 1`, `Góc độ ${productType} 2`],
              potential_risks: ["Rủi ro thị trường", "Rủi ro cạnh tranh"]
            },
            shopee_search: {
              keywords: [
                `${productType} ${business_model} chính hãng`,
                `${productType} ${business_model} giá rẻ`,
                `${productType} ${business_model} tốt nhất`
              ],
              search_url: `https://shopee.vn/search?keyword=${encodeURIComponent(productType + ' ' + business_model)}`
            }
          });
        }
        opportunities = mockProducts;
      }
    }

    // Enrich results with Shopee search helper if missing
    const enriched = (opportunities || []).map((item: any) => {
      if (item && !item.shopee_search) {
        const base = (item.product_name || '').toString().trim();
        const keywords = base
          ? [
              `${base} chính hãng`,
              `${base} giá rẻ`,
              `${base} tốt nhất`
            ]
          : [];
        const first = keywords[0] || base || '';
        return {
          ...item,
          shopee_search: {
            keywords,
            search_url: first ? `https://shopee.vn/search?keyword=${encodeURIComponent(first)}` : undefined,
          },
        };
      }
      return item;
    });

    // Compute window months server-side to ensure inclusion of full range
    const toMonths = (start: string, end: string) => {
      try {
        const out: string[] = [];
        const s = new Date(start);
        const e = new Date(end);
        if (isNaN(s.getTime()) || isNaN(e.getTime())) return out;
        const d = new Date(Date.UTC(s.getUTCFullYear(), s.getUTCMonth(), 1));
        const last = new Date(Date.UTC(e.getUTCFullYear(), e.getUTCMonth(), 1));
        while (d <= last) {
          out.push(`${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`);
          d.setUTCMonth(d.getUTCMonth() + 1);
        }
        return out;
      } catch { return []; }
    };

    const enrichedWithWindow = enriched.map((item: any) => ({
      ...item,
      timing_analysis: {
        ...item.timing_analysis,
        computed_window: `${start_date} - ${end_date}`,
        computed_window_months: toMonths(start_date, end_date),
      }
    }));

    console.log('🧪 [Product Discovery Test] Returning opportunities:', enrichedWithWindow.length);
    res.json({ 
      success: true,
      opportunities: enrichedWithWindow,
      test_info: {
        business_model,
        country,
        product_count,
        start_date,
        end_date,
        submit_date
      }
    });

  } catch (error) {
    console.error('🧪 [Product Discovery Test] Error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Search Product endpoint
router.post('/search-product', upload.single('image'), async (req, res) => {
  try {
    const openRouterApiKey = process.env.OPENROUTER_API_KEY;
    
    if (!openRouterApiKey) {
      return res.status(500).json({ error: 'OpenRouter API key not configured' });
    }

    // Handle file upload or URL
    let imageData = null;
    
    if (req.body.imageUrl) {
      // Handle URL input
      imageData = req.body.imageUrl;
    } else if (req.file) {
      // Handle file upload
      imageData = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    } else {
      return res.status(400).json({ error: 'No image provided' });
    }

    const prompt = `# Tìm Kiếm Sản Phẩm

Bạn là chuyên gia phân tích sản phẩm và thị trường. Hãy phân tích hình ảnh sản phẩm này và cung cấp thông tin chi tiết về sản phẩm.

## Yêu cầu:
1. Xác định tên sản phẩm chính xác
2. Mô tả chi tiết sản phẩm
3. Phân loại danh mục sản phẩm
4. Ước tính giá bán trên thị trường
5. Đánh giá tiềm năng thị trường
6. Gợi ý từ khóa tìm kiếm
7. Liệt kê sản phẩm tương tự

## Trả về JSON với cấu trúc:
\`\`\`json
{
  "products": [
    {
      "product_name": "Tên sản phẩm chính xác",
      "description": "Mô tả chi tiết về sản phẩm, tính năng, công dụng",
      "category": "Danh mục sản phẩm",
      "estimated_price": "Giá ước tính (VD: 50-100 USD, 500,000-1,000,000 VND)",
      "market_potential": "Đánh giá tiềm năng thị trường (Cao/Trung bình/Thấp) và lý do",
      "search_keywords": ["từ khóa 1", "từ khóa 2", "từ khóa 3"],
      "similar_products": ["Sản phẩm tương tự 1", "Sản phẩm tương tự 2", "Sản phẩm tương tự 3"]
    }
  ]
}
\`\`\`

Hãy phân tích hình ảnh và trả về kết quả theo đúng cấu trúc JSON trên.`;

    console.log('Making request to OpenRouter with model:', 'openai/gpt-4o-mini-search-preview');
    console.log('Image data length:', imageData ? imageData.length : 0);
    
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'openai/gpt-4o-mini-search-preview',
        messages: [
          {
            role: 'system',
            content: 'Bạn là chuyên gia phân tích sản phẩm. Hãy phân tích hình ảnh và trả về CHỈ JSON hợp lệ, không có text thêm, không có markdown formatting.'
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageData
                }
              }
            ]
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
          'X-Title': 'Product Search',
          'User-Agent': 'AI-Image-Processing-API/1.0',
        },
      }
    );

    console.log('OpenRouter response status:', response.status);
    console.log('OpenRouter response data:', response.data);
    
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
        products: [
          {
            product_name: "Sản phẩm không xác định",
            description: "Không thể phân tích hình ảnh này. Vui lòng thử lại với hình ảnh rõ nét hơn.",
            category: "Không xác định",
            estimated_price: "Không xác định",
            market_potential: "Không thể đánh giá",
            search_keywords: ["sản phẩm", "hàng hóa"],
            similar_products: ["Không có thông tin"]
          }
        ]
      });
    }
  } catch (error: any) {
    console.error('Error in search-product:', error);
    
    // Check if it's an axios error
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
      console.error('Response headers:', error.response.headers);
    } else if (error.request) {
      console.error('Request error:', error.request);
    } else {
      console.error('Error message:', error.message);
    }
    
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message,
      status: error.response?.status,
      responseData: error.response?.data
    });
  }
});

export default router;
