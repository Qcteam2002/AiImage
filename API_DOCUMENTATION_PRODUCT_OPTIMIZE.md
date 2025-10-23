# Product Optimize API Documentation

## Endpoint
```
POST /api/product-optimize/optimize
```

## Content-Type
```
Content-Type: application/json
```

## Request Body Format

### Required Fields
```json
{
  "type": "string",
  "productTitle": "string",
  "productDescription": "string",
  "productId": "string",
  "productImages": ["string"],
  "keywords": ["string"],
  "tone": "string",
  "languageOutput": "string",
  "targetMarket": "string"
}
```

### Optional Fields
```json
{
  "persona": "string",
  "painpoints": ["string"]
}
```

## Field Descriptions

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `type` | string | ✅ | Type of optimization | `"keyword"`, `"pas"`, `"aida"`, `"professional"` |
| `productTitle` | string | ✅ | Product title | `"Bộ 4 Nhẫn Punk phong cách Olivia Rodrigo"` |
| `productDescription` | string | ✅ | Product description | `"🎶 Nhận diện phong cách với bộ nhẫn..."` |
| `productId` | string | ✅ | Product ID | `"58"` |
| `productImages` | array | ✅ | Array of product image URLs | `["https://cdn.shopify.com/..."]` |
| `keywords` | array | ✅ | Keywords for SEO | `["nhẫn không vừa tay", "quà tặng fan"]` |
| `tone` | string | ✅ | Content tone | `"friendly"` |
| `languageOutput` | string | ✅ | Output language | `"en-US"`, `"vi-VN"`, `"fr-FR"`, `"de-DE"`, etc. |
| `targetMarket` | string | ✅ | Target market | `"US"`, `"VN"`, `"FR"`, `"DE"`, etc. |
| `persona` | string | ❌ | Customer persona | `"General Customer"` |
| `painpoints` | array | ❌ | Customer pain points | `["Sợ mua hàng giả"]` |

## Content Types

### Available Types
- `"keyword"` - SEO keyword optimization (default)
- `"pas"` - Problem-Agitation-Solution structure
- `"aida"` - Attention-Interest-Desire-Action structure  
- `"professional"` - Professional e-commerce optimization

## Language & Market Options

### Language Output
- `"en-US"` - English (US)
- `"vi-VN"` - Vietnamese (Vietnam)
- `"fr-FR"` - French (France)
- `"de-DE"` - German (Germany)
- `"es-ES"` - Spanish (Spain)
- `"ja-JP"` - Japanese (Japan)
- `"ko-KR"` - Korean (South Korea)
- And many more...

### Target Market
- `"US"` - United States
- `"VN"` - Vietnam
- `"FR"` - France
- `"DE"` - Germany
- `"ES"` - Spain
- `"JP"` - Japan
- `"KR"` - South Korea
- And many more...

## Market Insights API

### Endpoint
```
POST /api/product-optimize/suggest-data
```

### Request Body
```json
{
  "product_title": "string",
  "product_description": "string",
  "product_id": "string",
  "target_market": "string",
  "languageOutput": "string",
  "market_insight_date": "string"
}
```

### Market Insights Fields

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `product_title` | string | ✅ | Product title | `"Olivia Rodrigo Punk Ring Set"` |
| `product_description` | string | ✅ | Product description | `"Express your unique style..."` |
| `product_id` | string | ❌ | Product ID | `"58"` |
| `target_market` | string | ✅ | Target market code | `"us"`, `"vi"`, `"fr"` |
| `languageOutput` | string | ✅ | Response language | `"en-US"`, `"vi-VN"`, `"fr-FR"` |
| `market_insight_date` | string | ❌ | Analysis date (YYYY-MM-DD) | `"2025-10-21"` |

### Market Insights Response
```json
{
  "keywords": {
    "informational": [
      { "keyword": "string", "volume": number, "cpc": number, "competition": "string" }
    ],
    "transactional": [
      { "keyword": "string", "volume": number, "cpc": number, "competition": "string" }
    ],
    "comparative": [
      { "keyword": "string", "volume": number, "cpc": number, "competition": "string" }
    ],
    "painpoint_related": [
      { "keyword": "string", "volume": number, "cpc": number, "competition": "string" }
    ]
  },
  "target_customers": [
    {
      "name": "string",
      "description": "string",
      "demographics": "string",
      "location": "string",
      "age_range": "string",
      "interests": ["string"],
      "behavior": "string",
      "common_painpoints": ["string"]
    }
  ]
}
```

## Example Requests

### PAS Model (Problem-Agitation-Solution)
```json
{
  "type": "pas",
  "productTitle": "Bộ 4 Nhẫn Punk phong cách Olivia Rodrigo, Bạc, Thích hợp Mọi size, Quà Cực Chất cho Fans",
  "productDescription": "🎶 Nhận diện phong cách với bộ nhẫn Punk Olivia Rodrigo - quà hấp dẫn nhất dành cho fan! Mỗi chiếc nhẫn mang thông điệp về 'World Tour GUTS', thể hiện tình yêu to lớn với âm nhạc và sự dũng cảm để sống đam mê.🔬Sản xuất từ hợp kim đồng làm nổi bật vẻ đẹp giản dị nhưng đầy mạnh mẽ.💍 Bộ nhẫn có khả năng điều chỉnh sao cho vừa vặn với mọi kích cỡ ngón tay, từ size #6-#10.🎁 Quà tặng ý nghĩa dành cho mọi người yêu thích Olivia, mang đến niềm hứng khởi trong cuộc sống hằng ngày.",
  "productId": "58",
  "productImages": ["https://cdn.shopify.com/s/files/1/0679/2540/9948/files/S7b9c20a3f7af4d9597225069be8c2271R.webp?v=1743661265"],
  "keywords": ["olivia rodrigo phong cách punk", "ý nghĩa bộ nhẫn guts tour"],
  "persona": "General Customer",
  "painpoints": ["Sợ mua phải hàng giả, hàng nhái, hoặc hàng fanmade kém chất lượng"],
  "tone": "friendly",
  "languageOutput": "en-US",
  "targetMarket": "US"
}
```

### AIDA Model (Attention-Interest-Desire-Action)
```json
{
  "type": "aida",
  "productTitle": "Bộ 4 Nhẫn Punk phong cách Olivia Rodrigo, Bạc, Thích hợp Mọi size, Quà Cực Chất cho Fans",
  "productDescription": "🎶 Nhận diện phong cách với bộ nhẫn Punk Olivia Rodrigo - quà hấp dẫn nhất dành cho fan! Mỗi chiếc nhẫn mang thông điệp về 'World Tour GUTS', thể hiện tình yêu to lớn với âm nhạc và sự dũng cảm để sống đam mê.🔬Sản xuất từ hợp kim đồng làm nổi bật vẻ đẹp giản dị nhưng đầy mạnh mẽ.💍 Bộ nhẫn có khả năng điều chỉnh sao cho vừa vặn với mọi kích cỡ ngón tay, từ size #6-#10.🎁 Quà tặng ý nghĩa dành cho mọi người yêu thích Olivia, mang đến niềm hứng khởi trong cuộc sống hằng ngày.",
  "productId": "58",
  "productImages": ["https://cdn.shopify.com/s/files/1/0679/2540/9948/files/S7b9c20a3f7af4d9597225069be8c2271R.webp?v=1743661265"],
  "keywords": ["olivia rodrigo phong cách punk", "ý nghĩa bộ nhẫn guts tour"],
  "persona": "General Customer",
  "painpoints": ["Sợ mua phải hàng giả, hàng nhái, hoặc hàng fanmade kém chất lượng"],
  "tone": "friendly",
  "languageOutput": "en-US",
  "targetMarket": "US"
}
```

### Professional E-commerce Model
```json
{
  "type": "professional",
  "productTitle": "Bộ 4 Nhẫn Punk phong cách Olivia Rodrigo, Bạc, Thích hợp Mọi size, Quà Cực Chất cho Fans",
  "productDescription": "🎶 Nhận diện phong cách với bộ nhẫn Punk Olivia Rodrigo - quà hấp dẫn nhất dành cho fan! Mỗi chiếc nhẫn mang thông điệp về 'World Tour GUTS', thể hiện tình yêu to lớn với âm nhạc và sự dũng cảm để sống đam mê.🔬Sản xuất từ hợp kim đồng làm nổi bật vẻ đẹp giản dị nhưng đầy mạnh mẽ.💍 Bộ nhẫn có khả năng điều chỉnh sao cho vừa vặn với mọi kích cỡ ngón tay, từ size #6-#10.🎁 Quà tặng ý nghĩa dành cho mọi người yêu thích Olivia, mang đến niềm hứng khởi trong cuộc sống hằng ngày.",
  "productId": "58",
  "productImages": ["https://cdn.shopify.com/s/files/1/0679/2540/9948/files/S7b9c20a3f7af4d9597225069be8c2271R.webp?v=1743661265"],
  "keywords": ["olivia rodrigo phong cách punk", "ý nghĩa bộ nhẫn guts tour"],
  "persona": "General Customer",
  "painpoints": ["Sợ mua phải hàng giả, hàng nhái, hoặc hàng fanmade kém chất lượng"],
  "tone": "friendly",
  "languageOutput": "en-US",
  "targetMarket": "US"
}
```

### Keyword Optimization (Default)
```json
{
  "type": "keyword",
  "productTitle": "Bộ 4 Nhẫn Punk phong cách Olivia Rodrigo, Bạc, Thích hợp Mọi size, Quà Cực Chất cho Fans",
  "productDescription": "🎶 Nhận diện phong cách với bộ nhẫn Punk Olivia Rodrigo - quà hấp dẫn nhất dành cho fan! Mỗi chiếc nhẫn mang thông điệp về 'World Tour GUTS', thể hiện tình yêu to lớn với âm nhạc và sự dũng cảm để sống đam mê.🔬Sản xuất từ hợp kim đồng làm nổi bật vẻ đẹp giản dị nhưng đầy mạnh mẽ.💍 Bộ nhẫn có khả năng điều chỉnh sao cho vừa vặn với mọi kích cỡ ngón tay, từ size #6-#10.🎁 Quà tặng ý nghĩa dành cho mọi người yêu thích Olivia, mang đến niềm hứng khởi trong cuộc sống hằng ngày.",
  "productId": "58",
  "productImages": ["https://cdn.shopify.com/s/files/1/0679/2540/9948/files/S7b9c20a3f7af4d9597225069be8c2271R.webp?v=1743661265"],
  "type": "keyword",
  "keywords": ["olivia rodrigo phong cách punk", "ý nghĩa bộ nhẫn guts tour"],
  "persona": "General Customer",
  "painpoints": [],
  "tone": "friendly",
  "languageOutput": "en-US",
  "targetMarket": "US"
}
```

### Vietnamese Output
```json
{
  "type": "keyword",
  "productTitle": "Bộ 4 Nhẫn Punk phong cách Olivia Rodrigo, Bạc, Thích hợp Mọi size, Quà Cực Chất cho Fans",
  "productDescription": "🎶 Nhận diện phong cách với bộ nhẫn Punk Olivia Rodrigo - quà hấp dẫn nhất dành cho fan! Mỗi chiếc nhẫn mang thông điệp về 'World Tour GUTS', thể hiện tình yêu to lớn với âm nhạc và sự dũng cảm để sống đam mê.🔬Sản xuất từ hợp kim đồng làm nổi bật vẻ đẹp giản dị nhưng đầy mạnh mẽ.💍 Bộ nhẫn có khả năng điều chỉnh sao cho vừa vặn với mọi kích cỡ ngón tay, từ size #6-#10.🎁 Quà tặng ý nghĩa dành cho mọi người yêu thích Olivia, mang đến niềm hứng khởi trong cuộc sống hằng ngày.",
  "productId": "58",
  "productImages": ["https://cdn.shopify.com/s/files/1/0679/2540/9948/files/S7b9c20a3f7af4d9597225069be8c2271R.webp?v=1743661265"],
  "type": "keyword",
  "keywords": ["nhẫn không vừa tay làm sao", "mua quà tặng fan idol sợ bị lừa", "nhẫn bị đen, nhẫn bị gỉ sét"],
  "persona": "Người Tìm Quà Tặng Độc Đáo",
  "painpoints": ["Sợ mua phải hàng giả, hàng nhái, hoặc hàng fanmade kém chất lượng, không truyền tải đúng tinh thần GUTS Tour."],
  "tone": "friendly",
  "languageOutput": "vi",
  "targetMarket": "VN"
}
```

## Response Format

### Success Response
```json
{
  "new_title": "string",
  "new_description": "string"
}
```

### Error Response
```json
{
  "error": "string"
}
```

## Example Responses

### PAS Model Response
```json
{
  "new_title": "Elevate Your Style with Authentic Punk Rings Inspired by Olivia Rodrigo",
  "new_description": "<div style='font-family: \"Poppins\", sans-serif; color: #333;'><h1 style='font-size: 32px;'>Are You Tired of Fake Merchandise?</h1><p style='font-size: 16px; margin: 10px 0;'>As a devoted fan of Olivia Rodrigo, you want to showcase your love for her music authentically. However, the market is flooded with counterfeit items that misrepresent her powerful message and style.</p><h2 style='font-size: 24px;'>The Frustration of Fake Merchandise</h2><p style='font-size: 16px; margin: 10px 0;'>Wearing knock-off rings not only undermines your passion but can also lead to disappointment when the quality doesn't match your expectations. You deserve to express your admiration for Olivia's 'World Tour GUTS' in a way that feels genuine and empowering.</p><h2 style='font-size: 24px;'>Discover the Solution: Punk Style Rings</h2><p style='font-size: 16px; margin: 10px 0;'>Introducing the exclusive set of 4 Punk rings inspired by Olivia Rodrigo! Crafted from high-quality alloy, these rings embody the essence of strength and simplicity. Each piece is adjustable to fit sizes #6 to #10, ensuring a perfect fit for everyone. This meaningful gift not only celebrates your love for Olivia but also enhances your daily style with a touch of punk elegance.</p><img src='https://cdn.shopify.com/s/files/1/0679/2540/9948/files/S7b9c20a3f7af4d9597225069be8c2271R.webp?v=1743661265' alt='Olivia Rodrigo Punk Rings' style='max-width: 100%; height: auto; margin: 20px 0;' /><p style='font-size: 16px; margin: 10px 0;'>Don't settle for less – wear your passion proudly with these authentic rings that truly represent your fandom. Stand out and inspire others with every gesture!</p></div>"
}
```

### AIDA Model Response
```json
{
  "new_title": "Elevate Your Style with Olivia Rodrigo's Punk Ring Set - Perfect for Every Fan!",
  "new_description": "<div style='font-family: \"Montserrat\", sans-serif; color: #333; line-height: 1.5;'><h1 style='font-size: 32px;'>Embrace Your Inner Punk with Olivia Rodrigo's Exclusive Ring Set</h1><div style='margin: 20px 0;'><img src='https://cdn.shopify.com/s/files/1/0679/2540/9948/files/S7b9c20a3f7af4d9597225069be8c2271R.webp?v=1743661265' style='width: 100%; border-radius: 8px;'></div><h2 style='font-size: 24px;'>Unleash Your Style</h2><p style='font-size: 16px;'>Each ring in this stunning set reflects the bold spirit of Olivia Rodrigo's 'World Tour GUTS'. Crafted from high-quality alloy, these rings combine elegance with a punk edge, making them perfect for any occasion.</p><h2 style='font-size: 24px;'>Quality You Can Trust</h2><p style='font-size: 16px;'>Designed to fit sizes #6 to #10, our adjustable rings ensure comfort and style for everyone. Say goodbye to worries about counterfeit or low-quality fan merchandise; our rings are a genuine celebration of your fandom.</p><h2 style='font-size: 24px;'>A Gift That Resonates</h2><p style='font-size: 16px;'>This set is more than just jewelry; it's a meaningful gift for any Olivia Rodrigo fan. Show your love and support for the artist while adding a unique piece to your collection.</p><h2 style='font-size: 24px;'>Act Now!</h2><p style='font-size: 16px;'>Don't miss out on this chance to own a piece of Olivia Rodrigo's world. Elevate your style and express your passion for music with these exclusive rings today!</p></div>"
}
```

### Keyword Optimization Response
```json
{
  "new_title": "Olivia Rodrigo Punk Style Ring Set - Adjustable, Meaningful Gift for Fans",
  "new_description": "<div style='max-width: 600px; margin: auto; font-family: Arial, sans-serif;'><h3 style='color: #333;'>Embrace the Punk Style with Olivia Rodrigo's Ring Set!</h3><p style='color: #555;'>Show your love for Olivia Rodrigo with this stunning <strong>Punk Style Ring Set</strong>. Each ring captures the essence of the 'GUTS World Tour', celebrating passion and courage in music.</p><img src='https://cdn.shopify.com/s/files/1/0679/2540/9948/files/S7b9c20a3f7af4d9597225069be8c2271R.webp?v=1743661265' alt='Olivia Rodrigo Punk Style Ring Set' style='width: 100%; height: auto; border-radius: 8px; margin: 20px 0;'> <h3 style='color: #333;'>Features:</h3><ul style='color: #555;'> <li><strong>Adjustable Fit:</strong> Suitable for all sizes, from #6 to #10.</li> <li><strong>Quality Material:</strong> Made from durable alloy that highlights a simple yet powerful aesthetic.</li> <li><strong>Meaningful Gift:</strong> Perfect for any Olivia Rodrigo fan, adding excitement to everyday life.</li> </ul><p style='color: #555;'>Whether you're attending a concert or just want to express your fandom, this ring set is a must-have! 🎁</p></div>"
}
```

### Vietnamese Response
```json
{
  "new_title": "Bộ 4 Nhẫn Punk Olivia Rodrigo - Quà Tặng Độc Đáo Dành Cho Fan",
  "new_description": "<div style='max-width:600px; margin:auto; font-family: Arial, sans-serif;'><h3 style='color:#333;'>Chào Mừng Bạn Đến Với Bộ Nhẫn Punk Olivia Rodrigo</h3><p style='color:#555;'>Bạn đang tìm kiếm một món quà tặng độc đáo cho fan của Olivia Rodrigo? Bộ nhẫn Punk này chính là sự lựa chọn hoàn hảo! Với thiết kế ấn tượng và thông điệp từ 'World Tour GUTS', mỗi chiếc nhẫn không chỉ là món trang sức mà còn là một phần của đam mê âm nhạc.</p><img src='https://cdn.shopify.com/s/files/1/0679/2540/9948/files/S7b9c20a3f7af4d9597225069be8c2271R.webp?v=1743661265' alt='Bộ Nhẫn Punk Olivia Rodrigo' style='width:100%; height:auto; border-radius:8px; margin-bottom:20px;'> <h3 style='color:#333;'>Tại Sao Bạn Nên Chọn Bộ Nhẫn Này?</h3><ul style='color:#555;'> <li><strong>Chất Liệu Bền Bỉ:</strong> Được sản xuất từ hợp kim đồng, bạn không cần lo lắng về việc <em>nhẫn bị đen hay gỉ sét</em>.</li> <li><strong>Thích Hợp Mọi Kích Cỡ:</strong> Nhẫn có khả năng điều chỉnh sao cho vừa vặn với mọi kích cỡ ngón tay, từ size #6-#10, không còn lo <em>nhẫn không vừa tay</em>!</li> <li><strong>Quà Tặng Ý Nghĩa:</strong> Một món quà đầy tâm huyết, mang đến niềm hứng khởi cho bất kỳ ai yêu thích âm nhạc của Olivia.</li> </ul> <h3 style='color:#333;'>Đặt Mua Ngay Hôm Nay!</h3><p style='color:#555;'>Đừng để bản thân phải lo lắng về việc <em>mua quà tặng fan idol sợ bị lừa</em>. Với bộ nhẫn này, bạn sẽ hoàn toàn yên tâm về chất lượng và thiết kế. Hãy để món quà này gửi gắm tình yêu thương của bạn đến người đặc biệt!</p></div>"
}
```

## Important Notes

### 1. Content-Type Header
**CRITICAL:** Must be `application/json`
```http
Content-Type: application/json
```

### 2. Image URLs
- Use actual product image URLs, not placeholders
- Array can contain `null` values (will be filtered out)
- First valid URL will be used in the output

### 3. Language Detection
- `languageOutput: "en-US"` + `targetMarket: "US"` = English output
- `languageOutput: "vi"` + `targetMarket: "VN"` = Vietnamese output
- Any other combination defaults to Vietnamese

### 4. Response Description
- Contains HTML with inline CSS
- Uses actual product images (not placeholders)
- Responsive design with proper styling
- Includes keywords naturally in content

## Debug Endpoint

For testing data format:
```
POST /api/product-optimize/debug
```

Returns the exact data received by the server.

## cURL Examples

### English Request
```bash
curl -X POST http://localhost:3001/api/product-optimize/optimize \
  -H "Content-Type: application/json" \
  -d '{
    "type": "keyword",
    "productTitle": "Test Product",
    "productDescription": "Test Description",
    "productId": "58",
    "productImages": ["https://example.com/image.jpg"],
    "keywords": ["test keyword"],
    "tone": "friendly",
    "languageOutput": "en-US",
    "targetMarket": "US"
  }'
```

### Vietnamese Request
```bash
curl -X POST http://localhost:3001/api/product-optimize/optimize \
  -H "Content-Type: application/json" \
  -d '{
    "type": "keyword",
    "productTitle": "Sản phẩm test",
    "productDescription": "Mô tả test",
    "productId": "58",
    "productImages": ["https://example.com/image.jpg"],
    "keywords": ["từ khóa test"],
    "tone": "friendly",
    "languageOutput": "vi",
    "targetMarket": "VN"
  }'
```

## Common Issues

### 1. Wrong Content-Type
❌ **Wrong:**
```http
Content-Type: text/plain
```

✅ **Correct:**
```http
Content-Type: application/json
```

### 2. Missing Required Fields
❌ **Wrong:**
```json
{
  "productTitle": "Test"
}
```

✅ **Correct:**
```json
{
  "type": "keyword",
  "productTitle": "Test",
  "productDescription": "Test Description",
  "productId": "58",
  "productImages": ["https://example.com/image.jpg"],
  "keywords": ["test"],
  "tone": "friendly",
  "languageOutput": "en-US",
  "targetMarket": "US"
}
```

### 3. Wrong Data Types
❌ **Wrong:**
```json
{
  "productImages": "https://example.com/image.jpg",
  "keywords": "test keyword"
}
```

✅ **Correct:**
```json
{
  "productImages": ["https://example.com/image.jpg"],
  "keywords": ["test keyword"]
}
```
