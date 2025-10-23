import express from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import axios from 'axios';
import { v2 as cloudinary } from 'cloudinary';

const router = express.Router();
const prisma = new PrismaClient();

// Single prompt generator for all content types
// function generateContentPrompt1(data: any, bestImageUrl: string | null, product: any, type: string) {
//   return `# Content Creation - ${type.toUpperCase()}

// **Product:** ${data.product_title}
// **Original Description:** ${data.product_description}
// **Keywords:** ${data.keywords.join(', ')}
// **Tone:** ${data.tone}
// **Target Market:** ${data.targetMarket}
// ${data.persona ? `**Persona:** ${data.persona}` : ''}
// ${data.painpoints.length > 0 ? `**Pain Points:** ${data.painpoints.join(', ')}` : ''}
// ${product?.image_url ? `**Product Image:** ${product.image_url}` : ''}
// 
// **IMPORTANT - Product Specifications Handling:**
// - If the product has specifications, technical details, or features mentioned in the description, create a beautiful, detailed specifications section
// - Present specifications in a professional table format with clear categories
// - Make technical information easy to understand and visually appealing
// - Include specifications like: materials, dimensions, sizes, colors, features, compatibility, etc.
// - Use proper HTML table structure with clean styling

// **Content Structure Requirements:**
// ${type === 'pas' ? `
// **PAS Structure:**
// 1. **PROBLEM:** Identify and highlight the customer's pain point
// 2. **AGITATION:** Amplify the problem and its consequences  
// 3. **SOLUTION:** Present your product as the perfect solution` : ''}

// ${type === 'aida' ? `
// **AIDA Structure:**
// 1. **ATTENTION:** Grab attention with compelling headline and visual
// 2. **INTEREST:** Build interest with benefits and features
// 3. **DESIRE:** Create desire with emotional appeal and social proof
// 4. **ACTION:** Drive action with clear call-to-action` : ''}

// ${type === 'professional' ? `
// **Professional E-commerce Structure:**
// 1. **Hero Section:** Compelling headline with product showcase
// 2. **Features & Benefits:** Clear value propositions
// 3. **Social Proof:** Trust indicators and testimonials
// 4. **Call-to-Action:** Multiple strategic CTAs
// 5. **FAQ/Details:** Address common concerns` : ''}

// **HTML Requirements:**
// - Clean, professional design WITHOUT background colors
// - Responsive layout that works on all devices
// - Beautiful typography with proper spacing and hierarchy
// - Professional call-to-action text (NO buttons)
// - Clean color scheme using only text colors (no backgrounds)
// - High-quality product image integration
// - Clear visual hierarchy with sections and columns
// - Professional table layouts when needed

// **Design Elements:**
// - Use clean CSS: border-radius, transitions, proper spacing
// - Professional fonts: 'Inter', 'Poppins', or 'Roboto' with consistent sizing
// - Color palette: Professional text colors only (#333, #555, #666, #1E40AF)
// - Responsive grid layout with proper columns
// - Professional spacing and padding
// - Clean typography hierarchy (h1: 32px, h2: 24px, h3: 20px, p: 16px)
// - NO background colors, gradients, or colored backgrounds
// - NO buttons, links, or clickable elements - use text only

// **Content Requirements:**
// - Write in ${data.languageOutput} language
// - Include keywords naturally
// - Focus on emotional triggers and benefits
// - Create urgency and desire
// - Professional, trustworthy tone
// - Clear value proposition

// Return JSON:
// \`\`\`json
// {
//   "new_title": "Optimized title",
//   "new_description": "Professional HTML with ${type} structure, modern design, and beautiful styling"
// }
// \`\`\``;
// }

function generateContentPrompt(data: any, product: any, type: string) {
  return `# Content Creation - ${type.toUpperCase()}

**Persona for AI:** You are a world-class e-commerce copywriter and conversion strategist. Your goal is to create a product page that is not only beautiful and professional but also highly persuasive and emotionally resonant, driving customers to purchase.

**Product:** ${data.product_title}
**Original Description:** ${data.product_description}
**Keywords:** ${data.keywords.join(', ')}
**Tone:** ${data.tone}
**Target Market:** ${data.targetMarket}
${data.persona ? `**Persona:** ${data.persona}` : ''}
${data.painpoints.length > 0 ? `**Pain Points:** ${data.painpoints.join(', ')}` : ''}
${product?.image_url ? `**Product Image:** ${product.image_url}` : ''}
${data.productImages && data.productImages.length > 0 ? `**All Available Product Images:** ${data.productImages.filter((img: any) => img && img.trim() !== '').join(', ')}` : ''}

**CRITICAL - Multiple Image Usage Requirement:**
- **MANDATORY:** You MUST use at least 2-3 different images from the provided list
- **FORBIDDEN:** Using only 1 image is NOT ALLOWED when multiple images are available
- **REQUIRED IMAGE PLACEMENT:**
  1. First image: Hero section (large, prominent display)
  2. Second image: Features/benefits section (showing different angle/details)
  3. Third image: Specifications section or final CTA area
- **IMAGE SELECTION CRITERIA:** Choose images that show different aspects: close-up details, full product view, different angles, lifestyle shots
- **VISUAL STORY:** Each image should tell a different part of the product story
- **FAILURE TO USE MULTIPLE IMAGES WILL RESULT IN POOR QUALITY SCORE**

**IMPORTANT - Pre-Analysis Step:**
Before writing, first analyze all the provided information to determine the product's single most compelling **Unique Selling Proposition (USP)**. This USP must be the central theme of the entire description.

**IMPORTANT - Smart Specifications Handling:**
- **ONLY** create a specifications section if the product description contains actual technical details, specifications, or features.
- **DO NOT** invent or make up specifications that are not mentioned in the original product description.
- If specifications exist, present this in a professional, two-column HTML table.
- **Column 1:** 'Specification' (e.g., 'Material', 'Dimensions').
- **Column 2:** 'Benefit & Meaning' (e.g., '100% Organic Cotton - Ensuring an ultra-soft, breathable touch that's gentle on sensitive skin').
- This approach makes technical details understandable and valuable.

**Content Structure Requirements:**
${type === 'pas' ? `
**PAS Structure:**
1. **PROBLEM:** Deeply connect with the customer's specific pain point.
2. **AGITATION:** Amplify the problem with emotional storytelling. Show, don't just tell.
3. **SOLUTION:** Introduce the product as the ultimate hero and solution, focusing on its USP.` : ''}

${type === 'aida' ? `
**AIDA Structure:**
1. **ATTENTION:** Grab attention with a powerful, benefit-driven headline.
2. **INTEREST:** Build interest by revealing the story and unique benefits.
3. **DESIRE:** Create desire using sensory words, social proof examples, and painting a picture of the ideal outcome.
4. **ACTION:** Drive action with a clear, urgent call-to-action.` : ''}

${type === 'professional' ? `
**Professional E-commerce Structure:**
1. **Hero Section:** Compelling headline and a short, emotionally-engaging introductory paragraph focusing on the main benefit.
2. **"Why Choose Us?" Section:** Use bullet points or icons to highlight 3-4 key benefits that directly address customer pain points.
3. **In-Depth Exploration:** A detailed paragraph that tells a story or explains how the product works.
4. **Smart Specifications Table:** The detailed, benefit-oriented table described above.
5. **Social Proof/Trust Section:** Include a placeholder for a customer testimonial quote. Mention guarantees (e.g., '30-Day Money-Back Guarantee').
6. **Final Call-to-Action:** A clear, compelling closing statement and CTA.` : ''}

**HTML Requirements:**
- Clean, professional design WITHOUT background colors.
- Responsive layout using divs and CSS for columns.
- Beautiful typography: 'Inter', 'Poppins', or 'Roboto' with clean hierarchy (h2: 24px, h3: 20px, p: 16px).
- Professional text colors only: #333 (headings), #555 (body text), #1E40AF (accents or CTA).
- **MANDATORY Multiple Image Integration:**
  - **CRITICAL:** You MUST include at least 2-3 different images in your HTML
  - **FORBIDDEN:** Using only 1 image when multiple are available
  - **REQUIRED PLACEMENT:**
    1. Hero image: img src="[IMAGE_URL_1]" alt="[DESCRIPTION_1]" style="width: 100%; max-width: 600px; height: auto; border-radius: 8px; margin: 20px 0;"
    2. Features image: img src="[IMAGE_URL_2]" alt="[DESCRIPTION_2]" style="width: 100%; max-width: 500px; height: auto; border-radius: 8px; margin: 15px 0;"
    3. Details image: img src="[IMAGE_URL_3]" alt="[DESCRIPTION_3]" style="width: 100%; max-width: 400px; height: auto; border-radius: 8px; margin: 15px 0;"
  - Each image must have unique alt text describing different aspects
  - Images should be placed in different sections of the content
  - **QUALITY CHECK:** Count your images - you should have 2-3 minimum
- Professional spacing and padding for high readability.
- **Text-Based Call-to-Action:** Create a clear call-to-action text at the end. Style it to stand out using CSS (e.g., a subtle border, padding, centered text) to encourage action without using a <button> or <a> tag.

**Content Requirements:**
- Write in **${data.languageOutput}** language.
- **Benefit-First Approach:** For every feature mentioned, immediately explain the direct benefit to the customer ("which means you can...").
- Weave keywords naturally into headlines and body text.
- Use emotional and sensory words to create a strong desire for the product.
- Maintain a professional, expert, and trustworthy tone.
- Clearly articulate the value proposition and USP throughout the text.

Return JSON in the specified format:
\`\`\`json
{
  "new_title": "Create a SEO-friendly and compelling title using a formula like: [Main Benefit] + [Product Name] | [Brand/Audience]",
  "new_description": "Generate professional HTML based on ALL the rules, structures, and content requirements defined above. The result should be a masterpiece of e-commerce copywriting."
}
\`\`\``;
}



// Configure Cloudinary (from CLOUDINARY_URL env var)
if (process.env.CLOUDINARY_URL) {
  cloudinary.config({ 
    cloudinary_url: process.env.CLOUDINARY_URL 
  });
  console.log('☁️ Cloudinary configured');
}

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
    
    // Process ALL images: Upload each to Cloudinary
    const imageUrls: string[] = [];
    
    if (images && images.length > 0) {
      console.log(`☁️ Uploading ${images.length} images to Cloudinary...`);
      
      for (let i = 0; i < images.length; i++) {
        const imageData = images[i];
        
        if (imageData && imageData.startsWith('data:image')) {
          // Base64 → Upload to Cloudinary
          if (process.env.CLOUDINARY_URL) {
            try {
              const uploadResult = await cloudinary.uploader.upload(imageData, {
                folder: 'products',
                resource_type: 'auto',
                public_id: `product_${Date.now()}_img${i + 1}`,
              });
              imageUrls.push(uploadResult.secure_url);
              console.log(`✅ Image ${i + 1}/${images.length} uploaded:`, uploadResult.secure_url);
            } catch (cloudinaryError: any) {
              console.error(`❌ Cloudinary upload error for image ${i + 1}:`, cloudinaryError.message);
              // Fallback: use base64
              imageUrls.push(imageData);
              console.warn(`⚠️ Using base64 fallback for image ${i + 1}`);
            }
          } else {
            console.warn('⚠️ CLOUDINARY_URL not set, saving base64 to database');
            imageUrls.push(imageData);
          }
        } else if (imageData) {
          // Already a URL
          imageUrls.push(imageData);
        }
      }
    }
    
    // Save as JSON string (schema only supports string, not array)
    const imageUrlsJson = imageUrls.length > 0 ? JSON.stringify(imageUrls) : null;
    
    console.log(`Creating product with ${imageUrls.length} images...`);
    
    const product = await prisma.product.create({
      data: {
        user_id: defaultUser.id,
        name: title,
        description,
        image_url: imageUrlsJson, // Save JSON array of Cloudinary URLs
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
    const { product_title, product_description, product_id, target_market, languageOutput, market_insight_date } = req.body;
    
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

    // Determine language for response
    const responseLanguage = languageOutput || 'vi-VN';
    const insightDate = market_insight_date || new Date().toISOString().split('T')[0];
    
    console.log(`🌍 Market Insights - Language: ${responseLanguage}, Date: ${insightDate}, Market: ${marketName}`);

    const prompt = `# Market Analysis for Product Keywords and Customer Segments

You are a market research expert. Analyze the following product and return suggested data:

**Product:** ${product_title}
**Description:** ${product_description}
**Target Market:** ${marketName}
**Analysis Date:** ${insightDate}
**Response Language:** ${responseLanguage}

## Requirements:
1. **Keywords:** Create 10 keywords for each type (informational, transactional, comparative, painpoint_related) - relevant to ${marketName} market
2. **Target Customers:** Create 3 customer segments with specific painpoints - suitable for culture and user characteristics in ${marketName}
3. **Data must be realistic and actionable**
4. **Consider current market trends and consumer behavior as of ${insightDate}**

## Return JSON with structure:
\`\`\`json
{
  "keywords": {
    "informational": [
      { "keyword": "information keyword 1", "volume": 1000, "cpc": 0.5, "competition": "Low" }
    ],
    "transactional": [
      { "keyword": "purchase keyword 1", "volume": 500, "cpc": 1.2, "competition": "Medium" }
    ],
    "comparative": [
      { "keyword": "comparison keyword 1", "volume": 300, "cpc": 0.8, "competition": "High" }
    ],
    "painpoint_related": [
      { "keyword": "painpoint keyword 1", "volume": 800, "cpc": 0.6, "competition": "Medium" }
    ]
  },
  "target_customers": [
    {
      "name": "Customer Segment 1",
      "description": "Customer segment description",
      "demographics": "Age, gender, income",
      "location": "Geographic area",
      "age_range": "25-35",
      "interests": ["interest 1", "interest 2"],
      "behavior": "Shopping behavior",
      "common_painpoints": ["painpoint 1", "painpoint 2"]
    }
  ]
}
\`\`\`

**Important:** 
- All keywords and customer data should be in ${responseLanguage} language
- Consider current market trends and consumer behavior as of ${insightDate}
- Make data relevant to ${marketName} market culture and preferences

Please analyze and return results in the exact JSON structure above.`;

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'google/gemini-2.5-flash-preview-09-2025',
        messages: [
          {
            role: 'system',
            content: `You are a market research expert. Return ONLY valid JSON, no additional text, no markdown formatting. All content should be in ${responseLanguage} language. Make sure to complete the entire JSON structure.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 4000,
        temperature: 0.7,
      },
      {
        headers: {
          'Authorization': `Bearer ${openRouterApiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'Product Optimize Suggest',
        },
        timeout: 30000
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
        // Try to find the last complete object/array
        let lastCompleteEnd = content.lastIndexOf('}');
        if (lastCompleteEnd > jsonStart) {
          jsonEnd = lastCompleteEnd;
        } else {
          throw new Error('Incomplete JSON found');
        }
      }
      
      const jsonString = content.substring(jsonStart, jsonEnd + 1);
      const result = JSON.parse(jsonString);
      
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

// Debug endpoint to check incoming data
router.post('/debug', async (req, res) => {
  try {
    console.log('🔍 DEBUG - Raw request body:', JSON.stringify(req.body, null, 2));
    console.log('🔍 DEBUG - Headers:', req.headers);
    console.log('🔍 DEBUG - Content-Type:', req.get('Content-Type'));
    
    res.json({
      success: true,
      receivedData: req.body,
      headers: req.headers,
      contentType: req.get('Content-Type')
    });
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({ error: 'Debug failed' });
  }
});

// Optimize content API
router.post('/optimize', async (req, res) => {
  try {
    // Support both old and new format
    const { 
      type, 
      data, 
      product_id,
      // New format fields
      productTitle,
      productDescription,
      productId,
      productImages,
      keywords,
      persona,
      painpoints,
      tone,
      languageOutput,
      targetMarket
    } = req.body;

    console.log('🚀 API Call received:', {
      timestamp: new Date().toISOString(),
      productTitle: productTitle || data?.product_title,
      languageOutput: languageOutput,
      targetMarket: targetMarket,
      productImagesCount: productImages?.length || 0,
      rawBody: JSON.stringify(req.body, null, 2)
    });
    
    const openRouterApiKey = process.env.OPENROUTER_API_KEY;
    if (!openRouterApiKey) {
      return res.status(500).json({ error: 'OpenRouter API key not configured' });
    }

    // Get product information including images
    let product = null;
    const actualProductId = product_id || productId;
    if (actualProductId) {
      product = await prisma.product.findUnique({
        where: { id: actualProductId }
      });
    }

    // Normalize data format - support both old and new format
    const normalizedData = {
      product_title: data?.product_title || productTitle,
      product_description: data?.product_description || productDescription,
      keywords: data?.keywords || keywords || [],
      tone: data?.tone || tone || 'friendly',
      persona: data?.persona || persona,
      painpoints: data?.painpoints || painpoints || [],
      languageOutput: languageOutput || 'vi',
      targetMarket: targetMarket || 'VN',
      productImages: productImages || []
    };

    // Analyze product images and select the best one
    // Pass all images to AI for selection
    const validImages = normalizedData.productImages.filter((img: any) => img && img.trim() !== '');
    console.log(`🖼️ Available images: ${validImages.length} images`);

    let prompt = '';

    switch (type) {
      case 'keyword':
      case 'pas':
      case 'aida':
      case 'professional':
        // Pass languageOutput directly to AI - let AI understand the language
        console.log(`🌍 Language Output: ${normalizedData.languageOutput} (${normalizedData.targetMarket})`);
        
        // Generate prompt based on type
        if (type === 'pas' || type === 'aida' || type === 'professional') {
          prompt = generateContentPrompt(normalizedData, product, type);
        } else {
          // Default keyword optimization
          prompt =  
          `# Content Optimization Based on Keywords

**Product:** ${normalizedData.product_title}
**Original Description:** ${normalizedData.product_description}
**Keywords:** ${normalizedData.keywords.join(', ')}
**Tone:** ${normalizedData.tone}
**Target Market:** ${normalizedData.targetMarket}
${normalizedData.persona ? `**Persona:** ${normalizedData.persona}` : ''}
${normalizedData.painpoints.length > 0 ? `**Pain Points:** ${normalizedData.painpoints.join(', ')}` : ''}
${product?.image_url ? `**Product Image:** ${product.image_url}` : ''}
${normalizedData.productImages.length > 0 ? `**All Available Images:** ${normalizedData.productImages.filter((img: any) => img).join(', ')}` : ''}

**IMPORTANT - Product Image Selection:**
- If multiple product images are provided, analyze and select the BEST images for the description
- Choose images that are: high quality, clear, show product details, professional, and visually appealing
- Use 1-3 best images strategically placed throughout the content
- Prioritize images that best represent the product features and benefits
- DO NOT use all images - be selective and choose only the most impactful ones

**IMPORTANT - Product Specifications Handling:**
- **ONLY** create a specifications section if the product description contains actual technical details, specifications, or features
- **DO NOT** invent or make up specifications that are not mentioned in the original product description
- If specifications exist, present them in a professional table format with clear categories
- Make technical information easy to understand and visually appealing
- Use proper HTML table structure with clean styling

Create an SEO-optimized title and description based on the selected keywords. Content must be natural, engaging and include keywords appropriately.

**Special Requirements:**
- Create clean, professional HTML description WITHOUT background colors
- Use proper HTML structure with <h1>, <h2>, <h3>, <p>, <ul>, <li>, <strong>, <em>, <table>
- If there are product images provided, analyze them and embed the BEST image with proper styling
- DO NOT use placeholder images - only use the actual product images provided
- Create clean layout with proper columns and sections
- Use professional typography hierarchy (h1: 32px, h2: 24px, h3: 20px, p: 16px)
- Use clean CSS: proper spacing, border-radius, transitions
- Professional fonts: 'Inter', 'Poppins', or 'Roboto'
- Color palette: Professional text colors only (#333, #555, #666, #1E40AF)
- NO background colors, gradients, or colored backgrounds
- NO buttons, links, or clickable elements - use text only
- Focus on solving customer pain points if provided
- Target the specified market and persona
- Write the content in ${normalizedData.languageOutput} language

Return JSON:
\`\`\`json
{
  "new_title": "Optimized title",
  "new_description": "Beautiful HTML description with responsive layout and images"
}
\`\`\``;
        }
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

    console.log('🤖 Sending request to OpenRouter AI...');
    
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
    
    console.log('✅ OpenRouter AI response received');

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
      
      console.log('✅ Success:', {
        title: result.new_title,
        has_real_image: result.new_description?.includes('cdn.shopify.com') || result.new_description?.includes('http'),
        language: normalizedData.languageOutput
      });
      
      // Save to cache if product_id is provided
      if (actualProductId) {
        try {
          // First check if the product exists
          const productExists = await prisma.product.findUnique({
            where: { id: actualProductId }
          });

          if (productExists) {
            await prisma.suggestCache.upsert({
              where: { product_id: actualProductId },
              update: {
                suggest_data: JSON.stringify(result),
                updated_at: new Date()
              },
              create: {
                product_id: actualProductId,
                suggest_data: JSON.stringify(result)
              }
            });
          } else {
            console.warn(`Product with id ${actualProductId} not found, skipping cache save`);
          }
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
        new_title: normalizedData.product_title,
        new_description: normalizedData.product_description
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

    // Get product image URLs (support multiple images)
    let productImageUrls: string[] = [];
    
    // Priority: Use product_image from frontend (if provided)
    let imagesToProcess = product_image;
    
    // Parse JSON string from frontend if needed (frontend might send JSON array as string)
    if (imagesToProcess && typeof imagesToProcess === 'string' && imagesToProcess.startsWith('[')) {
      try {
        const parsed = JSON.parse(imagesToProcess);
        if (Array.isArray(parsed) && parsed.length > 0) {
          imagesToProcess = parsed; // Get ALL image URLs
          console.log(`📷 Parsed ${parsed.length} image URLs from frontend JSON string`);
        }
      } catch (parseError) {
        console.warn('⚠️ Failed to parse product_image as JSON array:', parseError);
        imagesToProcess = [imagesToProcess]; // Wrap single URL in array
      }
    } else if (imagesToProcess) {
      imagesToProcess = [imagesToProcess]; // Wrap single URL in array
    }
    
    // Fallback: Get from database if not provided in request
    if ((!imagesToProcess || imagesToProcess.length === 0) && product_id) {
      const product = await prisma.product.findUnique({
        where: { id: product_id },
        select: { image_url: true }
      });
      if (product && product.image_url) {
        // Parse JSON array if needed (image_url might be JSON array of URLs)
        try {
          const parsed = JSON.parse(product.image_url);
          if (Array.isArray(parsed) && parsed.length > 0) {
            imagesToProcess = parsed; // Get ALL image URLs
            console.log(`📷 Parsed ${parsed.length} image URLs from database`);
          } else {
            imagesToProcess = [product.image_url];
          }
        } catch {
          // Not JSON, use as-is
          imagesToProcess = [product.image_url];
        }
      }
    }
    
    // Convert all images to usable URLs
    if (imagesToProcess && Array.isArray(imagesToProcess)) {
      for (let i = 0; i < imagesToProcess.length; i++) {
        const imageToProcess = imagesToProcess[i];
        let finalUrl: string | null = null;
        
        if (imageToProcess.startsWith('data:image')) {
          // Base64 image → Upload to Cloudinary
          if (process.env.CLOUDINARY_URL) {
            try {
              console.log(`☁️ Uploading image ${i + 1}/${imagesToProcess.length} to Cloudinary...`);
              const uploadResult = await cloudinary.uploader.upload(imageToProcess, {
                folder: 'landing_pages',
                resource_type: 'auto',
                public_id: `product_${product_id || Date.now()}_img${i + 1}`,
              });
              finalUrl = uploadResult.secure_url;
              console.log(`✅ Image ${i + 1} uploaded:`, finalUrl);
            } catch (cloudinaryError: any) {
              console.error(`❌ Cloudinary upload error for image ${i + 1}:`, cloudinaryError.message);
              finalUrl = imageToProcess; // Fallback: use base64
            }
          } else {
            finalUrl = imageToProcess; // No Cloudinary config
          }
        } else if (imageToProcess.startsWith('/uploads')) {
          // Path on backend → Build full URL
          const baseUrl = process.env.BACKEND_URL || 'http://localhost:3001';
          finalUrl = `${baseUrl}${imageToProcess}`;
        } else if (imageToProcess.startsWith('http')) {
          // Already a full URL
          finalUrl = imageToProcess;
        }
        
        if (finalUrl) {
          productImageUrls.push(finalUrl);
        }
      }
    }
    
    console.log(`✅ Total ${productImageUrls.length} images ready for landing page`);
    
    // For backward compatibility, keep single URL reference
    const productImageUrl = productImageUrls.length > 0 ? productImageUrls[0] : null;

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

    // Build landing page prompt (optimized for speed & token efficiency)
    const prompt = `# Elite Landing Page Generator

Create a STUNNING, professional HTML landing page (Suxnix style: https://themegenix.net/wp/suxnix/product/sneaky-supplements/)

## Product
**${product_title}**
${product_description}

**Images (${productImageUrls.length}):**
${productImageUrls.map((url, idx) => `${idx + 1}. ${url}`).join('\n')}
${productImageUrls.length > 1 ? `\nIMAGE GALLERY REQUIRED: Main image (id="mainImage" 800px) + thumbnail strip (80px each, onclick="changeImage(url)"). JS: fade effect on click.` : ''}

**Target:** ${target_audience} | **USP:** ${usp}
${pain_points ? `**Pain:** ${pain_points}` : ''}
**Benefits:** ${key_benefits}${pricing ? ` | **Price:** ${pricing}` : ''}

## Structure & Design
**Sections:** Hero → Product Showcase → Feature Highlights (3-4 cards) → Benefits${include_testimonials ? ' → Testimonials' : ''}${include_faq ? ' → FAQ' : ''}${include_pricing ? ' → Pricing' : ''} → Final CTA

**Feature Highlights (MANDATORY - SHOPIFY STYLE):** 
Create section with background #f8f9fa, padding 80px 20px, centered title "Tính Năng Nổi Bật".

Grid layout: display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; max-width: 1200px; margin: 0 auto;

Each card: background: white; padding: 40px 30px; border-radius: 15px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); text-align: center; transition: transform 0.3s ease; hover: transform: scale(1.05);

Card content:
- Icon: 100px×100px circle, background: linear-gradient(135deg, ${colors.primary}, ${colors.secondary}); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; font-size: 40px; (emoji)
- Title: H4, color: ${colors.primary}; font-weight: bold; margin-bottom: 15px; font-size: 1.3rem;
- Description: color: #666; line-height: 1.6; 2-3 sentences explaining benefit

Extract 3-4 key features from product description. Examples: "Chất Lượng Cao Cấp", "Thiết Kế Hiện Đại", "Giao Hàng Nhanh", "Dễ Sử Dụng".

**For this product, create features like:**
- 💎 "Chất Liệu Premium" - "Cotton co giãn, mềm mịn, mặc thoải mái cả ngày"
- 🎨 "Thiết Kế Độc Đáo" - "Chữ trắng nổi bật 'TỰ DO KO TÀI CHÍNH' - tuyên ngôn thời trang"
- 👥 "Unisex Phong Cách" - "Phù hợp cho cả nam và nữ, form oversize trẻ trung"
- 🛍️ "Dễ Phối Đồ" - "Quần jean, jogger, áo khoác oversize đều hợp"

**Product Showcase:** Grid (image 40%, details 60%), 5-star rating, ${pricing || 'price with discount'}, large CTA button, trust badges.

## Colors (Apply Exactly)
Primary: ${colors.primary} | Secondary: ${colors.secondary} | Accent: ${colors.accent} | Text: ${colors.text}
- CTA buttons: linear-gradient(135deg, ${colors.primary}, ${colors.secondary})
- Headings: ${colors.primary} | Hover: ${colors.accent} | Body: ${colors.text}
- Hero bg: linear-gradient(135deg, ${colors.primary}20, ${colors.secondary}20)

## Settings
Goal: ${ctaStrategy} | CTA: "${cta_text}" | Language: ${language}

## Requirements
**Complete HTML** with inline CSS. Google Fonts: Oswald (headings) + Roboto (body). Container max-width: 1200px.

**Hero:** H1 (3-4em) emotional headline, subheadline, product image (float animation), CTA button (60px, gradient, hover).

**Description:** "The True Strength of ${product_title}" + paragraph. "The Basics" + bullet list (✓ checkmarks).

**Benefits:** ${key_benefits.split(',').length} cards, icons/emojis, gradient backgrounds, hover: scale(1.05).

${include_testimonials ? '**Testimonials:** 3 customer reviews with 5-star ratings, profile photos (CSS circle), quotes with borders.\n' : ''}${include_faq ? '**FAQ:** 5-7 Q&As, collapsible (details/summary), styled borders.\n' : ''}${include_pricing ? `**Pricing:** 1-3 tiers, highlight ${pricing || 'best value'}, checkmarks, CTA buttons.\n` : ''}
**Final CTA:** Full-width, gradient bg, urgency text, large CTA button.

**Trust:** Badges (Free Shipping, Guarantee, 24/7 Support, Secure Checkout).

**Mobile:** Media queries ≤768px (stack layout, full-width cards).

**Animations:** @keyframes float, pulse, fadeInUp. Hover transforms. Transitions 0.3s ease.

**Return ONLY complete HTML.** No markdown. Apply colors exactly. Professional Suxnix-style design.`;

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
        timeout: 180000, // 3 minutes timeout for complex HTML generation
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

// Gợi ý: Tách prompt ra một hàm riêng để code sạch hơn
function createSegmentationPrompt(data: any) {
  const { title, description, images, marketName, productType, brandTone, goals, responseLanguage, dateRange, currentDate } = data;

  // Format date information for better context
  const dateContext = dateRange ? 
    `**Thời điểm phân tích:** Từ ${dateRange.startDate} đến ${dateRange.endDate}` :
    `**Thời điểm phân tích:** ${currentDate || new Date().toLocaleDateString('vi-VN')}`;

  // Ví dụ cụ thể trong prompt sẽ giúp AI hiểu rõ hơn là mô tả chung chung
  const examplePersona = {
    name: "Tín đồ thời trang hoài cổ (Vintage Fashion Enthusiast)",
    painpoint: "Cảm thấy thất vọng khi outfit gần như hoàn hảo nhưng lại thiếu một món phụ kiện 'chốt hạ' đủ độc đáo. Sợ bị coi là nhàm chán hoặc không bắt kịp xu hướng. Rất khó tìm được phụ kiện vừa mang đậm cá tính riêng, vừa không bị lỗi thời sau một mùa.",
    winRate: 0.75,
    reason: "Sản phẩm có thiết kế punk và lấy cảm hứng từ một biểu tượng văn hóa đại chúng, đáp ứng trực tiếp nhu cầu thể hiện cá tính và sự khác biệt của nhóm này.",
    personaProfile: {
      demographics: "Nữ, 20-28 tuổi, sinh viên và nhân viên văn phòng trẻ, sống tại các thành phố lớn.",
      behaviors: "Thường xuyên mua sắm online qua các sàn TMĐT và mạng xã hội (Instagram, TikTok). Dành nhiều thời gian lướt Pinterest để tìm cảm hứng thời trang.",
      motivations: "Thể hiện cá tính độc đáo, không muốn 'đụng hàng'. Yêu thích các sản phẩm có câu chuyện, mang tính nghệ thuật.",
      communicationChannels: [
        "TikTok/Instagram Reels: Tạo series video ngắn 'Biến hình outfit từ bình thường thành cực chất' chỉ với một món phụ kiện",
        "User-Generated Content (UGC): Tổ chức cuộc thi 'Show Your Punk Style' khuyến khích khách hàng đăng ảnh phối đồ với sản phẩm và gắn hashtag thương hiệu",
        "Hợp tác với Stylist và Fashion KOC/Influencer để tạo lookbook phối đồ đa phong cách",
        "Chạy quảng cáo hiển thị trên Instagram Story/Feed với targeting theo interest: fashion, vintage, Y2K, indie music"
      ]
    },
    locations: [
      "Thành phố Hồ Chí Minh (Quận 1, 3, Bình Thạnh)",
      "Hà Nội (Hoàn Kiếm, Cầu Giấy, Đống Đa)",
      "Đà Nẵng (trung tâm thành phố)",
      "Các thành phố lớn có trường đại học (Cần Thơ, Huế, Nha Trang)"
    ],
    keywordSuggestions: [
      "phụ kiện olivia rodrigo",
      "nhẫn phong cách punk", 
      "trang sức vintage độc lạ",
      "phối đồ phong cách Y2K",
      "local brand trang sức cá tính",
      "mua nhẫn gothic ở đâu",
      "phụ kiện thời trang indie",
      "trang sức handmade độc đáo"
    ],
    seasonalTrends: "Phù hợp với xu hướng thời trang mùa thu-đông, khi người dùng tìm kiếm các phụ kiện cá tính để mix-match với áo khoác và outfit nhiều lớp.",
    toneType: "Friendly & Edgy",
    voiceGuideline: "Bắt đầu với sự đồng cảm và thấu hiểu: 'Bạn có từng cảm thấy outfit gần như hoàn hảo nhưng lại thiếu một món phụ kiện chốt hạ?' Sau đó chuyển sang giọng điệu tự tin, năng lượng và truyền cảm hứng: 'Đây chính là món đồ giúp bạn thể hiện phong cách riêng biệt, không sợ đụng hàng!'. Sử dụng từ ngữ sáng tạo, có chút bụi bặm nhưng vẫn gần gũi.",
    productBenefits: [
      "Thiết kế punk độc đáo lấy cảm hứng từ biểu tượng văn hóa đại chúng, giúp bạn nổi bật trong đám đông",
      "Chất liệu bền đẹp, không gây kích ứng da, phù hợp đeo cả ngày",
      "Dễ dàng mix-match với nhiều phong cách từ Y2K, vintage đến streetwear hiện đại",
      "Giá cả phải chăng cho một món phụ kiện statement piece đầy cá tính"
    ]
  };

  return `# Yêu cầu: Phân tích và Xây dựng Chân dung Khách hàng Chiến lược

Bạn là một Giám đốc Chiến lược Marketing (Marketing Strategist) chuyên về phân tích dữ liệu thị trường và xây dựng chân dung khách hàng (customer persona). Nhiệm vụ của bạn là phân tích sâu sản phẩm dưới đây và đề xuất 3 phân khúc khách hàng tiềm năng nhất.

**Thông tin sản phẩm:**
- **Tên sản phẩm:** ${title}
- **Mô tả:** ${description}
- **Hình ảnh:** ${images ? images.join(', ') : 'Không có'}
- **Thị trường mục tiêu:** ${marketName}
- **Loại sản phẩm:** ${productType || 'Chưa xác định'}
- **Tông giọng thương hiệu:** ${brandTone || 'Chưa xác định'}
- **Mục tiêu Marketing:** ${goals ? goals.join(', ') : 'Chưa xác định'}
- **Ngôn ngữ phản hồi:** ${responseLanguage}
- ${dateContext}

## 🌍 YÊU CẦU QUAN TRỌNG VỀ THỊ TRƯỜNG:
**Bạn PHẢI customize phân tích dựa trên thị trường ${marketName}:**

### **Nếu thị trường là United States:**
- Demographics: Đa dạng sắc tộc, văn hóa tiêu dùng cá nhân mạnh
- Behaviors: Amazon, Instagram, TikTok là kênh chính; coi trọng reviews
- Communication: Email marketing, influencer marketing, UGC campaigns
- Keywords: PHẢI là tiếng Anh (English keywords)
- Trends: Black Friday, Cyber Monday, Holiday Shopping, Back-to-School
- Price sensitivity: Willing to pay for quality, value premium brands

### **Nếu thị trường là Vietnam:**
- Demographics: Trẻ (18-35), tập trung ở TP.HCM, Hà Nội
- Behaviors: Shopee, Lazada, TikTok Shop; coi trọng giá rẻ, freeship
- Communication: Facebook, TikTok, Zalo; KOL/Influencer quan trọng
- Keywords: PHẢI là tiếng Việt có dấu
- Trends: Tết, Black Friday, 8/3, 20/10, sale cuối tháng
- Price sensitivity: Rất nhạy cảm về giá, ưa khuyến mãi

### **Các thị trường khác:**
- Nghiên cứu văn hóa, hành vi mua sắm đặc trưng của từng nước
- Keywords phải phù hợp với ngôn ngữ địa phương
- Trends và holidays đặc thù của từng quốc gia

## Quy trình phân tích và yêu cầu đầu ra:
1. **Phân tích sâu sản phẩm theo thị trường ${marketName}:** Không chỉ đọc mô tả, hãy phân tích giá trị cốt lõi phù hợp với văn hóa và hành vi tiêu dùng của thị trường ${marketName}.

2. **Xây dựng Persona sống động cho thị trường ${marketName}:** Tạo ra 3 chân dung khách hàng **khác biệt** và **sắc nét**, phản ánh chính xác đặc điểm của người dùng tại ${marketName}.

3. **Pain Point với Cảm xúc Tiêu cực (QUAN TRỌNG):**
   - Pain point PHẢI gợi ra được **nỗi sợ** hoặc **sự thất vọng** cụ thể
   - Không chỉ mô tả hành động ("Tìm kiếm..."), mà phải thể hiện CẢM XÚC
   - Ví dụ TỐT: "Cảm thấy thất vọng khi outfit gần như hoàn hảo nhưng lại thiếu một món phụ kiện 'chốt hạ' đủ độc đáo. Sợ bị coi là nhàm chán hoặc không bắt kịp xu hướng."
   - Ví dụ KHÔNG TỐT: "Tìm kiếm các phụ kiện độc đáo" (quá chung chung, không có cảm xúc)

4. **Đánh giá tiềm năng (Win Rate):** Với mỗi persona, hãy tính toán một "tỷ lệ thắng" (từ 0.0 đến 1.0) dựa trên mức độ phù hợp giữa sản phẩm và nhu cầu của họ.

5. **Lý giải chiến lược:** Đưa ra lý do ngắn gọn, sắc bén giải thích tại sao mỗi nhóm là một lựa chọn tốt.

6. **Kênh Giao Tiếp với Định dạng Nội dung Cụ thể (QUAN TRỌNG):**
   - Không chỉ liệt kê kênh (TikTok, Instagram...), mà phải đề xuất **FORMAT** nội dung cụ thể
   - Bao gồm cả chiến lược User-Generated Content (UGC) nếu phù hợp
   - Ví dụ TỐT:
     * "TikTok/Instagram Reels: Tạo series video ngắn 'Biến hình outfit từ bình thường thành cực chất' chỉ với một món phụ kiện"
     * "User-Generated Content (UGC): Tổ chức cuộc thi 'Show Your Style' khuyến khích khách hàng đăng ảnh phối đồ"
   - Ví dụ KHÔNG TỐT: "Chạy quảng cáo trên TikTok" (quá chung chung)
   - communicationChannels phải là ARRAY các string chi tiết, không phải string đơn

7. **Locations - Địa điểm tập trung khách hàng (QUAN TRỌNG):**
   - Xác định 3-5 địa điểm cụ thể nơi phân khúc khách hàng này tập trung
   - Locations PHẢI phù hợp với thị trường ${marketName}:
     * Nếu **United States**: Tên thành phố/tiểu bang (ví dụ: "New York City", "Los Angeles, CA", "Austin, TX", "Seattle, WA")
     * Nếu **Vietnam**: Tỉnh/thành phố và quận cụ thể (ví dụ: "TP. Hồ Chí Minh (Quận 1, 3)", "Hà Nội (Hoàn Kiếm, Cầu Giấy)")
     * Các nước khác: Thành phố chính và khu vực cụ thể
   - Xem xét đặc điểm của từng location:
     * Mức độ đô thị hóa (urban vs suburban)
     * Thu nhập trung bình của khu vực
     * Văn hóa tiêu dùng đặc trưng
     * Sự hiện diện của các cửa hàng/platform thương mại
   - Ví dụ TỐT:
     * US: ["Manhattan, NYC (high income)", "Brooklyn, NYC (creative class)", "Orange County, CA (suburban affluent)"]
     * VN: ["TP.HCM (Quận 1, 3, Bình Thạnh)", "Hà Nội (Hoàn Kiếm, Cầu Giấy)", "Đà Nẵng (trung tâm)"]

8. **Từ khóa với Long-tail Keywords (QUAN TRỌNG):**
   - Không chỉ từ khóa ngắn, phải có cả từ khóa "đuôi dài" (3-5 từ)
   - Bao gồm các từ khóa cho người đang nghiên cứu, so sánh, tìm kiếm địa điểm
   - Ít nhất 6-8 từ khóa, bao gồm:
     * Từ khóa chính (brand, sản phẩm)
     * Từ khóa phong cách (Y2K, vintage, gothic...)
     * Từ khóa hành động (mua ở đâu, phối đồ như thế nào...)
     * Từ khóa local (local brand, handmade...)
   - Ví dụ TỐT: ["phụ kiện olivia rodrigo", "phối đồ phong cách Y2K", "mua nhẫn gothic ở đâu", "local brand trang sức cá tính"]

9. **Phân tích theo thời gian:** Dựa trên thời điểm phân tích, hãy xem xét:
   - Xu hướng mùa vụ (mùa hè, đông, Tết, Black Friday, Valentine...)
   - Sự kiện đặc biệt và dịp lễ có liên quan
   - Hành vi tiêu dùng theo thời gian trong thị trường ${marketName}
   - Cơ hội marketing theo mùa và timing tối ưu

10. **Product Benefit Highlights - USP Bullets (QUAN TRỌNG - MỚI):**
   - Liệt kê 4-5 lợi ích nổi bật của sản phẩm phù hợp với PERSONA CỤ THỂ này
   - Mỗi benefit phải:
     * Ngắn gọn, súc tích (1 câu)
     * Highlight một giá trị cụ thể (functional hoặc emotional)
     * Dễ dùng để viết feature block hoặc headline ads
     * Phù hợp với pain point và motivation của persona
   - KHÔNG viết benefits chung chung cho tất cả personas
   - Mỗi persona có benefits khác nhau tùy theo nhu cầu của họ
   - Ví dụ cho persona "Beach Traveler":
     * "Nhẹ và bền – thoải mái cả ngày dài dưới nắng biển"
     * "Tone Boho tự do, dễ phối cùng outfit lễ hội"
     * "Chất liệu thân thiện, an toàn khi tiếp xúc nước biển"
     * "Hoàn hảo cho mọi bức ảnh Instagram mùa hè"
   - Ví dụ cho persona "Budget-Conscious":
     * "Set 5 món với giá chỉ bằng 1 món mua lẻ – siêu tiết kiệm"
     * "Đa dạng thiết kế, dễ thay đổi theo tâm trạng mỗi ngày"
     * "Chất lượng tốt, không lo bị xỉn màu hay gỉ sét"
     * "Miễn phí vận chuyển – nhận hàng tại nhà"

11. **Tone Type & Voice Guideline - Loại giọng điệu và hướng dẫn giao tiếp (QUAN TRỌNG - MỚI):**
   
   **A. Tone Type (Loại Giọng Điệu):**
   - Xác định rõ LOẠI TONE phù hợp nhất với persona này
   - Các loại tone phổ biến:
     * **Friendly & Casual**: Thân thiện, gần gũi, dễ tiếp cận (Gen Z, millennials)
     * **Professional & Trustworthy**: Chuyên nghiệp, đáng tin cậy (B2B, công sở)
     * **Luxury & Aspirational**: Sang trọng, khát vọng (high-end products)
     * **Fun & Playful**: Vui tươi, năng động (kids, teens)
     * **Empowering & Inspiring**: Truyền cảm hứng, trao quyền (fitness, wellness)
     * **Edgy & Bold**: Táo bạo, cá tính (streetwear, fashion forward)
     * **Warm & Caring**: Ấm áp, quan tâm (gia đình, mẹ bỉm)
     * **Informative & Educational**: Giáo dục, thông tin (tech, courses)
   - Có thể kết hợp 2 tones (ví dụ: "Friendly & Edgy", "Professional & Warm")
   
   **B. Voice Guideline (Hướng dẫn Giọng văn):**
   - Đây là "công thức sẵn" để content writer viết content ngay lập tức
   - Cấu trúc giọng văn gồm 2 giai đoạn:
     **Giai đoạn 1 - Đồng cảm & Thấu hiểu:**
       * Bắt đầu với câu hỏi hoặc tình huống persona đang đối mặt
       * Thể hiện sự thấu hiểu nỗi đau, lo lắng
       * Ví dụ: "Bạn có từng cảm thấy outfit hoàn hảo nhưng thiếu điểm nhấn?"
     **Giai đoạn 2 - Truyền cảm hứng & Thôi thúc:**
       * Chuyển sang giọng văn năng lượng, tự tin, hành động
       * Thể hiện giải pháp và kết quả mong đợi
       * Ví dụ: "Đây chính là món đồ giúp bạn tự tin thể hiện bản thân!"
   - Độ dài: 2-4 câu, ngắn gọn, súc tích, dễ áp dụng
   - Phải phù hợp với:
     * Thị trường ${marketName} (văn hóa, ngôn ngữ)
     * Tông giọng thương hiệu: ${brandTone || 'friendly'}
     * Đặc điểm của persona (tuổi tác, tính cách, hành vi)
   
   **Ví dụ đầy đủ:**
   - toneType: "Friendly & Edgy"
   - voiceGuideline: "Bạn có từng lo lắng rằng phong cách của mình không đủ nổi bật? Đây chính là món phụ kiện giúp bạn thể hiện cá tính độc đáo, tự tin thu hút mọi ánh nhìn!"

## Định dạng JSON trả về (BẮT BUỘC):
Cấu trúc JSON phải chính xác như ví dụ dưới đây. Chỉ thay đổi nội dung cho phù hợp với sản phẩm.

**⚠️ QUAN TRỌNG: MỖI PERSONA PHẢI CÓ ĐẦY ĐỦ CÁC TRƯỜNG SAU:**
- name
- painpoint
- winRate
- reason
- personaProfile (bao gồm: demographics, behaviors, motivations, communicationChannels)
- **locations** (ARRAY 3-5 địa điểm)
- **keywordSuggestions** (ARRAY 6-8 từ khóa)
- **seasonalTrends** (string mô tả xu hướng theo mùa)
- **productBenefits** (ARRAY 4-5 USP bullets phù hợp với persona này)
- **toneType** (string: loại tone như "Friendly & Casual", "Professional & Trustworthy", v.v.)
- **voiceGuideline** (string: hướng dẫn giọng văn 2-4 câu, có 2 giai đoạn)

{
  "status": "success",
  "segmentations": [
    ${JSON.stringify(examplePersona, null, 2)}
  ]
}

**KHÔNG ĐƯỢC BỎ QUA BẤT KỲ TRƯỜNG NÀO!** Đặc biệt là locations, keywordSuggestions và seasonalTrends.

**Lưu ý quan trọng:**
- **TRÁNH** các nhóm chung chung như "Người trẻ", "Nhân viên văn phòng". Hãy cụ thể và sáng tạo.
- Toàn bộ nội dung phải bằng ngôn ngữ **${responseLanguage}**.
- Kết quả trả về phải chứa **đúng 3 phân khúc khách hàng** trong mảng 'segmentations'.
- Kết quả trả về phải là một công cụ chiến lược mà đội marketing có thể sử dụng ngay lập tức.

**🌍 QUAN TRỌNG NHẤT - THỊ TRƯỜNG ${marketName}:**
- **Demographics** PHẢI phản ánh đặc điểm dân số của ${marketName}
- **Behaviors** PHẢI là hành vi mua sắm thực tế tại ${marketName}
- **Communication Channels** PHẢI là các nền tảng phổ biến ở ${marketName}
- **Keywords** PHẢI:
  * Nếu ${marketName} = "United States" → 100% tiếng Anh
  * Nếu ${marketName} = "Vietnam" → 100% tiếng Việt có dấu
  * Các nước khác → ngôn ngữ địa phương
- **Seasonal Trends** PHẢI là các sự kiện/holidays của ${marketName}
- **Price Sensitivity** PHẢI phù hợp với sức mua tại ${marketName}

❌ SAI: Vietnam market nhưng keywords là "cute keychain aesthetic"
✅ ĐÚNG: Vietnam market → keywords "móc khóa dễ thương aesthetic"

❌ SAI: US market nhưng behaviors là "mua trên Shopee, Lazada"
✅ ĐÚNG: US market → behaviors "shop on Amazon, Etsy, Target"

**YÊU CẦU BẮT BUỘC cho mỗi persona:**
1. ✅ **painpoint**: Phải chứa cảm xúc tiêu cực (thất vọng, sợ hãi, lo lắng) và chi tiết cụ thể
2. ✅ **communicationChannels**: Phải là ARRAY chứa 4-6 chiến lược chi tiết với format nội dung cụ thể (video, UGC, lookbook...)
3. ✅ **locations**: Phải là ARRAY chứa 3-5 địa điểm cụ thể phù hợp với thị trường ${marketName}
4. ✅ **keywordSuggestions**: Phải có ít nhất 6-8 từ khóa, bao gồm cả long-tail keywords (từ khóa đuôi dài)
5. ✅ **seasonalTrends**: Phải mô tả cơ hội và xu hướng theo mùa/thời gian
6. ✅ **productBenefits**: Phải có 4-5 USP bullets cụ thể, phù hợp với pain point của PERSONA NÀY (không chung chung)
7. ✅ **toneType**: Phải xác định rõ loại tone (Friendly, Professional, Luxury, Edgy, Warm, v.v.) - có thể kết hợp 2 types
8. ✅ **voiceGuideline**: Phải có 2 giai đoạn (đồng cảm → truyền cảm hứng), 2-4 câu, phù hợp với thị trường ${marketName}

**CÁCH ĐÁNH GIÁ CHẤT LƯỢNG:**
- Pain point có khiến bạn cảm thấy đồng cảm và hiểu rõ vấn đề không? ✅
- Communication channels có thể implement ngay được không? ✅
- Locations có phản ánh đúng nơi khách hàng tập trung không? ✅
- Keywords có giúp tìm đúng khách hàng đang tìm kiếm không? ✅
- Seasonal trends có cung cấp insight timing marketing không? ✅
- Product Benefits có đánh trúng pain point của persona không? ✅
- Tone Type có phù hợp với persona không? ✅
- Voice Guideline có thể dùng ngay để viết content không? ✅

**VÍ DỤ LOCATIONS PHÙ HỢP:**
- ❌ SAI (US market): ["Vietnam", "Ho Chi Minh City"]
- ✅ ĐÚNG (US market): ["New York City (Manhattan, Brooklyn)", "Los Angeles (West Hollywood, Santa Monica)", "San Francisco (Mission District)"]
- ❌ SAI (VN market): ["Los Angeles", "New York"]
- ✅ ĐÚNG (VN market): ["TP.HCM (Quận 1, 3, Bình Thạnh)", "Hà Nội (Hoàn Kiếm, Cầu Giấy)", "Đà Nẵng"]`;
}

// 🧠 API: POST /api/suggestDataSegmentation
// 🎯 Mục tiêu: Tạo API mới để gọi AI, phân tích thông tin sản phẩm và đề xuất 3 nhóm phân khúc khách hàng (market segmentation) tiềm năng nhất
router.post('/suggestDataSegmentation', async (req, res) => {
  try {
    const { title, description, images, targetMarket, language, productType, brandTone, goals, date, dateRange } = req.body;
    
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
    const marketName = marketNames[targetMarket || 'vi'] || 'Vietnam';

    // Determine language for response
    const responseLanguage = language || 'vi-VN';
    
    // Format current date for analysis context
    const currentDate = date || new Date().toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
    
    console.log(`🧠 Market Segmentation - Language: ${responseLanguage}, Market: ${marketName}, Date: ${currentDate}`);

    const promptData = { 
      title, 
      description, 
      images, 
      marketName, 
      productType, 
      brandTone, 
      goals, 
      responseLanguage,
      currentDate,
      dateRange
    };
    const prompt = createSegmentationPrompt(promptData);

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'google/gemini-2.5-flash-preview-09-2025',
        messages: [
          {
            role: 'system',
            content: `You are a JSON API. Return ONLY the exact JSON structure shown in the example.

CRITICAL JSON RULES:
1. NO markdown code blocks - no \`\`\`json, no \`\`\`
2. NO text before or after the JSON object
3. Use DOUBLE QUOTES (") ONLY - NEVER single quotes (') or curly quotes (' ')
4. NO apostrophes (') for emphasis - use regular text or escape with \\"
5. NO smart/curly quotes (' ' " ") - use straight quotes only (' ")
6. NO trailing commas
7. Complete the ENTIRE JSON structure - ALL 3 personas with ALL fields
8. Content language: ${responseLanguage}
9. ONLY return fields shown in the example - do NOT add extra fields like "productAnalysis"

STRUCTURE MUST BE:
{
  "status": "success",
  "segmentations": [ array of 3 COMPLETE personas ]
}

DO NOT ADD: "productAnalysis", "summary", or any other fields not in example.
MUST COMPLETE: All 3 personas with all required fields (painpoint, personaProfile, keywordSuggestions, seasonalTrends, productBenefits, locations, toneType, voiceGuideline)

CORRECT: "motivations": "Thể hiện cá tính độc đáo"
CORRECT: "Series Phối 5 bộ đồ" (NO quotes for emphasis)
WRONG: "motivations": "Thể hiện cá tính 'độc đáo'" (single quote)
WRONG: "Series 'Phối 5 bộ đồ'" (single quote)
WRONG: 'motivations': 'text' (all single quotes)
WRONG: \`\`\`json { ... } \`\`\` (markdown)`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 8192,
        temperature: 0.5
      },
      {
        headers: {
          'Authorization': `Bearer ${openRouterApiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'Product Segmentation Suggest',
        },
        timeout: 200000 // Increased to 120 seconds for complex prompts
      }
    );

    let content = response.data.choices[0].message.content;
    
    try {
      // Clean markdown FIRST before finding JSON boundaries
      console.log('📦 Raw content length:', content.length);
      
      // Remove markdown code blocks completely
      content = content.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
      
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
        // Try to find the last complete object/array
        let lastCompleteEnd = content.lastIndexOf('}');
        if (lastCompleteEnd > jsonStart) {
          jsonEnd = lastCompleteEnd;
        } else {
          throw new Error('Incomplete JSON found');
        }
      }
      
      let jsonString = content.substring(jsonStart, jsonEnd + 1);
      
      // Clean up JSON string to fix common issues from AI response
      console.log('🔧 Original JSON length:', jsonString.length);
      
      // Log first 500 chars to debug
      console.log('🔍 First 500 chars:', jsonString.substring(0, 500));
      
      // 2. Protect apostrophes in contractions FIRST (don't, it's, what's, etc.)
      jsonString = jsonString.replace(/(\w)'(s|t|re|ve|d|ll|m)\b/gi, '$1APOSTROPHE$2');
      
      // 3. Count single quotes before removal
      const singleQuoteCount = (jsonString.match(/'/g) || []).length;
      console.log('🔢 Single quotes to remove:', singleQuoteCount);
      
      // 4. Remove ALL remaining single quotes (used for emphasis like 'Cute', 'Luxury', 'Phối 5 bộ')
      // Including Vietnamese quotes like 'Phối 5 bộ đồ' or 'Check-in biển'
      // This is the safest approach - just remove them entirely
      jsonString = jsonString.replace(/'/g, '').replace(/'/g, '').replace(/'/g, '');
      
      // 5. Restore protected apostrophes
      jsonString = jsonString.replace(/APOSTROPHE/g, "'");
      
      // 3. Remove trailing commas before closing brackets/braces
      jsonString = jsonString.replace(/,(\s*[}\]])/g, '$1');
      
      // 4. Fix newlines and tabs that might break JSON
      jsonString = jsonString.replace(/\n/g, ' ').replace(/\r/g, '').replace(/\t/g, ' ');
      
      // 5. Replace multiple spaces with single space
      jsonString = jsonString.replace(/\s+/g, ' ');
      
      // 6. Try to fix incomplete JSON by closing brackets
      const openBraces = (jsonString.match(/{/g) || []).length;
      const closeBraces = (jsonString.match(/}/g) || []).length;
      if (openBraces > closeBraces) {
        jsonString += '}'.repeat(openBraces - closeBraces);
        console.log('🔧 Added missing closing braces');
      }
      
      console.log('✅ Cleaned JSON length:', jsonString.length);
      
      const result = JSON.parse(jsonString);
      
      res.json(result);
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      console.error('Content:', content);
      
      // Fallback response chất lượng cao
      res.json({
        status: "success_fallback",
        segmentations: [
          {
            name: "Người tìm kiếm sự thể hiện (The Expression Seeker)",
            painpoint: "Cảm thấy nhàm chán với các sản phẩm đại trà, muốn tìm thứ gì đó độc đáo để thể hiện cá tính.",
            winRate: 0.70,
            reason: "Nhóm này ưu tiên sự độc đáo và câu chuyện đằng sau sản phẩm, phù hợp với các sản phẩm có thiết kế riêng và khác biệt.",
            personaProfile: {
              demographics: "18-28 tuổi, cả nam và nữ, sinh viên, người làm trong ngành sáng tạo.",
              behaviors: "Theo dõi các local brand, influencer cá tính trên Instagram, TikTok. Thích mua sắm tại các cửa hàng concept.",
              motivations: "Thể hiện bản thân, được công nhận về gu thẩm mỹ, là người tạo ra xu hướng.",
              communicationChannels: "Hợp tác KOCs, quảng cáo trên Instagram/TikTok, tham gia các hội chợ, flea market."
            },
            keywordSuggestions: ["phụ kiện độc lạ", "local brand", "quà tặng cá tính"]
          },
          {
            name: "Chiến binh công sở (The Office Warrior)",
            painpoint: "Cần sản phẩm vừa thể hiện cá tính vừa phù hợp với môi trường làm việc chuyên nghiệp.",
            winRate: 0.60,
            reason: "Nhóm này cân bằng giữa sự sáng tạo và tính thực dụng, tìm kiếm sản phẩm có thể sử dụng trong nhiều bối cảnh khác nhau.",
            personaProfile: {
              demographics: "25-35 tuổi, nhân viên văn phòng, freelancer, có thu nhập ổn định.",
              behaviors: "Mua sắm online qua các sàn TMĐT, theo dõi các trang thời trang công sở, tham gia các group Facebook về style.",
              motivations: "Tạo ấn tượng tốt, thể hiện sự chuyên nghiệp nhưng vẫn giữ được cá tính riêng.",
              communicationChannels: "Facebook Ads, email marketing, hợp tác với các blogger thời trang công sở."
            },
            keywordSuggestions: ["phụ kiện công sở", "thời trang chuyên nghiệp", "style cá tính"]
          },
          {
            name: "Tín đồ tối giản (The Minimalist Enthusiast)",
            painpoint: "Muốn sở hữu ít nhưng chất lượng cao, tìm kiếm sản phẩm có thiết kế tinh tế và ý nghĩa sâu sắc.",
            winRate: 0.50,
            reason: "Nhóm này ưu tiên chất lượng hơn số lượng, sẵn sàng đầu tư cho những sản phẩm có giá trị lâu dài.",
            personaProfile: {
              demographics: "28-40 tuổi, có thu nhập cao, sống tại các thành phố lớn, quan tâm đến môi trường.",
              behaviors: "Nghiên cứu kỹ trước khi mua, đọc review chi tiết, ưu tiên các thương hiệu có giá trị cốt lõi rõ ràng.",
              motivations: "Sống có ý nghĩa, giảm thiểu lãng phí, sở hữu những thứ thực sự cần thiết và đẹp đẽ.",
              communicationChannels: "Content marketing, PR, hợp tác với các KOL về lifestyle, sustainability."
            },
            keywordSuggestions: ["sản phẩm bền vững", "thiết kế tối giản", "chất lượng cao"]
          }
        ]
      });
    }
  } catch (error) {
    console.error('Error in suggestDataSegmentation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 🎨 API: POST /api/product-optimize/generate-content-from-segmentation
// 🎯 Mục tiêu: Generate optimized product content (title + HTML description) dựa trên segmentation data
router.post('/generate-content-from-segmentation', async (req, res) => {
  try {
    const openRouterApiKey = process.env.OPENROUTER_API_KEY;
    
    const { 
      title, 
      description, 
      images, 
      segmentation,
      targetMarket = 'vi',
      language = 'vi-VN'
    } = req.body;

    console.log('🎨 Content Generation - Segmentation:', segmentation?.name);

    // Validate required fields
    if (!title || !segmentation) {
      return res.status(400).json({ 
        error: 'Missing required fields: title and segmentation' 
      });
    }

    // Extract segmentation data
    const {
      name: personaName,
      painpoint,
      personaProfile,
      productBenefits,
      toneType,
      voiceGuideline,
      keywordSuggestions,
      seasonalTrends,
      locations
    } = segmentation;

    // Build prompt theo cấu trúc "Bất Bại"
    const contentPrompt = `[ĐÓNG VAI]
Hãy đóng vai một chuyên gia copywriter chuyên viết quảng cáo bán hàng theo phương pháp Direct Response, có khả năng thấu hiểu sâu sắc tâm lý khách hàng và viết nội dung chạm đến cảm xúc, thúc đẩy hành động mua hàng mạnh mẽ.

[BỐI CẢNH]
Tôi đang cần bạn viết nội dung cho một sản phẩm trên Shopify. Dưới đây là toàn bộ thông tin chiến lược:

**Thông tin sản phẩm:**
- **Tên sản phẩm:** ${title}
- **Mô tả hiện tại:** ${description || 'Chưa có mô tả'}
- **Thị trường mục tiêu:** ${targetMarket === 'us' ? 'United States' : 'Vietnam'}
- **Hình ảnh sản phẩm có sẵn:** ${images && images.length > 0 ? images.map((url: string, index: number) => `${index + 1}. ${url}`).join('\n') : 'Không có hình ảnh'}

**Đối tượng khách hàng mục tiêu (Segmentation):**
- **Tên Persona:** ${personaName}
- **Demographics:** ${personaProfile?.demographics || 'N/A'}
- **Behaviors:** ${personaProfile?.behaviors || 'N/A'}
- **Motivations:** ${personaProfile?.motivations || 'N/A'}
- **Locations:** ${locations?.join(', ') || 'N/A'}

**Nỗi đau & Vấn đề của họ (Pain Point):**
${painpoint}

**Lợi ích sản phẩm (Product Benefits) - Sự chuyển đổi mong muốn:**
${productBenefits?.map((benefit: string, index: number) => `${index + 1}. ${benefit}`).join('\n') || 'N/A'}

**Xu hướng theo mùa (Seasonal Trends):**
${seasonalTrends || 'N/A'}

**Từ khóa SEO cần tích hợp:**
${keywordSuggestions?.slice(0, 5).join(', ') || 'N/A'}

[NHIỆM VỤ]
Dựa vào tất cả thông tin trên, hãy viết:
1. **Title mới** (50-80 ký tự): Hấp dẫn, có từ khóa SEO, đánh thẳng vào kết quả mong muốn
2. **Description đầy đủ** (format HTML): Một bài mô tả sản phẩm hoàn chỉnh để đăng lên trang Shopify

**QUAN TRỌNG VỀ HÌNH ẢNH:**
- Tôi đã gửi kèm ${images.length} hình ảnh sản phẩm trong message này. Hãy XEM và PHÂN TÍCH TẤT CẢ hình ảnh
- TỰ CHỌN 2-3 hình ảnh phù hợp nhất từ ${images.length} hình ảnh có sẵn, dựa trên nội dung và persona "${personaName}"
- CHÈN trực tiếp URL hình ảnh đã chọn vào HTML description bằng thẻ <img>
- Chọn hình ảnh phù hợp với từng section:
  * Hero section: Hình ảnh đẹp nhất, thu hút nhất từ ${images.length} hình có sẵn
  * Benefits section: Hình ảnh minh họa tính năng/lợi ích tốt nhất
  * Lifestyle section: Hình ảnh sản phẩm trong context sử dụng phù hợp nhất
- Đảm bảo hình ảnh tăng tính thuyết phục và phù hợp với persona
- KHÔNG được chọn hình ảnh giống nhau cho các personas khác nhau

Nội dung cần phải kể một câu chuyện, khơi gợi cảm xúc và thuyết phục khách hàng rằng đây chính là giải pháp họ đang tìm kiếm.

[YÊU CẦU & RÀNG BUỘC]
- **Loại giọng văn (Tone Type):** ${toneType}
- **Hướng dẫn giọng văn (Voice Guideline):** ${voiceGuideline}
- **Văn phong:** Sử dụng câu ngắn, gạch đầu dòng, emoji ✨🔥✅💎🌟 để dễ đọc
- **Tránh dùng từ ngữ kỹ thuật phức tạp** - Tập trung vào LỢI ÍCH thay vì TÍNH NĂNG
- **Không được:** Viết chung chung, sáo rỗng. Phải cá nhân hóa cho đúng persona "${personaName}"
- **Ngôn ngữ:** ${language === 'vi-VN' ? 'Tiếng Việt' : 'English'}

[ĐỊNH DẠNG ĐẦU RA]
Trả về JSON với cấu trúc SAU (KHÔNG thêm markdown, KHÔNG thêm text ngoài JSON):

{
  "title": "Tiêu đề mới cực kỳ hấp dẫn (50-80 ký tự)",
  "description": "<div class='product-description'>
    <div class='hero-section'>
      <h2>🌟 Tiêu đề chính đánh vào kết quả</h2>
      <p class='hook'>Câu chuyện hoặc câu hỏi chạm vào nỗi đau</p>
      <img src='URL_HÌNH_ẢNH_HERO' alt='Product hero image' style='max-width: 100%; height: auto; border-radius: 8px; margin: 10px 0;' />
    </div>
    
    <div class='benefits-section'>
      <h3>✨ Tại Sao Bạn Sẽ Yêu Thích Sản Phẩm Này?</h3>
      <ul class='benefits-list'>
        <li>🔥 <strong>Lợi ích 1:</strong> Mô tả chi tiết</li>
        <li>✅ <strong>Lợi ích 2:</strong> Mô tả chi tiết</li>
        <li>💎 <strong>Lợi ích 3:</strong> Mô tả chi tiết</li>
      </ul>
      <img src='URL_HÌNH_ẢNH_BENEFITS' alt='Product benefits' style='max-width: 100%; height: auto; border-radius: 8px; margin: 10px 0;' />
    </div>
    
    <div class='transformation-section'>
      <h3>🚀 Kết Quả Bạn Sẽ Đạt Được</h3>
      <p>Mô tả sự chuyển đổi (transformation)</p>
      <img src='URL_HÌNH_ẢNH_LIFESTYLE' alt='Product in use' style='max-width: 100%; height: auto; border-radius: 8px; margin: 10px 0;' />
    </div>
    
    <div class='cta-section'>
      <p class='cta'><strong>🎁 [Lời kêu gọi hành động mạnh mẽ]</strong></p>
    </div>
  </div>"
}

**LƯU Ý QUAN TRỌNG:**
- Description PHẢI là HTML format với các class như trên
- PHẢI có emoji để thu hút
- PHẢI tập trung vào EMOTION và TRANSFORMATION
- KHÔNG viết chung chung - cá nhân hóa cho persona "${personaName}"
- PHẢI XEM và PHÂN TÍCH TẤT CẢ ${images.length} hình ảnh đã gửi kèm
- PHẢI chọn 2-3 hình ảnh phù hợp từ ${images.length} hình có sẵn, dựa trên persona và nội dung
- Thay thế URL_HÌNH_ẢNH_HERO, URL_HÌNH_ẢNH_BENEFITS, URL_HÌNH_ẢNH_LIFESTYLE bằng URL thật từ hình ảnh đã chọn
- Mỗi persona khác nhau PHẢI chọn hình ảnh khác nhau phù hợp với persona đó
- KHÔNG được chọn cùng 1 hình ảnh cho tất cả personas
- AI có ${images.length} hình ảnh để lựa chọn - hãy chọn những hình phù hợp nhất!`;

    // Prepare messages with images (if available)
    const messageContent: any[] = [
      {
        type: 'text',
        text: contentPrompt
      }
    ];

    // Add ALL images to context - let AI choose the best ones
    if (images && images.length > 0) {
      console.log('🖼️ Sending ALL images to AI for analysis:', images.length);
      images.forEach((imageUrl: string, index: number) => {
        console.log(`📸 Image ${index + 1}:`, imageUrl);
        messageContent.push({
          type: 'image_url',
          image_url: {
            url: imageUrl
          }
        });
      });
    } else {
      console.log('⚠️ No images provided for AI analysis');
    }

    // Call Grok-4-fast API
    console.log('🤖 Calling Grok-4-fast for content generation...');
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: "google/gemini-2.5-flash-preview-09-2025",//'x-ai/grok-4-fast',
        messages: [
          {
            role: 'user',
            content: messageContent
          }
        ],
        max_tokens: 4096,
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${openRouterApiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'Product Content Generator',
        },
        timeout: 60000 // 60 seconds
      }
    );

    let content = response.data.choices[0].message.content;
    console.log('📝 Raw AI response length:', content.length);
    console.log('🖼️ Response contains images:', content.includes('<img'));
    console.log('📊 Number of <img> tags:', (content.match(/<img/g) || []).length);

    // Parse JSON response
    try {
      // Clean up markdown if present
      content = content.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
      
      // Find JSON boundaries
      let jsonStart = content.indexOf('{');
      let jsonEnd = content.lastIndexOf('}');
      
      if (jsonStart === -1 || jsonEnd === -1) {
        throw new Error('No valid JSON found in response');
      }
      
      let jsonString = content.substring(jsonStart, jsonEnd + 1);
      
      // Parse the JSON
      const result = JSON.parse(jsonString);
      
      console.log('✅ Content generated successfully');
      console.log('📌 New title:', result.title);
      
      res.json({
        success: true,
        data: {
          title: result.title,
          description: result.description
        }
      });
      
    } catch (parseError: any) {
      console.error('❌ JSON parse error:', parseError.message);
      console.log('Raw content:', content);
      
      // Return fallback response
      res.json({
        success: true,
        data: {
          title: title, // Keep original title
          description: `<div class="product-description">
            <div class="hero-section">
              <h2>✨ ${title}</h2>
              <p>${description || ''}</p>
            </div>
            <div class="benefits-section">
              <h3>🌟 Lợi Ích Nổi Bật:</h3>
              <ul class="benefits-list">
                ${productBenefits?.map((benefit: string) => `<li>✅ ${benefit}</li>`).join('\n                ') || ''}
              </ul>
            </div>
          </div>`
        }
      });
    }

  } catch (error: any) {
    console.error('Error in generate-content-from-segmentation:', error.message);
    res.status(500).json({ 
      error: 'Failed to generate content',
      message: error.message 
    });
  }
});

export default router;
