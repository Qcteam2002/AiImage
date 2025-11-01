# 🎨 Complete Image Generation API Documentation

## Overview
Hệ thống Image Generation API bao gồm 2 bước để tạo ra hình ảnh sản phẩm tối ưu:

1. **Step 1**: Phân tích hình ảnh sản phẩm và tạo prompt cho 6 phong cách khác nhau
2. **Step 2**: Sử dụng prompt + hình ảnh gốc để tạo ra hình ảnh mới bằng AI

## ⚠️ QUAN TRỌNG: Cấu hình URL cho Shopify App

**Đảm bảo Shopify app của bạn đang gọi đúng URL!**

### ✅ URLs chính xác:
```
POST https://your-domain.com/api/product-optimize/generate-image
POST https://your-domain.com/api/product-optimize/generate-image-result
```

### ❌ URLs sai:
```
POST https://wrong-domain.com/api/product-optimize/generate-image
POST http://localhost:3001/api/product-optimize/generate-image (chỉ dùng cho dev)
```

### 🔧 Kiểm tra cấu hình:
1. **Verify API base URL** trong Shopify app settings
2. **Ensure tunnel/domain** đang active và accessible
3. **Test URL manually** trước khi integrate
4. **Check Cloudflare tunnel** status nếu dùng Cloudflare

## API Endpoints

### 1. 🧠 Step 1: Generate Image Prompts
```
POST /api/product-optimize/generate-image
```

### 2. 🎨 Step 2: Generate Image Result
```
POST /api/product-optimize/generate-image-result
```

### 3. 🔍 Validate Request (Optional)
```
POST /api/product-optimize/validate-image-request
```

### 4. ⚡ Quick Test (Fallback)
```
POST /api/product-optimize/generate-image-quick
```

---

## Step 1: Generate Image Prompts API

### Purpose
Phân tích hình ảnh sản phẩm và tạo ra 6 prompt cho các phong cách ảnh khác nhau.

### Request Body

#### Required Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `productTitle` | string | ✅ | Tên sản phẩm |
| `productImages` | string[] | ✅ | Mảng chứa một hoặc nhiều URL hình ảnh sản phẩm. Ít nhất phải có một URL |

#### Optional Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `productDescription` | string | ❌ | Mô tả sản phẩm để AI có thêm ngữ cảnh về tính năng và chất liệu |
| `keyFeature` | string | ❌ | Tính năng cốt lõi cần làm nổi bật (ví dụ: "Chống nước IP68", "Chất liệu da thật") |
| `persona` | string | ❌ | Mô tả ngắn về chân dung khách hàng (ví dụ: "Nữ văn phòng tối giản", "Tín đồ thể thao mạo hiểm") |
| `painpoints` | string[] | ❌ | Mảng chứa các "nỗi đau" của khách hàng mà sản phẩm giải quyết |
| `keywords` | string[] | ❌ | Mảng chứa các từ khóa SEO hoặc từ khóa thương hiệu cần tích hợp |
| `tone` | string | ❌ | Tông giọng/phong cách mong muốn (ví dụ: "Sang trọng", "Tối giản", "Năng động") |
| `language` | string | ❌ | Ngôn ngữ cho phần phân tích (ví dụ: 'vi', 'en'). Mặc định là 'en' |
| `market` | string | ❌ | Thị trường mục tiêu (ví dụ: 'us', 'vi') |
| `segmentation` | object | ❌ | Dữ liệu segmentation từ API `/suggestDataSegmentation` |

### Response Format
```json
{
  "success": true,
  "data": {
    "product": "Tên sản phẩm",
    "analysis": "Tóm tắt ngắn về hình và đặc trưng cấu trúc sản phẩm",
    "bestImageUrl": "URL của hình ảnh tốt nhất được chọn từ danh sách",
    "imageSelectionReason": "Lý do tại sao chọn hình này (chi tiết, góc chụp tốt, chất lượng cao, etc.)",
    "styles": {
      "studio": "Prompt chi tiết cho Studio Shot",
      "lifestyle": "Prompt chi tiết cho Lifestyle Shot",
      "infographic": "Prompt chi tiết cho Infographic Style",
      "ugc": "Prompt chi tiết cho UGC (User Generated Content)",
      "closeup": "Prompt chi tiết cho Close-up Shot",
      "motion": "Prompt chi tiết cho Motion/Animated Mock Style"
    },
    "tech_settings": {
      "img2img_strength": 0.3,
      "cfg_scale": 9,
      "lighting": "natural daylight or balanced studio light",
      "style": "photorealistic commercial product photography"
    }
  }
}
```

---

## Best Image Selection Feature

### How It Works
API Step 1 không chỉ tạo prompt mà còn **tự động chọn hình ảnh tốt nhất** từ danh sách để làm hình chuẩn cho việc optimize:

1. **AI Analysis**: GPT-4o-mini phân tích tất cả hình ảnh được gửi
2. **Best Image Selection**: Chọn ra 1 hình tốt nhất dựa trên:
   - Chi tiết nhất (shows most product details)
   - Góc chụp tốt nhất (best angle/composition)
   - Chất lượng cao nhất (highest quality/resolution)
   - Thể hiện đầy đủ tính năng sản phẩm (shows all key features)
3. **Response**: Trả về `bestImageUrl` và `imageSelectionReason`

### Benefits
- **Consistent Quality**: Luôn sử dụng hình tốt nhất cho tất cả styles
- **Better Results**: Hình chất lượng cao → kết quả optimize tốt hơn
- **Automated Selection**: Không cần manual chọn hình
- **Transparency**: Biết lý do tại sao chọn hình đó

### Example Response
```json
{
  "success": true,
  "data": {
    "product": "316 Stainless Steel Thermos Bottle",
    "analysis": "Premium stainless steel thermos bottle with cylindrical design...",
    "bestImageUrl": "https://example.com/product-image-1.jpg",
    "imageSelectionReason": "This image shows the product from the best angle with clear details of the stainless steel finish, lid mechanism, and tea infuser. The lighting highlights the premium quality and the composition is ideal for optimization.",
    "styles": { ... }
  }
}
```

---

## Step 2: Generate Image Result API

### Purpose
Sử dụng prompt từ Step 1 + hình ảnh gốc để tạo ra hình ảnh mới bằng AI.

### Request Body

#### Required Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `prompt` | string | ✅ | Prompt từ Step 1 (từ field `styles.studio`, `styles.lifestyle`, etc.) |
| `originalImageUrl` | string | ✅ | URL hình ảnh sản phẩm gốc |

#### Optional Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `style` | string | ❌ | Phong cách ảnh ('studio', 'lifestyle', 'infographic', 'ugc', 'closeup', 'motion'). Mặc định: 'studio' |
| `techSettings` | object | ❌ | Cài đặt kỹ thuật cho việc tạo ảnh |

### Response Format
```json
{
  "success": true,
  "data": {
    "generatedImage": "URL hoặc base64 của hình ảnh được tạo",
    "style": "studio",
    "originalImageUrl": "URL hình ảnh gốc",
    "prompt": "Prompt đã sử dụng",
    "techSettings": {
      "img2img_strength": 0.3,
      "cfg_scale": 9,
      "lighting": "natural daylight or balanced studio light",
      "style": "photorealistic commercial product photography"
    },
    "timestamp": "2025-01-27T10:30:00.000Z"
  }
}
```

---

## Complete Workflow Example

### Step 1: Generate Prompts
```bash
curl -X POST http://localhost:3001/api/product-optimize/generate-image \
  -H "Content-Type: application/json" \
  -d '{
    "productTitle": "316 Stainless Steel Thermos Bottle",
    "productImages": [
      "https://example.com/product-image-1.jpg",
      "https://example.com/product-image-2.jpg"
    ],
    "productDescription": "Premium thermos bottle with 24-hour temperature retention",
    "keyFeature": "316 Stainless Steel, Leak-Proof",
    "persona": "Outdoor enthusiasts",
    "painpoints": ["Need reliable temperature retention", "Want leak-proof design"],
    "keywords": ["thermos", "stainless steel", "temperature retention"],
    "tone": "Premium",
    "language": "en",
    "market": "us"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "product": "316 Stainless Steel Thermos Bottle",
    "analysis": "Premium stainless steel thermos bottle with cylindrical design, screw-top lid, and detachable tea infuser.",
    "bestImageUrl": "https://example.com/product-image-1.jpg",
    "imageSelectionReason": "This image shows the product from the best angle with clear details of the stainless steel finish, lid mechanism, and tea infuser. The lighting highlights the premium quality and the composition is ideal for optimization.",
    "styles": {
      "studio": "Use the provided image as the exact product reference. Keep the thermos bottle identical — same stainless steel 316 mirror finish, cylindrical body, screw lid, detachable tea infuser, and hand strap. Place the same bottle centered on a white-to-light gray seamless background under soft balanced studio lighting. Emphasize realistic metal highlights and reflections for a premium look. photorealistic, commercial eCommerce ready.",
      "lifestyle": "Use the provided image as the exact product reference. Keep the thermos bottle identical — same 316 stainless-steel body, lid, and proportions. Remove current background and place the same bottle on a wooden camping table beside a mug and a tent in the background, under natural morning sunlight with soft shadows. Add subtle steam coming from a hot drink to convey warmth. photorealistic, cozy outdoor atmosphere, commercial-ready.",
      "infographic": "Use the provided image as the exact product reference. Keep bottle identical in color, shape, and lid design. Center the product on a clean light gray background with soft shadow. Add minimalist infographic text and icons around it: '316 Stainless Steel', 'Hot & Cold 24H', 'Leak-Proof Lid', '4 Sizes: 600ml, 800ml, 1200ml, 1500ml'. Use clean sans-serif typography and subtle line arrows. Maintain photorealistic texture and reflections.",
      "ugc": "Use the provided image as the exact product reference. Keep the thermos unchanged — same 316 steel, lid, and strap. Place it naturally in a user context: held in hand by a person sitting outdoors near a tent, or placed beside a backpack on grass. Lighting from warm afternoon sunlight, slightly imperfect framing like a genuine smartphone photo. Emphasize authenticity, natural tones, and human touch to boost trust.",
      "closeup": "Use the provided image as the exact product reference. Keep same stainless steel texture, cap structure, and details. Zoom closely on the lid and mouth area to show polished metal finish, precise thread lines, and tea filter mesh details. Light source angled to reveal natural reflections and depth. Highlight craftsmanship and durability. photorealistic macro lens look.",
      "motion": "Use the provided image as the exact product reference. Keep the thermos identical — same metallic finish, structure, and lid. Create a 360° rotating animation on a soft reflective white base with smooth transitions and accurate perspective. Maintain consistent lighting and reflections across all frames. photorealistic metal rendering."
    },
    "tech_settings": {
      "img2img_strength": 0.3,
      "cfg_scale": 9,
      "lighting": "natural daylight or balanced studio light",
      "style": "photorealistic commercial product photography"
    }
  }
}
```

### Step 2: Generate Studio Image
```bash
curl -X POST http://localhost:3001/api/product-optimize/generate-image-result \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Use the provided image as the exact product reference. Keep the thermos bottle identical — same stainless steel 316 mirror finish, cylindrical body, screw lid, detachable tea infuser, and hand strap. Place the same bottle centered on a white-to-light gray seamless background under soft balanced studio lighting. Emphasize realistic metal highlights and reflections for a premium look. photorealistic, commercial eCommerce ready.",
    "originalImageUrl": "https://example.com/product-image-1.jpg",
    "style": "studio",
    "techSettings": {
      "img2img_strength": 0.3,
      "cfg_scale": 9,
      "lighting": "natural daylight or balanced studio light",
      "style": "photorealistic commercial product photography"
    }
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "generatedImage": "https://example.com/product-image-1.jpg",
    "style": "studio",
    "originalImageUrl": "https://example.com/product-image-1.jpg",
    "prompt": "Use the provided image as the exact product reference...",
    "techSettings": {
      "img2img_strength": 0.3,
      "cfg_scale": 9,
      "lighting": "natural daylight or balanced studio light",
      "style": "photorealistic commercial product photography"
    },
    "timestamp": "2025-01-27T10:30:00.000Z",
    "note": "AI image generation not supported via OpenRouter, returning original image"
  }
}
```

**Note**: `generatedImage` sẽ trả về `originalImageUrl` vì OpenRouter không support image generation.

### Step 2: Generate Lifestyle Image
```bash
curl -X POST http://localhost:3001/api/product-optimize/generate-image-result \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Use the provided image as the exact product reference. Keep the thermos bottle identical — same 316 stainless-steel body, lid, and proportions. Remove current background and place the same bottle on a wooden camping table beside a mug and a tent in the background, under natural morning sunlight with soft shadows. Add subtle steam coming from a hot drink to convey warmth. photorealistic, cozy outdoor atmosphere, commercial-ready.",
    "originalImageUrl": "https://example.com/product-image-1.jpg",
    "style": "lifestyle"
  }'
```

---

## Complete Workflow Summary

### 🎯 **2-Step Process:**

1. **Step 1: Analysis & Prompt Generation**
   ```
   Input: Multiple product images + product info
   Process: AI analyzes all images → selects best one → creates 6 prompts
   Output: bestImageUrl + 6 prompts + selection reason
   ```

2. **Step 2: Image Generation**
   ```
   Input: bestImageUrl + prompt + style
   Process: AI generates new image using best image as reference
   Output: Generated image URL
   ```

### 🔄 **Typical Usage Pattern:**

```python
# Step 1: Get best image and prompts
response1 = api.generate_prompts(product_data)
best_image = response1['data']['bestImageUrl']
studio_prompt = response1['data']['styles']['studio']

# Step 2: Generate studio image using best image
response2 = api.generate_image(studio_prompt, best_image, 'studio')
generated_image = response2['data']['generatedImage']
```

### 📊 **Output for All 6 Styles:**

```python
# Generate all 6 styles at once
all_images = generator.generate_all_styles(product_data)
# Result: {
#   'studio': 'https://generated-studio.jpg',
#   'lifestyle': 'https://generated-lifestyle.jpg', 
#   'infographic': 'https://generated-infographic.jpg',
#   'ugc': 'https://generated-ugc.jpg',
#   'closeup': 'https://generated-closeup.jpg',
#   'motion': 'https://generated-motion.jpg'
# }
```

---

## Integration Guide for External Systems

### 1. Authentication
- Sử dụng OpenRouter API Key
- Set header: `Authorization: Bearer <OPENROUTER_API_KEY>`

### 2. Error Handling
```json
{
  "error": "Error message",
  "message": "Detailed error description"
}
```

### Common Error Codes:
- `400`: Bad Request (missing required fields, invalid style)
- `500`: Internal Server Error (AI API failure, JSON parsing error)

### 3. Rate Limiting
- API có rate limiting: 100 requests per 15 minutes
- Health check endpoint không bị rate limit

### 4. Timeout
- Step 1: 120 seconds
- Step 2: 120 seconds

### 5. Complete Integration Example (Python)

```python
import requests
import json

class ProductImageGenerator:
    def __init__(self, base_url, api_key):
        self.base_url = base_url
        self.headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {api_key}'
        }
    
    def generate_prompts(self, product_data):
        """Step 1: Generate image prompts"""
        url = f"{self.base_url}/api/product-optimize/generate-image"
        response = requests.post(url, headers=self.headers, json=product_data)
        return response.json()
    
    def generate_image(self, prompt, original_image_url, style='studio'):
        """Step 2: Generate image result"""
        url = f"{self.base_url}/api/product-optimize/generate-image-result"
        data = {
            'prompt': prompt,
            'originalImageUrl': original_image_url,
            'style': style
        }
        response = requests.post(url, headers=self.headers, json=data)
        return response.json()
    
    def generate_all_styles(self, product_data):
        """Generate all 6 styles for a product"""
        # Step 1: Get prompts and best image
        prompts_response = self.generate_prompts(product_data)
        if not prompts_response.get('success'):
            return {'error': 'Failed to generate prompts'}
        
        styles = prompts_response['data']['styles']
        best_image_url = prompts_response['data']['bestImageUrl']
        image_selection_reason = prompts_response['data']['imageSelectionReason']
        
        print(f"Selected best image: {best_image_url}")
        print(f"Selection reason: {image_selection_reason}")
        
        # Step 2: Generate images for each style using the best image
        results = {}
        for style_name, prompt in styles.items():
            try:
                image_response = self.generate_image(prompt, best_image_url, style_name)
                if image_response.get('success'):
                    results[style_name] = image_response['data']['generatedImage']
                else:
                    results[style_name] = {'error': image_response.get('error')}
            except Exception as e:
                results[style_name] = {'error': str(e)}
        
        return results

# Usage
generator = ProductImageGenerator(
    base_url="http://localhost:3001",
    api_key="your_openrouter_api_key"
)

product_data = {
    "productTitle": "316 Stainless Steel Thermos Bottle",
    "productImages": ["https://example.com/product-image.jpg"],
    "productDescription": "Premium thermos bottle with 24-hour temperature retention",
    "keyFeature": "316 Stainless Steel, Leak-Proof",
    "persona": "Outdoor enthusiasts",
    "tone": "Premium",
    "market": "us"
}

# Generate all styles
all_images = generator.generate_all_styles(product_data)
print(json.dumps(all_images, indent=2))
```

### 6. Complete Integration Example (JavaScript/Node.js)

```javascript
class ProductImageGenerator {
    constructor(baseUrl, apiKey) {
        this.baseUrl = baseUrl;
        this.headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        };
    }
    
    async generatePrompts(productData) {
        const response = await fetch(`${this.baseUrl}/api/product-optimize/generate-image`, {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify(productData)
        });
        return await response.json();
    }
    
    async generateImage(prompt, originalImageUrl, style = 'studio') {
        const response = await fetch(`${this.baseUrl}/api/product-optimize/generate-image-result`, {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify({
                prompt,
                originalImageUrl,
                style
            })
        });
        return await response.json();
    }
    
    async generateAllStyles(productData) {
        try {
            // Step 1: Get prompts and best image
            const promptsResponse = await this.generatePrompts(productData);
            if (!promptsResponse.success) {
                throw new Error('Failed to generate prompts');
            }
            
            const styles = promptsResponse.data.styles;
            const bestImageUrl = promptsResponse.data.bestImageUrl;
            const imageSelectionReason = promptsResponse.data.imageSelectionReason;
            
            console.log(`Selected best image: ${bestImageUrl}`);
            console.log(`Selection reason: ${imageSelectionReason}`);
            
            // Step 2: Generate images for each style using the best image
            const results = {};
            for (const [styleName, prompt] of Object.entries(styles)) {
                try {
                    const imageResponse = await this.generateImage(prompt, bestImageUrl, styleName);
                    if (imageResponse.success) {
                        results[styleName] = imageResponse.data.generatedImage;
                    } else {
                        results[styleName] = { error: imageResponse.error };
                    }
                } catch (error) {
                    results[styleName] = { error: error.message };
                }
            }
            
            return results;
        } catch (error) {
            return { error: error.message };
        }
    }
}

// Usage
const generator = new ProductImageGenerator(
    'http://localhost:3001',
    'your_openrouter_api_key'
);

const productData = {
    productTitle: "316 Stainless Steel Thermos Bottle",
    productImages: ["https://example.com/product-image.jpg"],
    productDescription: "Premium thermos bottle with 24-hour temperature retention",
    keyFeature: "316 Stainless Steel, Leak-Proof",
    persona: "Outdoor enthusiasts",
    tone: "Premium",
    market: "us"
};

// Generate all styles
generator.generateAllStyles(productData)
    .then(results => console.log(JSON.stringify(results, null, 2)))
    .catch(error => console.error('Error:', error));
```

---

## Technical Specifications

### AI Models Used
- **Step 1**: `openai/gpt-4o-mini` (phân tích hình ảnh và tạo prompt)
- **Step 2**: `google/gemini-2.5-flash-image-preview` (tạo hình ảnh mới) - **Fallback**: Trả về original image

### ⚠️ Important: Image Generation Limitation
**OpenRouter có thể không support image generation** với Gemini model cho product images. API sẽ:
1. Gọi AI để tạo prompt
2. **Fallback**: Trả về original image URL thay vì generated image
3. Include `note` field để explain fallback behavior

**Note**: VirtualTryOnPage sử dụng cùng model nhưng có thể hoạt động vì prompt khác nhau.

### 6 Photo Styles Explained

1. **🏙 Studio Shot**
   - Background trắng/xám seamless
   - Ánh sáng studio cân bằng
   - Cho trang sản phẩm chính, catalog

2. **🏠 Lifestyle Shot**
   - Background tự nhiên, props phù hợp
   - Ánh sáng tự nhiên
   - Cho quảng cáo, social media

3. **📊 Infographic Style**
   - Text và icons xung quanh sản phẩm
   - Typography sạch sẽ
   - Cho landing page, brochure

4. **📸 UGC (User Generated Content)**
   - Framing không hoàn hảo
   - Ánh sáng tự nhiên, authentic
   - Cho social proof, reviews

5. **🔍 Close-up Shot**
   - Macro lens, chi tiết chất liệu
   - Ánh sáng góc cạnh
   - Cho highlight chất lượng

6. **🎞 Motion / Animated Mock Style**
   - 360° rotating animation
   - Smooth transitions
   - Cho video ads, interactive content

### Prompt Rules
Mỗi prompt tuân theo quy tắc "lock sản phẩm":
- Giữ nguyên thiết kế sản phẩm
- Chỉ thay đổi background và lighting
- Không repaint, không recreate
- Preserve pixel-identical design

### Performance Considerations
- **Timeout**: 120 seconds per request
- **Rate Limit**: 100 requests per 15 minutes
- **Image Size**: Tối ưu cho commercial use
- **Fallback**: Có fallback response khi AI fail

---

## Use Cases

1. **E-commerce Platforms**: Tạo ảnh sản phẩm cho trang web
2. **Marketing Agencies**: Tạo ảnh quảng cáo cho các kênh khác nhau
3. **Social Media Management**: Tạo content cho Instagram, Facebook, TikTok
4. **Product Photography**: Hỗ trợ photographer tạo brief
5. **AI Image Generation**: Sử dụng prompt để tạo ảnh bằng Stable Diffusion, Midjourney, etc.

---

## 🔧 Troubleshooting cho Shopify App

### ❌ Lỗi thường gặp:

#### 1. **524 Timeout Error**
```
Error 524: A timeout occurred
```
**Nguyên nhân**: Cloudflare timeout (100 giây)
**Giải pháp**:
- Giảm kích thước request (productDescription ngắn hơn)
- Sử dụng Quick API: `/generate-image-quick`
- Chỉ gửi 1-2 hình ảnh thay vì nhiều

#### 2. **400 Bad Request**
```
Request failed with status code 400
```
**Nguyên nhân**: Request format sai hoặc quá lớn
**Giải pháp**:
- Validate request: `/validate-image-request`
- Check image URLs có accessible không
- Reduce request size dưới 50KB

#### 3. **Connection Error**
```
Failed to connect to server
```
**Nguyên nhân**: URL sai hoặc server down
**Giải pháp**:
- Check API base URL trong Shopify app
- Verify tunnel/domain đang active
- Test URL manually trước

### ✅ Debug Steps:

1. **Check URL Configuration**:
   ```javascript
   // ✅ Correct
   const API_URL = 'https://your-domain.com/api/product-optimize/generate-image';
   
   // ❌ Wrong  
   const API_URL = 'https://wrong-domain.com/api/product-optimize/generate-image';
   ```

2. **Validate Request First**:
   ```javascript
   // Validate trước khi gọi AI
   const validation = await fetch('/api/product-optimize/validate-image-request', {
     method: 'POST',
     body: JSON.stringify(requestData)
   });
   
   if (!validation.ok) {
     console.error('Request validation failed');
     return;
   }
   ```

3. **Use Fallback API**:
   ```javascript
   // Fallback khi AI fail
   try {
     const result = await fetch('/api/product-optimize/generate-image', {
       method: 'POST',
       body: JSON.stringify(requestData)
     });
   } catch (error) {
     // Use quick API as fallback
     const fallback = await fetch('/api/product-optimize/generate-image-quick', {
       method: 'POST', 
       body: JSON.stringify(requestData)
     });
   }
   ```

4. **Optimize Request Size**:
   ```javascript
   // Giảm kích thước request
   const optimizedRequest = {
     productTitle: requestData.productTitle.substring(0, 100),
     productImages: requestData.productImages.slice(0, 2), // Chỉ 2 hình
     productDescription: requestData.productDescription.substring(0, 500), // Giới hạn
     // Bỏ các field không cần thiết
   };
   ```

### 📊 Monitoring:

- **Console Logs**: Check server logs để debug
- **Request Size**: Monitor request size < 50KB
- **Response Time**: AI API thường mất 15-30 giây
- **Error Rate**: Track error rate và adjust

---

## Support & Maintenance

- **API Version**: v1.0
- **Last Updated**: 2025-01-27
- **Compatibility**: OpenRouter API compatible
- **Documentation**: This file + inline code comments
- **Error Logging**: Comprehensive logging for debugging
