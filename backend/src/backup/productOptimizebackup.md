import express from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import axios from 'axios';
import { v2 as cloudinary } from 'cloudinary';
import { AI_MODELS_CONFIG, getModelConfig } from '../config/aiModels';

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

    // Get model config for suggest-data API
    const modelConfig = AI_MODELS_CONFIG.suggestData;
    
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: modelConfig.model,
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
        max_tokens: modelConfig.maxTokens,
        temperature: modelConfig.temperature,
      },
      {
        headers: {
          'Authorization': `Bearer ${openRouterApiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'Product Optimize Suggest',
        },
        timeout: modelConfig.timeout
      }
    );

    // Validate API response structure
    if (!response.data || !response.data.choices || response.data.choices.length === 0) {
      console.error('Invalid API response structure:', JSON.stringify(response.data, null, 2));
      throw new Error('Invalid API response: missing choices array');
    }

    if (!response.data.choices[0].message || !response.data.choices[0].message.content) {
      console.error('Invalid message structure:', JSON.stringify(response.data.choices[0], null, 2));
      throw new Error('Invalid API response: missing message content');
    }

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
    
    // Get model config for optimize API
    const modelConfig = AI_MODELS_CONFIG.optimize;
    
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: modelConfig.model,
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
        temperature: modelConfig.temperature,
        max_tokens: modelConfig.maxTokens,
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

    // Validate API response structure
    if (!response.data || !response.data.choices || response.data.choices.length === 0) {
      console.error('Invalid API response structure:', JSON.stringify(response.data, null, 2));
      throw new Error('Invalid API response: missing choices array');
    }

    if (!response.data.choices[0].message || !response.data.choices[0].message.content) {
      console.error('Invalid message structure:', JSON.stringify(response.data.choices[0], null, 2));
      throw new Error('Invalid API response: missing message content');
    }

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

    // Get model config for generate-ads API
    const modelConfig = AI_MODELS_CONFIG.generateAds;
    const selectedModel = model || modelConfig.model; // Allow override from request

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Product Optimize Ads Generator',
      },
      body: JSON.stringify({
        model: selectedModel,
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
        temperature: modelConfig.temperature,
        max_tokens: modelConfig.maxTokens,
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

    // Get model config for optimize-advanced API
    const modelConfig = AI_MODELS_CONFIG.optimizeAdvanced;

    // Call OpenRouter API
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: modelConfig.model,
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
        temperature: modelConfig.temperature,
        max_tokens: modelConfig.maxTokens,
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

    // Validate API response structure
    if (!response.data || !response.data.choices || response.data.choices.length === 0) {
      console.error('Invalid API response structure:', JSON.stringify(response.data, null, 2));
      throw new Error('Invalid API response: missing choices array');
    }

    if (!response.data.choices[0].message || !response.data.choices[0].message.content) {
      console.error('Invalid message structure:', JSON.stringify(response.data.choices[0], null, 2));
      throw new Error('Invalid API response: missing message content');
    }

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

    // Get model config for generate-landing-page API
    const modelConfig = AI_MODELS_CONFIG.generateLandingPage;
    // Use selected model from request or default from config
    const selectedModel = ai_model || modelConfig.model;
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
        temperature: modelConfig.temperature,
        max_tokens: modelConfig.maxTokens,
      },
      {
        headers: {
          'Authorization': `Bearer ${openRouterApiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'Landing Page Generator',
        },
        timeout: modelConfig.timeout
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

    if (!response.data.choices[0].message || !response.data.choices[0].message.content) {
      console.error('❌ Invalid message structure:', response.data.choices[0]);
      return res.status(500).json({ 
        error: 'Invalid response from AI service',
        details: 'The AI model did not return valid message content.',
        debug: response.data.choices[0]
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
    painpoints: {
      primary: "Cảm thấy thất vọng khi outfit gần như hoàn hảo nhưng lại thiếu một món phụ kiện 'chốt hạ' đủ độc đáo. Sợ bị coi là nhàm chán hoặc không bắt kịp xu hướng.",
      secondary: [
        "Những phụ kiện độc lạ thường có giá rất cao, không phù hợp với túi tiền sinh viên/nhân viên văn phòng trẻ.",
        "Chất lượng sản phẩm mua online không ổn định, dễ bị gỉ sét hoặc phai màu sau vài lần đeo.",
        "Khó tìm được món đồ vừa thể hiện cá tính riêng, vừa có thể phối với nhiều phong cách và dùng trong nhiều dịp khác nhau."
      ]
    },
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

3. **Pain Points - Phân tầng Nỗi đau (QUAN TRỌNG):**
   Với mỗi persona, hãy xác định rõ **2 tầng nỗi đau**:
   
   **A. Primary Pain Point (Nỗi đau chính - Emotional Core):**
   - Đây là CẢM XÚC TIÊU CỰC cốt lõi, sâu sắc nhất
   - PHẢI gợi ra được **nỗi sợ**, **sự thất vọng**, **lo lắng** hoặc **xấu hổ** cụ thể
   - Không chỉ mô tả hành động ("Tìm kiếm..."), mà phải thể hiện CẢM XÚC
   - Đây là lý do sâu xa nhất khiến họ tìm kiếm sản phẩm - động lực mua hàng chính
   - Ví dụ TỐT: "Cảm thấy thất vọng khi outfit gần như hoàn hảo nhưng lại thiếu một món phụ kiện 'chốt hạ' đủ độc đáo. Sợ bị coi là nhàm chán hoặc không bắt kịp xu hướng."
   - Ví dụ KHÔNG TỐT: "Tìm kiếm các phụ kiện độc đáo" (quá chung chung, không có cảm xúc)
   
   **B. Secondary Pain Points (Nỗi đau thứ cấp - Functional/Practical Issues):**
   - Liệt kê **2-4 vấn đề THỰC TẾ** hoặc **BẤT TIỆN** hàng ngày mà persona gặp phải
   - Các vấn đề này mang tính chức năng, thực tiễn, cụ thể:
     * Vấn đề về giá cả (quá đắt, không rõ giá trị)
     * Vấn đề về chất lượng (dễ hỏng, không bền, không như mô tả)
     * Vấn đề về tính năng (khó sử dụng, không linh hoạt, hạn chế)
     * Vấn đề về trải nghiệm mua sắm (khó tìm, giao hàng lâu, không có chính sách đổi trả)
     * Vấn đề về tính phù hợp (khó phối đồ, không đa dụng, chỉ dùng được trong một số trường hợp)
   - Mỗi secondary pain point phải là một câu ngắn gọn, súc tích
   - Ví dụ TỐT:
     * "Những phụ kiện độc lạ thường có giá rất cao, không phù hợp với túi tiền sinh viên."
     * "Chất lượng sản phẩm mua online không ổn định, dễ bị gỉ sét sau vài lần đeo."
     * "Khó tìm được món đồ vừa thể hiện cá tính, vừa có thể phối với nhiều phong cách."
   
   **Định dạng trong JSON - OBJECT với 2 keys:**
   - primary: string chứa nỗi đau cảm xúc cốt lõi
   - secondary: array chứa 2-4 vấn đề thực tế
   
   **Tại sao phân tầng này quan trọng?**
   - Primary pain point → Dùng cho tiêu đề quảng cáo, hook đầu video, emotional storytelling
   - Secondary pain points → Dùng cho mô tả chi tiết, FAQ, feature highlights, comparison content
   - Tạo ra nhiều ý tưởng content hơn (mỗi secondary pain = 1 chủ đề cho post/video/story)
   - Thể hiện sự thấu hiểu toàn diện từ cảm xúc đến thực tế

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
- **painpoints** (OBJECT chứa 'primary' và 'secondary')
  * **primary**: string - nỗi đau cảm xúc cốt lõi
  * **secondary**: array of strings - 2-4 vấn đề thực tế
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
1. ✅ **painpoints**: Phải là OBJECT với 2 keys
   - **primary** (string): Cảm xúc tiêu cực cốt lõi (thất vọng, sợ hãi, lo lắng, xấu hổ) với chi tiết cụ thể
   - **secondary** (array): 2-4 vấn đề thực tế, chức năng (giá cả, chất lượng, tính năng, trải nghiệm, phù hợp)
2. ✅ **communicationChannels**: Phải là ARRAY chứa 4-6 chiến lược chi tiết với format nội dung cụ thể (video, UGC, lookbook...)
3. ✅ **locations**: Phải là ARRAY chứa 3-5 địa điểm cụ thể phù hợp với thị trường ${marketName}
4. ✅ **keywordSuggestions**: Phải có ít nhất 6-8 từ khóa, bao gồm cả long-tail keywords (từ khóa đuôi dài)
5. ✅ **seasonalTrends**: Phải mô tả cơ hội và xu hướng theo mùa/thời gian
6. ✅ **productBenefits**: Phải có 4-5 USP bullets cụ thể, phù hợp với pain point của PERSONA NÀY (không chung chung)
7. ✅ **toneType**: Phải xác định rõ loại tone (Friendly, Professional, Luxury, Edgy, Warm, v.v.) - có thể kết hợp 2 types
8. ✅ **voiceGuideline**: Phải có 2 giai đoạn (đồng cảm → truyền cảm hứng), 2-4 câu, phù hợp với thị trường ${marketName}

**CÁCH ĐÁNH GIÁ CHẤT LƯỢNG:**
- Primary pain point có khiến bạn cảm thấy đồng cảm và hiểu rõ cảm xúc không? ✅
- Secondary pain points có giải quyết các vấn đề thực tế cụ thể không? ✅
- Product Benefits có đánh trúng cả primary và secondary pain points không? ✅
- Communication channels có thể implement ngay được không? ✅
- Locations có phản ánh đúng nơi khách hàng tập trung không? ✅
- Keywords có giúp tìm đúng khách hàng đang tìm kiếm không? ✅
- Seasonal trends có cung cấp insight timing marketing không? ✅
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

    // Get model config for suggest-data-segmentation API
    const modelConfig = AI_MODELS_CONFIG.suggestDataSegmentation;

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: modelConfig.model,
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
        max_tokens: modelConfig.maxTokens,
        temperature: modelConfig.temperature
      },
      {
        headers: {
          'Authorization': `Bearer ${openRouterApiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'Product Segmentation Suggest',
        },
        timeout: modelConfig.timeout
      }
    );

    // Validate API response structure
    if (!response.data || !response.data.choices || response.data.choices.length === 0) {
      console.error('Invalid API response structure:', JSON.stringify(response.data, null, 2));
      throw new Error('Invalid API response: missing choices array');
    }

    if (!response.data.choices[0].message || !response.data.choices[0].message.content) {
      console.error('Invalid message structure:', JSON.stringify(response.data.choices[0], null, 2));
      throw new Error('Invalid API response: missing message content');
    }

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
      productImages, // Frontend sends this
      segmentation,
      targetMarket = 'vi',
      language = 'vi-VN'
    } = req.body;

    // Use productImages if images is not provided (support both formats)
    const imageUrls = images || productImages || [];

    console.log('🎨 Content Generation - Segmentation:', segmentation?.name);
    console.log('🖼️ Images received:', imageUrls.length, 'images');

    // Validate required fields
    if (!title || !segmentation) {
      return res.status(400).json({ 
        error: 'Missing required fields: title and segmentation' 
      });
    }

    // Simple: Just pass language and targetMarket to AI - let AI handle it
    console.log('🌍 Content Generation - Market:', targetMarket, 'Language:', language);

    // Extract segmentation data
    const {
      name: personaName,
      painpoints,
      painpoint, // Old format for backward compatibility
      personaProfile,
      productBenefits,
      toneType,
      voiceGuideline,
      keywordSuggestions,
      seasonalTrends,
      locations
    } = segmentation;

    // Handle both old and new painpoints structure
    let primaryPainPoint = '';
    let secondaryPainPoints: string[] = [];
    
    if (painpoints && typeof painpoints === 'object') {
      // New structure
      primaryPainPoint = painpoints.primary || '';
      secondaryPainPoints = painpoints.secondary || [];
    } else if (painpoint && typeof painpoint === 'string') {
      // Old structure - use as primary
      primaryPainPoint = painpoint;
    }

    // Format pain points for prompt
    const painPointText = secondaryPainPoints.length > 0
      ? `**Primary Pain Point:**
${primaryPainPoint}

**Secondary Pain Points:**
${secondaryPainPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}`
      : `**Pain Points & Issues:**
${primaryPainPoint}`;

    // Build prompt - simple: just pass language and targetMarket to AI
    const contentPrompt = `[ROLE]
You are a world-class e-commerce copywriter specializing in Direct Response marketing. Your ability to deeply understand customer psychology and create emotionally compelling content that drives purchase action is unmatched.

[CONTEXT]
I need you to write product content for a Shopify store. Below is all the strategic information:

**Product Information:**
- **Product Title:** ${title}
- **Current Description:** ${description || 'No description provided'}
- **Target Market:** ${targetMarket}
- **Output Language:** ${language} - **CRITICAL: ALL content (title, description, headings, text) MUST be written in ${language}**
- **Available Product Images:** ${imageUrls && imageUrls.length > 0 ? imageUrls.map((url: string, index: number) => `${index + 1}. ${url}`).join('\n') : 'No images provided'}

**Target Customer Segment (Segmentation):**
- **Persona Name:** ${personaName}
- **Demographics:** ${personaProfile?.demographics || 'N/A'}
- **Behaviors:** ${personaProfile?.behaviors || 'N/A'}
- **Motivations:** ${personaProfile?.motivations || 'N/A'}
- **Locations:** ${locations?.join(', ') || 'N/A'}

**Their Pain Points & Issues:**
${painPointText}

**Product Benefits - Desired Transformation:**
${productBenefits?.map((benefit: string, index: number) => `${index + 1}. ${benefit}`).join('\n') || 'N/A'}

**Seasonal Trends:**
${seasonalTrends || 'N/A'}

**SEO Keywords to Integrate:**
${keywordSuggestions?.slice(0, 5).join(', ') || 'N/A'}

[TASK]
Based on all the information above, write:
1. **New Title** (50-80 characters): Compelling, SEO-optimized, hitting the desired outcome directly - MUST be in ${language}
2. **Complete Description** (HTML format): A complete product description ready to publish on Shopify - MUST be in ${language}

**Description Must Include:**
- **"Key Features" Table** (or "Technical Specifications" if it's a tech product)
  * Your task is to carefully read the current description and analyze images to fill this table with accurate information
  * For fashion/home/accessories products, use "Key Features" format
  * For technology products, use "Technical Specifications" format
  * All information in the table must be FACTUAL, extracted from description or inferred from images
  * **All table headers and values MUST be in ${language}**

- **FAQ Section (2-3 questions)** right before CTA section
  * Transform Pain Points and Persona's hidden concerns into questions
  * Use product information and benefits to write concise, persuasive answers
  * Questions must be natural, as real users would ask
  * Answers must be based on real data (from productBenefits, description, images)
  * **All FAQ questions and answers MUST be in ${language}**

**CRITICAL ABOUT IMAGES:**
- I have sent ${imageUrls.length} product images with this message. You MUST LOOK AT AND ANALYZE EACH IMAGE THOROUGHLY to extract REAL information about the product.

- **Extract the following information from images:**
  1. **Material & Surface:** Smooth fabric, ribbed fabric, glossy surface, matte, leather material, wood, metal, plastic, stainless steel...?
  2. **Design Details:** Round or V-neck collar, pockets or not, zipper, buttons, laser-engraved details, patterns, logos, prints...?
  3. **Colors:** Accurately describe colors visible in images (e.g., navy blue, pastel pink, gold...)
  4. **Size/Shape:** Large, small, long, short, round, square, oval... (if visible in images)
  5. **Usage Context (if any):** Where is the product photographed? Indoors, outdoors, office, beach, bedroom...?

- **Use the real information you extracted** to make benefit descriptions and transformations more specific and trustworthy. DO NOT fabricate details not visible in images.

- **Example:** Instead of writing "premium material", write "brushed cotton material that's soft to the touch, clearly visible in the image" or "316 stainless steel surface with mirror finish as shown in the photo".

- SELF-SELECT 2-3 most suitable images from ${imageUrls.length} available images, based on content, persona "${personaName}" and pain points
- INSERT selected image URLs directly into HTML description using <img> tags
- Choose images suitable for each section:
  * Hero section: Most beautiful, attractive image from ${imageUrls.length} available images
  * Benefits section: Best image illustrating features/benefits
  * Lifestyle section: Best image showing product in suitable usage context
- Ensure images enhance persuasiveness and match persona
- DO NOT choose same images for different personas

Content must tell a story, evoke emotion, and convince customers this is exactly the solution they're looking for.

[REQUIREMENTS & CONSTRAINTS]
- **Tone Type:** ${toneType}
- **Voice Guideline:** ${voiceGuideline}
- **Writing Style:** Use short sentences, bullet points for easy reading
- **Icons:** DO NOT use emojis - Use clean SVG icons (no inline style)
- **CLEAN HTML:** DO NOT use style="..." except for <img> tags
- **Font:** Theme will auto-style - Only use semantic tags (<h2>, <h3>, <h4>, <strong>)
- **Avoid complex technical terms** - Focus on BENEFITS instead of FEATURES
- **DO NOT:** Write generic, cliché content. Must personalize for persona "${personaName}"
- **CRITICAL:** ALL content (title, description, headings, text, FAQ questions and answers, table headers and values) MUST be written in ${language}. Do NOT mix languages.

[OUTPUT FORMAT]
Return JSON with the following structure (NO markdown, NO additional text outside JSON):

{
  "title": "New highly compelling title (50-80 characters) - MUST be in ${language}",
  "description": "<article class='product-description'>
    
    <!-- 1. Hero Section: Compelling headline + hook -->
    <header class='product-hero'>
      <h1>Tiêu đề chính đánh vào kết quả - compelling & benefit-driven</h1>
      <p class='lead'>Câu hook chạm vào pain point, tạo kết nối cảm xúc ngay lập tức</p>
      <figure>
        <img src='URL_HÌNH_ẢNH_HERO' alt='Product hero image' style='max-width: 100%; height: auto;' />
      </figure>
    </header>
    
    <!-- 2. Key Benefits: Visual + Concise -->
    <section class='benefits'>
      <h2>Tại Sao Bạn Sẽ Yêu Thích Sản Phẩm Này</h2>
      <dl class='benefits-grid'>
        <div class='benefit-card'>
          <dt>
            <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.5' opacity='0.6' aria-hidden='true'>
              <path d='M20 6L9 17l-5-5'/>
            </svg>
            <strong>Benefit Title 1</strong>
          </dt>
          <dd>Chi tiết lợi ích cụ thể, không phải tính năng. Focus vào outcome/result.</dd>
    </div>
    
        <div class='benefit-card'>
          <dt>
            <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.5' opacity='0.6' aria-hidden='true'>
              <path d='M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2z'/>
            </svg>
            <strong>Benefit Title 2</strong>
          </dt>
          <dd>Chi tiết lợi ích thứ hai, nhấn mạnh transformation.</dd>
    </div>
    
        <div class='benefit-card'>
          <dt>
            <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.5' opacity='0.6' aria-hidden='true'>
              <path d='M12 2v20M2 12h20'/>
            </svg>
            <strong>Benefit Title 3</strong>
          </dt>
          <dd>Chi tiết lợi ích thứ ba, emotional connection.</dd>
    </div>
      </dl>
      <figure>
        <img src='URL_HÌNH_ẢNH_BENEFITS' alt='Product benefits showcase' style='max-width: 100%; height: auto;' />
      </figure>
    </section>
    
    <!-- 3. Product Details: Clean Table -->
    <section class='specifications'>
      <h2>Thông Tin Sản Phẩm</h2>
      <table>
        <tbody>
          <tr>
            <th>Chất liệu</th>
            <td>Trích xuất từ mô tả/hình ảnh - cụ thể, chi tiết</td>
          </tr>
          <tr>
            <th>Thiết kế</th>
            <td>Mô tả thiết kế cụ thể nhìn thấy từ ảnh</td>
          </tr>
          <tr>
            <th>Màu sắc</th>
            <td>Tên màu cụ thể từ hình ảnh</td>
          </tr>
          <tr>
            <th>Phù hợp với</th>
            <td>Use cases cụ thể dựa trên persona</td>
          </tr>
          <tr>
            <th>Bảo quản</th>
            <td>Hướng dẫn care instructions</td>
          </tr>
        </tbody>
      </table>
    </section>
    
    <!-- 4. Social Proof / Use Case -->
    <section class='use-case'>
      <h2>Ai Nên Sở Hữu Sản Phẩm Này</h2>
      <p>Mô tả chi tiết về ideal customer, use cases, và transformation. Nhấn mạnh versatility và value.</p>
      <figure>
        <img src='URL_HÌNH_ẢNH_LIFESTYLE' alt='Product in use' style='max-width: 100%; height: auto;' />
        <figcaption>Lifestyle context caption (optional)</figcaption>
      </figure>
    </section>
    
    <!-- 5. FAQ: Professional Q&A Format -->
    <section class='faq'>
      <h2>Câu Hỏi Thường Gặp</h2>
      
      <div class='faq-list'>
        <div class='faq-item'>
          <h3 class='faq-question'>Câu hỏi 1 từ primary pain point?</h3>
          <div class='faq-answer'>
            <p>Câu trả lời chi tiết, dựa trên facts và benefits. 2-3 câu.</p>
    </div>
        </div>
        
        <div class='faq-item'>
          <h3 class='faq-question'>Câu hỏi 2 về practical concerns?</h3>
          <div class='faq-answer'>
            <p>Câu trả lời addressing concern, building trust.</p>
          </div>
        </div>
        
        <div class='faq-item'>
          <h3 class='faq-question'>Câu hỏi 3 về value proposition?</h3>
          <div class='faq-answer'>
            <p>Câu trả lời về unique value, differentiation.</p>
          </div>
        </div>
      </div>
    </section>
    
    <!-- 6. Final CTA -->
    <footer class='product-cta'>
      <p><strong>Lời kêu gọi hành động mạnh mẽ, rõ ràng, tạo urgency</strong></p>
    </footer>
    
  </article>"
}

**LƯU Ý QUAN TRỌNG - SEMANTIC HTML:**
- Description PHẢI dùng semantic HTML5: <article>, <header>, <section>, <footer>, <figure>, <dl>, <dt>, <dd>
- PHẢI có đầy đủ 6 sections: header (hero), benefits, specifications (table), use-case, faq, footer (cta)
- Benefits dùng <dl> (definition list) với <dt> (term) và <dd> (description) - cấu trúc card-based
- Table dùng <th> cho headers, <td> cho values - clean & scannable
- FAQ format: <div class='faq-list'> với <div class='faq-item'>, <h3 class='faq-question'>, <div class='faq-answer'>
- Images wrap trong <figure> tag (semantic)

**QUY TẮC VÀNG VỀ HTML & CSS:**
1. **CẤM TUYỆT ĐỐI** style="..." trừ <img> (style='max-width: 100%; height: auto;')
2. **SEMANTIC TAGS:** <article>, <header>, <section>, <footer>, <figure>, <figcaption>, <dl>, <dt>, <dd>
3. **BENEFITS:** Dùng <dl class='benefits-grid'> với benefit-card wrappers
   - Icon: 20px, stroke-width 1.5, opacity 0.6 (subtle)
   - <dt> chứa icon + benefit title (bold)
   - <dd> chứa benefit description
4. **TABLE:** Clean <table> với <th> và <td>, NO wrapper divs
   - <th> cho label column (bold)
   - <td> cho value column
5. **FAQ:** Professional Q&A format (NO <details>, NO accordion)
   - Structure: <div class='faq-list'> → <div class='faq-item'> → <h3 class='faq-question'> + <div class='faq-answer'><p>
   - Questions dùng <h3 class='faq-question'>
   - Answers trong <div class='faq-answer'><p>
   - Theme sẽ style đẹp với borders, spacing, colors
6. **HIERARCHY:** <h1> cho hero title, <h2> cho section titles, <h3> cho FAQ questions

**QUY TẮC VIẾT CONTENT:**
- **Specs Table:** Trích xuất thông tin thật từ mô tả/hình ảnh
  * Chất liệu: Cotton, thép, da... + chi tiết (mềm mại, bóng gương...)
  * Thiết kế: Mô tả cụ thể nhìn thấy được (cổ tròn, khóa kéo, pattern...)
  * Màu sắc: Tên màu cụ thể từ ảnh (Navy xanh đậm, Hồng pastel...)
  * Phù hợp với: Use cases dựa trên persona
  * Bảo quản: Hướng dẫn care thực tế

- **Benefits:** Focus vào OUTCOMES, không phải features
  * Title: Benefit headline (emotional/practical result)
  * Description: Chi tiết cụ thể về transformation
  * Example: "Tự Tin Tỏa Sáng" thay vì "Chất Lượng Cao"

- **FAQ:** Từ pain points thành câu hỏi tự nhiên
  * Q1: Primary pain point → question
  * Q2: Secondary pain point/practical concern → question
  * Q3: Value proposition/differentiation → question
  * Answers: 2-3 câu, fact-based, trust-building

- **Use Case Section:** Describe ideal customer and transformation
  * Versatility, value proposition
  * Real-world usage scenarios

[OUTPUT FORMAT]
Return JSON with the following structure (NO markdown, NO additional text outside JSON):

{
  "title": "New highly compelling title (50-80 characters)",
  "description": "<article class='product-description'>
    
    <!-- 1. Hero Section: Compelling headline + hook -->
    <header class='product-hero'>
      <h1>Main headline hitting result - compelling & benefit-driven</h1>
      <p class='lead'>Hook sentence touching pain point, creating emotional connection instantly</p>
      <figure>
        <img src='HERO_IMAGE_URL' alt='Product hero image' style='max-width: 100%; height: auto;' />
      </figure>
    </header>
    
    <!-- 2. Key Benefits: Visual + Concise -->
    <section class='benefits'>
      <h2>Why You'll Love This Product</h2>
      <dl class='benefits-grid'>
        <div class='benefit-card'>
          <dt>
            <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.5' opacity='0.6' aria-hidden='true'>
              <path d='M20 6L9 17l-5-5'/>
            </svg>
            <strong>Benefit Title 1</strong>
          </dt>
          <dd>Specific benefit details, not features. Focus on outcome/result.</dd>
        </div>
        
        <div class='benefit-card'>
          <dt>
            <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.5' opacity='0.6' aria-hidden='true'>
              <path d='M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2z'/>
            </svg>
            <strong>Benefit Title 2</strong>
          </dt>
          <dd>Second benefit detail, emphasizing transformation.</dd>
        </div>
        
        <div class='benefit-card'>
          <dt>
            <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.5' opacity='0.6' aria-hidden='true'>
              <path d='M12 2v20M2 12h20'/>
            </svg>
            <strong>Benefit Title 3</strong>
          </dt>
          <dd>Third benefit detail, emotional connection.</dd>
        </div>
      </dl>
      <figure>
        <img src='BENEFITS_IMAGE_URL' alt='Product benefits showcase' style='max-width: 100%; height: auto;' />
      </figure>
    </section>
    
    <!-- 3. Product Details: Clean Table -->
    <section class='specifications'>
      <h2>Product Information</h2>
      <table>
        <tbody>
          <tr>
            <th>Material</th>
            <td>Extracted from description/images - specific, detailed</td>
          </tr>
          <tr>
            <th>Design</th>
            <td>Specific design description visible from images</td>
          </tr>
          <tr>
            <th>Colors</th>
            <td>Specific color names from images</td>
          </tr>
          <tr>
            <th>Suitable For</th>
            <td>Specific use cases based on persona</td>
          </tr>
          <tr>
            <th>Care Instructions</th>
            <td>Actual care guidance</td>
          </tr>
        </tbody>
      </table>
    </section>
    
    <!-- 4. Social Proof / Use Case -->
    <section class='use-case'>
      <h2>Who Should Own This Product</h2>
      <p>Detailed description of ideal customer, use cases, and transformation. Emphasize versatility and value.</p>
      <figure>
        <img src='LIFESTYLE_IMAGE_URL' alt='Product in use' style='max-width: 100%; height: auto;' />
        <figcaption>Lifestyle context caption (optional)</figcaption>
      </figure>
    </section>
    
    <!-- 5. FAQ: Professional Q&A Format -->
    <section class='faq'>
      <h2>Frequently Asked Questions</h2>
      
      <div class='faq-list'>
        <div class='faq-item'>
          <h3 class='faq-question'>Question 1 from primary pain point?</h3>
          <div class='faq-answer'>
            <p>Detailed answer based on facts and benefits. 2-3 sentences.</p>
          </div>
        </div>
        
        <div class='faq-item'>
          <h3 class='faq-question'>Question 2 about practical concerns?</h3>
          <div class='faq-answer'>
            <p>Answer addressing concern, building trust.</p>
          </div>
        </div>
        
        <div class='faq-item'>
          <h3 class='faq-question'>Question 3 about value proposition?</h3>
          <div class='faq-answer'>
            <p>Answer about unique value, differentiation.</p>
          </div>
        </div>
      </div>
    </section>
    
    <!-- 6. Final CTA -->
    <footer class='product-cta'>
      <p><strong>Strong, clear call-to-action creating urgency</strong></p>
    </footer>
    
  </article>"
}

**IMPORTANT NOTES - SEMANTIC HTML:**
- Description MUST use semantic HTML5: <article>, <header>, <section>, <footer>, <figure>, <dl>, <dt>, <dd>
- MUST have all 6 sections: header (hero), benefits, specifications (table), use-case, faq, footer (cta)
- Benefits use <dl> (definition list) with <dt> (term) and <dd> (description) - card-based structure
- Table uses <th> for headers, <td> for values - clean & scannable
- FAQ format: <div class='faq-list'> with <div class='faq-item'>, <h3 class='faq-question'>, <div class='faq-answer'>
- Images wrap in <figure> tag (semantic)

**GOLDEN RULES FOR HTML & CSS:**
1. **ABSOLUTELY FORBIDDEN** style="..." except <img> (style='max-width: 100%; height: auto;')
2. **SEMANTIC TAGS:** <article>, <header>, <section>, <footer>, <figure>, <figcaption>, <dl>, <dt>, <dd>
3. **BENEFITS:** Use <dl class='benefits-grid'> with benefit-card wrappers
   - Icon: 20px, stroke-width 1.5, opacity 0.6 (subtle)
   - <dt> contains icon + benefit title (bold)
   - <dd> contains benefit description
4. **TABLE:** Clean <table> with <th> and <td>, NO wrapper divs
   - <th> for label column (bold)
   - <td> for value column
5. **FAQ:** Professional Q&A format (NO <details>, NO accordion)
   - Structure: <div class='faq-list'> → <div class='faq-item'> → <h3 class='faq-question'> + <div class='faq-answer'><p>
   - Questions use <h3 class='faq-question'>
   - Answers in <div class='faq-answer'><p>
   - Theme will style beautifully with borders, spacing, colors
6. **HIERARCHY:** <h1> for hero title, <h2> for section titles, <h3> for FAQ questions

**CONTENT WRITING RULES:**
- **Specs Table:** Extract real information from description/images
  * Material: Cotton, steel, leather... + details (soft, mirror finish...)
  * Design: Specific visible design (round collar, zipper, pattern...)
  * Colors: Specific color names from images (Navy blue, Pastel pink...)
  * Suitable For: Use cases based on persona
  * Care: Actual care instructions

- **Benefits:** Focus on OUTCOMES, not features
  * Title: Benefit headline (emotional/practical result)
  * Description: Specific details about transformation
  * Example: "Confident Shine" instead of "High Quality"

- **FAQ:** Transform pain points into natural questions
  * Q1: Primary pain point → question
  * Q2: Secondary pain point/practical concern → question
  * Q3: Value proposition/differentiation → question
  * Answers: 2-3 sentences, fact-based, trust-building

- **Use Case Section:** Describe ideal customer and transformation
  * Versatility, value proposition
  * Real-world usage scenarios

**CRITICAL LANGUAGE REQUIREMENT:**
ALL content including title, headings, descriptions, FAQ questions and answers, table headers and values MUST be written in ${language}. Do NOT mix languages.`;

    // Prepare messages with images (if available)
    const messageContent: any[] = [
      {
        type: 'text',
        text: contentPrompt
      }
    ];

    // Add ALL images to context - let AI choose the best ones
    if (imageUrls && imageUrls.length > 0) {
      console.log('🖼️ Sending ALL images to AI for analysis:', imageUrls.length);
      imageUrls.forEach((imageUrl: string, index: number) => {
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

    // Get model config for generate-content-from-segmentation API
    const modelConfig = AI_MODELS_CONFIG.generateContentFromSegmentation;
    
    // Call AI API for content generation
    console.log('🤖 Calling AI for content generation...');
    console.log(`🤖 Model: ${modelConfig.model}`);
    console.log(`🌍 Language: ${language}, Market: ${targetMarket}`);
    
    // Simple system message - just tell AI to use the specified language
    const systemMessage = `You are an e-commerce copywriter expert. Create content in ${language}. Return ONLY JSON, no markdown. ALL text in title and description MUST be in ${language}.`;
    
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: modelConfig.model,
        messages: [
          {
            role: 'system',
            content: systemMessage
          },
          {
            role: 'user',
            content: messageContent
          }
        ],
        max_tokens: modelConfig.maxTokens,
        temperature: modelConfig.temperature
      },
      {
        headers: {
          'Authorization': `Bearer ${openRouterApiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'Product Content Generator',
        },
        timeout: modelConfig.timeout
      }
    );

    // Validate API response structure
    if (!response.data || !response.data.choices || response.data.choices.length === 0) {
      console.error('Invalid API response structure:', JSON.stringify(response.data, null, 2));
      throw new Error('Invalid API response: missing choices array');
    }

    if (!response.data.choices[0].message || !response.data.choices[0].message.content) {
      console.error('Invalid message structure:', JSON.stringify(response.data.choices[0], null, 2));
      throw new Error('Invalid API response: missing message content');
    }

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

// 🎨 API: POST /api/product-optimize/generate-image
// 🎯 Mục tiêu: Tạo API mới để phân tích hình ảnh sản phẩm và tạo ra 6 prompt cho các phong cách ảnh khác nhau
router.post('/generate-image', async (req, res) => {
  try {
    const openRouterApiKey = process.env.OPENROUTER_API_KEY;
    
    const { 
      productTitle,
      productImages,
      productDescription,
      keyFeature,
      persona,
      painpoints,
      keywords,
      tone,
      language = 'en',
      market,
      segmentation,
      requestedStyle = 'studio' // NEW: style requested by user (studio, lifestyle, infographic, ugc, closeup, motion)
    } = req.body;

    console.log('🎨 Image Generation - Product:', productTitle);
    console.log('📥 Request Body:', JSON.stringify({
      productTitle,
      productImages: productImages?.length || 0,
      productDescription: productDescription?.substring(0, 100) + '...',
      keyFeature,
      persona,
      painpoints: painpoints?.length || 0,
      keywords: keywords?.length || 0,
      tone,
      language,
      market,
      hasSegmentation: !!segmentation,
      requestedStyle // NEW: log requested style
    }, null, 2));

    // Validate required fields
    if (!productTitle || !productImages || !Array.isArray(productImages) || productImages.length === 0) {
      return res.status(400).json({ 
        error: 'Missing required fields: productTitle and productImages (at least one image URL)' 
      });
    }

    // Extract segmentation data if provided
    let segmentationData = null;
    if (segmentation) {
      segmentationData = {
        name: segmentation.name,
        painpoint: segmentation.painpoint,
        personaProfile: segmentation.personaProfile,
        toneType: segmentation.toneType,
        voiceGuideline: segmentation.voiceGuideline,
        locations: segmentation.locations
      };
    }

    // Get style definition based on requested style
    const styleDefinitions: Record<string, string> = {
      studio: `Studio Shot → pure white or light-gray seamless background, balanced soft studio lighting, eCommerce product catalog look. Clean, professional, high-end marketplace ready.`,
      lifestyle: `Lifestyle Shot → real-life environment that resonates with the target persona. Natural daylight with warm soft shadows. Show product in authentic usage context that the persona can relate to.`,
      infographic: `Infographic Style → clean light neutral background with product-centered composition, add simple text callouts, arrows, or icons highlighting key features or specs that matter most to the target persona.`,
      ugc: `UGC (User Generated Content) → casual human context that matches the target persona's lifestyle, handheld or natural composition, slight imperfections, natural daylight, smartphone photo realism. Must feel authentic to the persona's daily life and usage patterns.`,
      closeup: `Close-up → macro or detailed shot focusing on textures, materials, stitching, surface reflection that address the persona's concerns and pain points. Realistic depth of field, angled light to showcase quality.`,
      motion: `Motion / Animated → 360° product rotation or looped showcase on a reflective white surface with consistent lighting and soft shadows. Comprehensive view for online shoppers.`
    };

    const selectedStyleDefinition = styleDefinitions[requestedStyle] || styleDefinitions.studio;

    // Build persona-driven context
    const personaContext = segmentationData ? `
🎯 TARGET PERSONA PROFILE (CRITICAL - USE THIS TO GUIDE YOUR PROMPT):
- Persona Name: ${segmentationData.name}
- Core Pain Point: ${segmentationData.painpoint}
- Demographics: ${segmentationData.personaProfile?.demographics || 'N/A'}
- Behaviors: ${segmentationData.personaProfile?.behaviors || 'N/A'}
- Preferred Tone: ${segmentationData.toneType || tone || 'N/A'}
- Locations/Context: ${segmentationData.locations ? segmentationData.locations.join(', ') : 'N/A'}
- Voice Guideline: ${segmentationData.voiceGuideline || 'N/A'}

**IMPORTANT**: Your image prompt MUST reflect this persona's lifestyle, values, and usage context. 
For example:
- If persona is "busy working moms", show product in home office or kitchen setting
- If persona is "outdoor adventurers", show product in camping or hiking context
- If persona is "health-conscious millennials", use clean, minimal aesthetic with natural elements
- Match the environment, props, and overall vibe to what resonates with THIS specific persona.
` : (persona ? `
🎯 TARGET PERSONA: ${persona}
**IMPORTANT**: Create image prompt that speaks to this persona's lifestyle and values.
` : '');

    // Build comprehensive prompt for AI
    const imagePrompt = `
TASK:
You will receive product images + product information + target persona details.
You must analyze the product in the images, then create an optimized image prompt for the REQUESTED STYLE: "${requestedStyle}".
The prompt MUST be tailored to resonate with the target persona's lifestyle and pain points.
Always return pure JSON according to the required schema, no markdown wrapper.

STEP 1. ANALYZE IMAGES
- Look directly at each image I send.
- Describe what you actually see: material, color, surface, shape, structure (cap/strap/pattern/logo/layers/unique details that cannot be changed).
- If there are multiple variants (e.g. different sizes), describe the differences.
- Identify visual USP: e.g. "leak-proof screw cap", "316 mirror-finish stainless steel", "dragon mosaic print on navy shirt", etc.

STEP 2. SELECT BEST IMAGE
From all images you receive:
- Choose the clearest image with the most stable lighting and complete product visibility.
- Prioritize images where the product is not obscured.
- If an image clearly shows material texture → prioritize it.
=> Call this bestImageUrl.
Explain why you selected it (imageSelectionReason).

STEP 3. GENERATE PROMPT FOR REQUESTED STYLE: "${requestedStyle}"
With the product in bestImageUrl, create ONE prompt for the "${requestedStyle}" style that keeps the product exactly the same.

REQUESTED STYLE DEFINITION:
${selectedStyleDefinition}

MANDATORY CONSTRAINTS FOR THE PROMPT:
- "Use the provided image as the exact product reference."
- "The product must be pixel-identical to the reference image; treat its shape, material, texture, proportions, logo/print (if any), and color as locked geometry."
- "Do not repaint or redesign any part of the product. No recolor. No added or removed elements. No modifying labels or details."
- "Only replace background, camera angle, environment, lighting, or presentation style."
- "No duplication, no resizing of the main product shape, no cartoon look, no illustration, photorealistic only."

PERSONA-DRIVEN PROMPT REQUIREMENTS:
- The environment, props, and overall aesthetic MUST align with the target persona's lifestyle
- If persona has specific pain points, the image context should subtly address them
- Use colors, lighting, and composition that appeal to this persona's preferences
- The setting should be where this persona would naturally use or encounter this product
- For UGC style especially: the image should look like it was taken by someone from this persona group

STEP 4. TECH SETTINGS
Always include tech_settings block:
- img2img_strength = 0.3 (keep original form, only change context)
- cfg_scale = 9 (reduce excessive creativity)
- lighting = appropriate for the selected style and persona
- style = "photorealistic commercial product photography, high detail, high conversion intent"

OUTPUT FORMAT:
Return pure JSON, no markdown, no additional explanation outside JSON:

{
  "product": "product name from ${productTitle}",
  "analysis": "brief description of product as seen in images, noting material/structure/key selling features",
  "bestImageUrl": "URL of best image you selected from the list below",
  "imageSelectionReason": "why you chose this image as the reference",
  "requestedStyle": "${requestedStyle}",
  "prompt": "the detailed image generation prompt for ${requestedStyle} style, tailored to the target persona",
  "personaAlignment": "brief explanation of how this prompt aligns with the target persona's lifestyle and preferences",
  "tech_settings": {
    "img2img_strength": 0.3,
    "cfg_scale": 9,
    "lighting": "appropriate lighting description for ${requestedStyle}",
    "style": "photorealistic commercial product photography, high detail, high conversion intent"
  }
}

PRODUCT DATA PROVIDED:
- Product Title: ${productTitle}
- Product Description: ${productDescription || 'No description provided'}
- Key Feature: ${keyFeature || 'Not specified'}
- Pain points: ${painpoints ? painpoints.join(', ') : 'Not specified'}
- Keywords: ${keywords ? keywords.join(', ') : 'Not specified'}
- Tone: ${tone || 'Not specified'}
- Market: ${market || 'Not specified'}
- Language: ${language}

${personaContext}

IMAGE INPUTS:
I have sent ${productImages.length} product images at the following URLs. Use them to analyze and select the single bestImageUrl:
${productImages.map((u,i)=>`${i+1}. ${u}`).join('\n')}
`;

    // Prepare messages with images
    const messageContent: any[] = [
      {
        type: 'text',
        text: imagePrompt
      }
    ];

    // Add ALL product images to context
    if (productImages && productImages.length > 0) {
      console.log('🖼️ Sending ALL product images to AI for analysis:', productImages.length);
      productImages.forEach((imageUrl: string, index: number) => {
        console.log(`📸 Product Image ${index + 1}:`, imageUrl);
        messageContent.push({
          type: 'image_url',
          image_url: {
            url: imageUrl
          }
        });
      });
    } else {
      console.log('⚠️ No product images provided for AI analysis');
    }

    // Get model config for generate-image-prompt API
    const modelConfig = AI_MODELS_CONFIG.generateImagePrompt;
    
    // Call AI API for image analysis and prompt generation
    console.log('🤖 Calling AI for image analysis and prompt generation...');
    console.log('📊 AI Request Details:', {
      model: modelConfig.model,
      messageCount: messageContent.length,
      imageCount: productImages?.length || 0,
      promptLength: imagePrompt.length,
      maxTokens: modelConfig.maxTokens,
      temperature: modelConfig.temperature
    });
    
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: modelConfig.model,
        messages: [
          {
            role: 'user',
            content: messageContent
          }
        ],
        max_tokens: modelConfig.maxTokens,
        temperature: modelConfig.temperature
      },
      {
        headers: {
          'Authorization': `Bearer ${openRouterApiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'Product Image Generator',
        },
        timeout: modelConfig.timeout
      }
    );

    // Validate API response structure
    if (!response.data || !response.data.choices || response.data.choices.length === 0) {
      console.error('Invalid API response structure:', JSON.stringify(response.data, null, 2));
      throw new Error('Invalid API response: missing choices array');
    }

    if (!response.data.choices[0].message || !response.data.choices[0].message.content) {
      console.error('Invalid message structure:', JSON.stringify(response.data.choices[0], null, 2));
      throw new Error('Invalid API response: missing message content');
    }

    let content = response.data.choices[0].message.content;
    console.log('📝 Raw AI response length:', content.length);
    console.log('📝 AI Response Preview:', content.substring(0, 200) + '...');

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
      
      console.log('✅ Image prompt generated successfully');
      console.log('📌 Product:', result.product);
      console.log('🎨 Requested Style:', result.requestedStyle);
      console.log('🖼️ Best Image URL:', result.bestImageUrl);
      console.log('💭 Selection Reason:', result.imageSelectionReason);
      console.log('🎯 Persona Alignment:', result.personaAlignment);
      console.log('📝 Generated Prompt Preview:', result.prompt?.substring(0, 200) + '...');
      
      const response = {
        success: true,
        data: result
      };
      
      console.log('📤 Response:', JSON.stringify({
        success: response.success,
        product: response.data.product,
        bestImageUrl: response.data.bestImageUrl,
        requestedStyle: response.data.requestedStyle,
        hasPrompt: !!response.data.prompt,
        personaAlignment: response.data.personaAlignment
      }, null, 2));
      
      res.json(response);
      
    } catch (parseError: any) {
      console.error('❌ JSON parse error:', parseError.message);
      console.log('Raw content:', content);
      
      // Get fallback prompt based on requested style
      const fallbackPrompts: Record<string, string> = {
        studio: `Use the provided image as the exact product reference. Keep the product identical — same structure, material, color, and geometry. Place the product centered on a white-to-light gray seamless background under soft balanced studio lighting. Emphasize realistic highlights and reflections for a premium look. photorealistic, commercial eCommerce ready.`,
        lifestyle: `Use the provided image as the exact product reference. Keep the product identical — same structure, material, and proportions. Remove current background and place the product in a natural lifestyle setting with appropriate props and natural lighting that matches the target persona's daily environment. photorealistic, commercial-ready.`,
        infographic: `Use the provided image as the exact product reference. Keep product identical in color, shape, and design. Center the product on a clean light background with soft shadow. Add minimalist infographic text and icons around it highlighting features that matter to the target persona. Use clean typography and subtle design elements.`,
        ugc: `Use the provided image as the exact product reference. Keep the product unchanged. Place it naturally in a user context that matches the target persona's lifestyle with authentic lighting and slightly imperfect framing like a genuine smartphone photo taken by someone from this persona group. Emphasize authenticity and natural tones.`,
        closeup: `Use the provided image as the exact product reference. Keep same texture, structure, and details. Zoom closely on key features that address the persona's concerns and demonstrate quality. Light source angled to reveal natural reflections and depth. photorealistic macro lens look.`,
        motion: `Use the provided image as the exact product reference. Keep the product identical. Create a 360° rotating animation on a soft reflective base with smooth transitions and accurate perspective. Maintain consistent lighting and reflections across all frames. Comprehensive product showcase.`
      };
      
      // Return fallback response with single prompt for requested style
      res.json({
        success: true,
        data: {
          product: productTitle,
          analysis: `Product analysis for ${productTitle}`,
          bestImageUrl: productImages && productImages.length > 0 ? productImages[0] : null,
          imageSelectionReason: "Selected first image as fallback due to AI analysis failure",
          requestedStyle: requestedStyle,
          prompt: fallbackPrompts[requestedStyle] || fallbackPrompts.studio,
          personaAlignment: persona || segmentationData ? `Fallback prompt includes persona considerations for ${segmentationData?.name || persona}` : 'General purpose prompt',
          tech_settings: {
            img2img_strength: 0.3,
            cfg_scale: 9,
            lighting: requestedStyle === 'studio' ? "balanced studio light" : "natural daylight with soft shadows",
            style: "photorealistic commercial product photography, high detail, high conversion intent"
          }
        }
      });
    }

  } catch (error: any) {
    console.error('❌ Error in generate-image:', error.message);
    console.error('❌ Error details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers
      }
    });
    
    res.status(500).json({ 
      error: 'Failed to generate image prompts',
      message: error.message,
      details: error.response?.data || 'No additional details'
    });
  }
});

// 🎨 API: POST /api/product-optimize/generate-image-result
// 🎯 Mục tiêu: Step 2 - Sử dụng prompt từ Step 1 để tạo ra hình ảnh mới bằng AI
// Validate request API
router.post('/validate-image-request', async (req, res) => {
  try {
    const { productTitle, productImages, productDescription } = req.body;
    
    console.log('🔍 Validating Image Request');
    console.log('📥 Request Size:', JSON.stringify(req.body).length, 'bytes');
    console.log('📥 Request Details:', {
      productTitle: productTitle?.length || 0,
      productImages: productImages?.length || 0,
      productDescription: productDescription?.length || 0,
      totalSize: JSON.stringify(req.body).length
    });
    
    // Check request size
    const requestSize = JSON.stringify(req.body).length;
    if (requestSize > 50000) { // 50KB limit
      return res.status(400).json({
        error: 'Request too large',
        message: `Request size ${requestSize} bytes exceeds 50KB limit`,
        suggestion: 'Reduce productDescription length or number of images'
      });
    }
    
    // Check required fields
    if (!productTitle || !productImages || !Array.isArray(productImages) || productImages.length === 0) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'productTitle and productImages (at least one image URL) are required'
      });
    }
    
    // Check image URLs
    const invalidImages = productImages.filter(url => !url || typeof url !== 'string' || !url.startsWith('http'));
    if (invalidImages.length > 0) {
      return res.status(400).json({
        error: 'Invalid image URLs',
        message: 'All image URLs must be valid HTTP/HTTPS URLs',
        invalidImages: invalidImages.length
      });
    }
    
    res.json({
      success: true,
      message: 'Request validation passed',
      details: {
        requestSize: `${requestSize} bytes`,
        imageCount: productImages.length,
        titleLength: productTitle.length,
        descriptionLength: productDescription?.length || 0
      }
    });
    
  } catch (error: any) {
    console.error('Error in validate-image-request:', error.message);
    res.status(500).json({ 
      error: 'Validation failed',
      message: error.message 
    });
  }
});

// Quick test API for debugging
router.post('/generate-image-quick', async (req, res) => {
  try {
    const { productTitle, productImages } = req.body;
    
    console.log('🚀 Quick Image Generation - Product:', productTitle);
    console.log('📥 Quick Request:', { productTitle, imageCount: productImages?.length || 0 });
    
    // Simple fallback response
    const response = {
      success: true,
      data: {
        product: productTitle,
        analysis: `Quick analysis for ${productTitle}`,
        bestImageUrl: productImages && productImages.length > 0 ? productImages[0] : null,
        imageSelectionReason: "Quick selection - first image",
        styles: {
          studio: "Studio prompt for " + productTitle,
          lifestyle: "Lifestyle prompt for " + productTitle,
          infographic: "Infographic prompt for " + productTitle,
          ugc: "UGC prompt for " + productTitle,
          closeup: "Closeup prompt for " + productTitle,
          motion: "Motion prompt for " + productTitle
        },
        tech_settings: {
          img2img_strength: 0.3,
          cfg_scale: 9,
          lighting: "natural daylight or balanced studio light",
          style: "photorealistic commercial product photography"
        }
      }
    };
    
    console.log('📤 Quick Response:', { success: response.success, product: response.data.product });
    res.json(response);
    
  } catch (error: any) {
    console.error('Error in generate-image-quick:', error.message);
    res.status(500).json({ 
      error: 'Failed to generate quick image prompts',
      message: error.message 
    });
  }
});

router.post('/generate-image-result', async (req, res) => {
  try {
    const openRouterApiKey = process.env.OPENROUTER_API_KEY;
    
    const { 
      prompt,
      originalImageUrl,
      style = 'studio', // studio, lifestyle, infographic, ugc, closeup, motion
      techSettings = {
        img2img_strength: 0.3,
        cfg_scale: 9,
        lighting: "natural daylight or balanced studio light",
        style: "photorealistic commercial product photography"
      }
    } = req.body;

    console.log('🎨 Image Generation Result - Style:', style);
    console.log('📥 Request Body:', JSON.stringify({
      prompt: prompt?.substring(0, 100) + '...',
      originalImageUrl,
      style,
      techSettings
    }, null, 2));

    // Validate required fields
    if (!prompt || !originalImageUrl) {
      return res.status(400).json({ 
        error: 'Missing required fields: prompt and originalImageUrl' 
      });
    }

    // Validate style
    const validStyles = ['studio', 'lifestyle', 'infographic', 'ugc', 'closeup', 'motion'];
    if (!validStyles.includes(style)) {
      return res.status(400).json({ 
        error: `Invalid style. Must be one of: ${validStyles.join(', ')}` 
      });
    }

    // Prepare message content with image and prompt for Gemini
    const messageContent: any[] = [
      {
        type: 'text',
        text: `Create a professional e-commerce product photo. Use the provided image as reference and create a new image following this style: ${prompt}. Generate a high-quality, photorealistic result that looks authentic and appealing.`
      },
      {
        type: 'image_url',
        image_url: {
          url: originalImageUrl
        }
      }
    ];

    // Get model config for generate-image-result API
    const modelConfig = AI_MODELS_CONFIG.generateImageResult;
    
    // Call AI API for image generation
    console.log('🤖 Calling AI for image generation...');
    console.log('📊 AI Request Details:', {
      model: modelConfig.model,
      messageCount: messageContent.length,
      promptLength: prompt.length,
      originalImageUrl,
      style,
      maxTokens: modelConfig.maxTokens,
      temperature: modelConfig.temperature
    });
    
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: modelConfig.model,
        messages: [
          {
            role: 'user',
            content: messageContent
          }
        ],
        max_tokens: modelConfig.maxTokens,
        temperature: modelConfig.temperature
      },
      {
        headers: {
          'Authorization': `Bearer ${openRouterApiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'Product Image Generator',
        },
        timeout: modelConfig.timeout
      }
    );

    const apiResult = response.data;
    console.log('✅ Image generated successfully');
    console.log('📌 Style:', style);
    console.log('📸 API Response:', JSON.stringify(apiResult, null, 2));
    
    // Extract the generated image URL from Gemini 2.5 Flash Image Preview response
    let generatedImageUrl = null;
    
    console.log('🔍 Analyzing OpenRouter response structure...');
    console.log('Result choices:', apiResult.choices);
    
    if (apiResult.choices && apiResult.choices[0] && apiResult.choices[0].message) {
      const content = apiResult.choices[0].message.content;
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
      console.log('Full response structure:', JSON.stringify(apiResult, null, 2));
      
      // Check if there's a data field with images
      if (apiResult.data && Array.isArray(apiResult.data)) {
        const imageData = apiResult.data.find((item: any) => item.url);
        if (imageData) {
          generatedImageUrl = imageData.url;
          console.log('Found image URL in data array:', generatedImageUrl);
        }
      }
      
      // Check the entire response string for base64 data URLs
      if (!generatedImageUrl) {
        const responseString = JSON.stringify(apiResult);
        const base64Match = responseString.match(/data:image\/[^;]+;base64,[A-Za-z0-9+/=]+/);
        if (base64Match) {
          generatedImageUrl = base64Match[0];
          console.log('Found base64 data URL in full response:', generatedImageUrl.substring(0, 100) + '...');
        }
      }
    }
    
    // Fallback to original image if no image URL found
    if (!generatedImageUrl) {
      console.log('❌ No image URL found in response, using original image');
      console.log('Response content:', apiResult.choices?.[0]?.message?.content);
      console.log('This means the AI model did not generate an image, only returned text description');
      generatedImageUrl = originalImageUrl;
    } else {
      console.log('✅ Generated image URL found:', generatedImageUrl);
    }
    
    const responseData = {
      success: true,
      data: {
        generatedImage: generatedImageUrl,
        style: style,
        originalImageUrl: originalImageUrl,
        prompt: prompt,
        techSettings: techSettings,
        timestamp: new Date().toISOString(),
        note: generatedImageUrl === originalImageUrl ? "AI image generation not supported via OpenRouter, returning original image" : "Image generated successfully"
      }
    };
    
    console.log('📤 Response:', JSON.stringify({
      success: responseData.success,
      style: responseData.data.style,
      generatedImageLength: responseData.data.generatedImage?.length || 0,
      originalImageUrl: responseData.data.originalImageUrl,
      timestamp: responseData.data.timestamp,
      note: responseData.data.note
    }, null, 2));
    
    res.json(responseData);

  } catch (error: any) {
    console.error('Error in generate-image-result:', error.message);
    res.status(500).json({ 
      error: 'Failed to generate image result',
      message: error.message 
    });
  }
});

// 🖼️ API: POST /api/product-optimize/generate-alt-text
// 🎯 Mục tiêu: Tạo alt text cho các ảnh sản phẩm sử dụng x-ai/grok-4-fast
router.post('/generate-alt-text', async (req, res) => {
  try {
    const openRouterApiKey = process.env.OPENROUTER_API_KEY;
    if (!openRouterApiKey) {
      return res.status(500).json({ error: 'OpenRouter API key not configured' });
    }

    const {
      productTitle,
      images,
      selectedSegment,
      targetMarket = 'vi',
      tone = 'friendly',
      language = 'vi-VN' // Language for output: 'vi-VN', 'en-US', 'vi', 'en', etc.
    } = req.body;

    console.log('🖼️ Generating Alt Text - Product:', productTitle);
    console.log('📥 Images count:', images?.length || 0);
    console.log('🌍 Market:', targetMarket, 'Language:', language);

    // Validate required fields
    if (!productTitle) {
      return res.status(400).json({ error: 'productTitle is required' });
    }

    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ error: 'images array is required and must not be empty' });
    }

    // Extract keyword suggestions from selectedSegment
    const keywordSuggestions = selectedSegment?.keywordSuggestions || [];
    const primaryKeywords = keywordSuggestions.slice(0, 3).join(', ');
    const secondaryKeywords = keywordSuggestions.slice(3).join(', ') || primaryKeywords;
    
    // Get persona name for target audience
    const targetAudience = selectedSegment?.name || 'E-commerce customers';
    
    // Extract image URLs from images array
    const imageUrls: string[] = [];
    images.forEach((image: any) => {
      const url = image.url || image.src || image.imageUrl || null;
      if (url && typeof url === 'string' && url.trim()) {
        imageUrls.push(url.trim());
      }
    });

    console.log(`📸 Found ${imageUrls.length} image URLs out of ${images.length} images`);
    
    // Simple prompt - just pass language and targetMarket directly to AI
    const prompt = `# BACKGROUND & ROLE

You are a Search Engine Optimization (SEO) and Artificial Intelligence (AI) expert for e-commerce. Your task is to ANALYZE THE PROVIDED IMAGES DIRECTLY and create accurate alt text based on the actual content of each image.

# IMPORTANT - IMAGE ANALYSIS

**YOU MUST:**
1. **LOOK AT AND ANALYZE** each image sent with this message
2. **ACCURATELY DESCRIBE** what you see in each image (angle, context, product details, colors, etc.)
3. **CREATE ALT TEXT** based on the actual content of the image, not assumptions
4. **WRITE ALL ALT TEXT IN THE LANGUAGE SPECIFIED:** ${language}

# OBJECTIVE

Analyze ${images.length} product images and write ${images.length} unique, accurate alt texts in ${language}, optimized for Google Images and enhanced AI recognition.

# INPUT DATA

*   **Product Title:** ${productTitle}
*   **Image Count:** ${images.length}
*   **Primary Keywords:** ${primaryKeywords || 'elegant product'}
*   **Secondary Keywords:** ${secondaryKeywords || primaryKeywords || 'elegant product'}
*   **Target Audience:** ${targetAudience}
*   **Tone:** ${tone}
*   **Target Market:** ${targetMarket}
*   **Output Language:** ${language} - **CRITICAL: All alt text MUST be written in this language**

# DETAILED REQUIREMENTS

1.  **ANALYZE EACH IMAGE:** 
    - Carefully examine each image sent with this message
    - Identify the photography angle (studio, close-up, lifestyle, model wearing, packaging, etc.)
    - Describe what you see: colors, details, context, models (if any)

2.  **CREATE ACCURATE ALT TEXT:**
    - Based on the actual content of the image, not assumptions
    - Naturally integrate keywords
    - Direct description, don't start with "Image of..." or "Picture of..."
    - Keep reasonable length (under 125 characters)
    - **MUST BE WRITTEN IN ${language}**

# OUTPUT FORMAT

Present results as a numbered list from 1 to ${images.length}, corresponding to the order of images sent:

1. [alt text for first image in ${language} - accurately describe the image content]
2. [alt text for second image in ${language} - accurately describe the image content]
...
${images.length}. [alt text for last image in ${language} - accurately describe the image content]

Return only the numbered list, no additional text before or after. All alt text MUST be in ${language}.`;

    // Get model config for generate-alt-text API
    const modelConfig = AI_MODELS_CONFIG.generateAltText;
    
    console.log('🤖 Calling AI for alt text generation with image analysis...');
    console.log(`🤖 Model: ${modelConfig.model}`);

    // Prepare message content with images
    const messageContent: any[] = [
      {
        type: 'text',
        text: prompt
      }
    ];

    // Add all images to the message for AI to analyze
    if (imageUrls.length > 0) {
      console.log(`🖼️ Adding ${imageUrls.length} images to AI context for analysis...`);
      imageUrls.forEach((imageUrl: string, index: number) => {
        console.log(`   📸 Image ${index + 1}: ${imageUrl.substring(0, 80)}...`);
        messageContent.push({
          type: 'image_url',
          image_url: {
            url: imageUrl
          }
        });
      });
    } else {
      console.log('⚠️ No image URLs found - AI will generate based on product metadata only');
    }

    let response;
    try {
      response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: modelConfig.model,
          messages: [
            {
              role: 'system',
              content: `You are an SEO and AI optimization expert. Analyze the provided images directly and create accurate alt text in ${language} based on the actual content of each image. Return only the numbered list of alt texts, one per line, starting with "1." All alt text MUST be in ${language}.`
            },
            {
              role: 'user',
              content: messageContent
            }
          ],
          max_tokens: modelConfig.maxTokens,
          temperature: modelConfig.temperature
        },
        {
          headers: {
            'Authorization': `Bearer ${openRouterApiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'http://localhost:3000',
            'X-Title': 'Alt Text Generator',
          },
          timeout: modelConfig.timeout
        }
      );
    } catch (apiError: any) {
      console.error('❌ OpenRouter API error:', apiError.response?.status, apiError.response?.data);
      
      // If error is due to invalid image URLs, fallback to text-only generation
      if (apiError.response?.status === 400 && imageUrls.length > 0) {
        console.log('⚠️ API rejected image URLs, falling back to text-only generation...');
        
        // Remove images from message and try again with text-only
        const textOnlyPrompt = `Create ${images.length} alt texts in ${language} for product "${productTitle}" based on keywords: ${primaryKeywords}. Each alt text should describe a different photography angle (studio, close-up, lifestyle, etc.). All alt text MUST be in ${language}.\n\n1. [alt text 1]\n2. [alt text 2]\n...\n${images.length}. [alt text ${images.length}]`;
        
        try {
          response = await axios.post(
            'https://openrouter.ai/api/v1/chat/completions',
            {
              model: 'x-ai/grok-4-fast',
              messages: [
                {
                  role: 'system',
                  content: `You are an SEO expert. Create alt text in ${language}. Return only the numbered list. All alt text MUST be in ${language}.`
                },
                {
                  role: 'user',
                  content: textOnlyPrompt
                }
              ],
              max_tokens: 2000,
              temperature: 0.7
            },
            {
              headers: {
                'Authorization': `Bearer ${openRouterApiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'http://localhost:3000',
                'X-Title': 'Alt Text Generator',
              },
              timeout: modelConfig.timeout
            }
          );
        } catch (fallbackError: any) {
          throw new Error(`OpenRouter API failed: ${fallbackError.response?.data?.error?.message || fallbackError.message}`);
        }
      } else {
        throw new Error(`OpenRouter API error: ${apiError.response?.data?.error?.message || apiError.message}`);
      }
    }

    // Validate API response structure
    if (!response.data || !response.data.choices || response.data.choices.length === 0) {
      console.error('Invalid API response structure:', JSON.stringify(response.data, null, 2));
      throw new Error('Invalid API response: missing choices array');
    }

    if (!response.data.choices[0].message || !response.data.choices[0].message.content) {
      console.error('Invalid message structure:', JSON.stringify(response.data.choices[0], null, 2));
      throw new Error('Invalid API response: missing message content');
    }

    let content = response.data.choices[0].message.content.trim();
    console.log('📝 Raw AI response:', content.substring(0, 200) + '...');

    // Parse the numbered list of alt texts
    const altTexts: string[] = [];
    const lines = content.split('\n').filter((line: string) => line.trim().length > 0);
    
    for (const line of lines) {
      // Extract alt text from numbered lines like "1. Alt text here" or "1) Alt text here"
      const match = line.match(/^\d+[.)]\s*(.+)$/);
      if (match && match[1]) {
        altTexts.push(match[1].trim());
      } else if (!line.match(/^\d+/) && line.trim().length > 0) {
        // If line doesn't start with number but has content, include it
        altTexts.push(line.trim());
      }
    }

    // Ensure we have the correct number of alt texts
    while (altTexts.length < images.length) {
      altTexts.push(`${productTitle} - Image ${altTexts.length + 1}`);
    }

    // Take only the number we need
    const finalAltTexts = altTexts.slice(0, images.length);

    // Pair alt text with image IDs
    const result = images.map((image: any, index: number) => ({
      imageId: image.id || `image-${index + 1}`,
      altText: finalAltTexts[index] || `${productTitle} - Image ${index + 1}`,
      imageUrl: image.url || image.src || null
    }));

    console.log('✅ Alt text generated successfully for', result.length, 'images');

    res.json({
      success: true,
      data: {
        productTitle,
        images: result,
        count: result.length
      }
    });

  } catch (error: any) {
    console.error('Error in generate-alt-text:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to generate alt text',
      message: error.message
    });
  }
});

export default router;
