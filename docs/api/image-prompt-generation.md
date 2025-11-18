# 🎨 Image Prompt Generation API

API tích hợp để tạo prompt cho hình ảnh sản phẩm dựa trên URL hình, title, description và style đã chọn.

## 📋 Tổng quan

API này cho phép hệ thống bên ngoài tạo prompt tối ưu cho việc generate hình ảnh sản phẩm theo nhiều style khác nhau. API sẽ phân tích hình ảnh sản phẩm, hiểu rõ đặc điểm sản phẩm, và tạo ra một prompt chi tiết phù hợp với style được yêu cầu.

**Endpoint:** `POST /api/product-optimize/generate-image-prompt`

## 🔗 Base URL

- **Development:** `http://localhost:3001`
- **Production:** `https://your-domain.com` (cần cấu hình)

## 📥 Request

### Headers

```http
Content-Type: application/json
```

### Body Parameters

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| `productImages` | `string[]` | ✅ Yes | Mảng các URL hình ảnh sản phẩm (ít nhất 1 hình) |
| `productTitle` | `string` | ✅ Yes | Tiêu đề sản phẩm |
| `productDescription` | `string` | ⚠️ Optional | Mô tả chi tiết sản phẩm |
| `requestedStyle` | `string` | ⚠️ Optional | Style được chọn (mặc định: `studio`) |

### Available Styles

| Style | Key | Mô tả | Nền tảng phù hợp |
|-------|-----|-------|-----------------|
| **Studio Shot** | `studio` | Nền trắng/ xám nhạt, ánh sáng studio đồng đều, góc chụp 3/4 | Website, Amazon, Shopify |
| **Lifestyle** | `lifestyle` | Đặt sản phẩm trong môi trường thực tế, ánh sáng tự nhiên ấm áp | Meta Ads, Pinterest, Brand website |
| **Infographic** | `infographic` | Nền sáng trung tính, bố cục giáo dục với icons và labels | Landing pages, Amazon listings |
| **UGC Social Proof** | `ugc_social_proof` | Phong cách smartphone thật, có tay/người, cảm giác authentic | TikTok, Instagram Stories, Reels |
| **Meta Ugly Ad** | `meta_ugly_ad` | Ảnh chụp nhanh không hoàn hảo, có text overlay chữ viết tay, cảm giác khẩn cấp | Facebook, Instagram Feed |
| **Luxury Editorial** | `luxury_editorial` | Setting cao cấp tối giản (marble, glass), ánh sáng mềm mại | Instagram Feed, Luxury brand sites |
| **E-commerce Sale Banner** | `ecommerce_sale_banner` | Layout hero nổi bật, typography đậm cho sale, màu sắc vibrante | Website hero, Google Ads, Paid banners |
| **Futuristic Product Hero** | `futuristic_product_hero` | Hiệu ứng neon glow, energy arcs, mood sci-fi cinematic | Website hero, Google Ads, Paid banners |

### Request Example

```json
{
  "productImages": [
    "https://example.com/product-image-1.jpg",
    "https://example.com/product-image-2.jpg"
  ],
  "productTitle": "Premium Leather Travel Backpack",
  "productDescription": "A high-quality leather backpack designed for modern travelers. Features multiple compartments, water-resistant material, and ergonomic design.",
  "requestedStyle": "lifestyle"
}
```

### cURL Example

```bash
curl -X POST http://localhost:3001/api/product-optimize/generate-image-prompt \
  -H "Content-Type: application/json" \
  -d '{
    "productImages": [
      "https://example.com/product-image-1.jpg",
      "https://example.com/product-image-2.jpg"
    ],
    "productTitle": "Premium Leather Travel Backpack",
    "productDescription": "A high-quality leather backpack designed for modern travelers.",
    "requestedStyle": "lifestyle"
  }'
```

### JavaScript/Fetch Example

```javascript
const response = await fetch('http://localhost:3001/api/product-optimize/generate-image-prompt', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    productImages: [
      'https://example.com/product-image-1.jpg',
      'https://example.com/product-image-2.jpg'
    ],
    productTitle: 'Premium Leather Travel Backpack',
    productDescription: 'A high-quality leather backpack designed for modern travelers.',
    requestedStyle: 'lifestyle'
  })
});

const data = await response.json();
console.log(data);
```

### Python Example

```python
import requests

url = "http://localhost:3001/api/product-optimize/generate-image-prompt"

payload = {
    "productImages": [
        "https://example.com/product-image-1.jpg",
        "https://example.com/product-image-2.jpg"
    ],
    "productTitle": "Premium Leather Travel Backpack",
    "productDescription": "A high-quality leather backpack designed for modern travelers.",
    "requestedStyle": "lifestyle"
}

response = requests.post(url, json=payload)
data = response.json()
print(data)
```

## 📤 Response

### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "product": "Premium Leather Travel Backpack",
    "analysis": "A premium leather backpack with multiple compartments, visible stitching details, and ergonomic shoulder straps. The material appears to be genuine leather with a rich brown finish.",
    "bestImageUrl": "https://example.com/product-image-1.jpg",
    "imageSelectionReason": "Selected because it provides a clear 3/4 view showing both the front design and side compartments, with excellent lighting that reveals the leather texture and stitching details.",
    "requestedStyle": "lifestyle",
    "prompt": "A photorealistic image of a premium brown leather travel backpack with multiple compartments and ergonomic shoulder straps, placed naturally on a rustic wooden desk next to a laptop and a notebook, creating a focused work-from-home lifestyle scene for a busy professional. The lighting is soft morning daylight coming from a window on the side, creating warm tones and subtle shadows. The backpack sits naturally with the zipper partially open to show interior organization. Include minimal curated props like a coffee mug, plant, or travel passport to tell a usage story while keeping the product as the clear focal point. Photorealistic, commercial product photography, high detail, high conversion intent.",
    "aspectRatio": "1:1",
    "platform": "Meta Ads, Pinterest, brand website"
  }
}
```

### Response Fields

| Field | Type | Mô tả |
|-------|------|-------|
| `success` | `boolean` | Trạng thái thành công |
| `data.product` | `string` | Tên sản phẩm |
| `data.analysis` | `string` | Phân tích sản phẩm từ hình ảnh |
| `data.bestImageUrl` | `string` | URL hình ảnh tốt nhất được chọn làm reference |
| `data.imageSelectionReason` | `string` | Lý do chọn hình ảnh đó |
| `data.requestedStyle` | `string` | Style đã được yêu cầu |
| `data.prompt` | `string` | Prompt chi tiết để generate hình ảnh |
| `data.aspectRatio` | `string` | Tỷ lệ khung hình phù hợp (1:1, 16:9, 9:16, 4:5) |
| `data.platform` | `string` | Nền tảng phù hợp để sử dụng style này |

## ❌ Error Responses

### 400 Bad Request - Missing Required Fields

```json
{
  "error": "Missing required fields: productTitle and productImages (at least one image URL)"
}
```

### 500 Internal Server Error

```json
{
  "error": "Failed to generate image prompt",
  "message": "Error message details",
  "details": "Additional error details if available"
}
```

## 🔍 Validation Rules

1. **productTitle**: Phải là string không rỗng
2. **productImages**: Phải là array có ít nhất 1 phần tử, mỗi phần tử phải là URL hợp lệ (http/https)
3. **productDescription**: Optional, có thể bỏ qua
4. **requestedStyle**: Nếu không cung cấp, mặc định là `studio`. Nếu cung cấp style không hợp lệ, sẽ fallback về `studio`

## 💡 Usage Tips

### 1. Chọn Style Phù Hợp

- **Studio**: Cho catalog, website chính thức
- **Lifestyle**: Cho quảng cáo social media, brand storytelling
- **UGC**: Cho social proof, influencer marketing
- **Meta Ugly Ad**: Cho direct-response ads, urgency campaigns
- **Luxury Editorial**: Cho thương hiệu cao cấp
- **E-commerce Sale Banner**: Cho sale campaigns, promotion
- **Futuristic Product Hero**: Cho tech products, innovation focus
- **Infographic**: Cho educational content, feature highlights

### 2. Image Requirements

- Cung cấp nhiều hình ảnh từ nhiều góc độ khác nhau
- Hình ảnh rõ nét, độ phân giải cao
- Hình ảnh nên có nền đơn giản để AI dễ phân tích
- URL hình ảnh phải public accessible (không yêu cầu authentication)

### 3. Description Quality

- Mô tả càng chi tiết, prompt càng chính xác
- Bao gồm: materials, colors, features, dimensions nếu có
- Mô tả nên tập trung vào đặc điểm trực quan của sản phẩm

### 4. Processing Time

- API thường mất **30-60 giây** để xử lý
- Phụ thuộc vào số lượng hình ảnh và độ phức tạp
- Nên implement timeout ít nhất 90 giây

## 🔄 Workflow Integration

### Step-by-Step Integration

```javascript
async function generateImagePrompt(productData) {
  try {
    // 1. Prepare request
    const requestBody = {
      productImages: productData.images,
      productTitle: productData.title,
      productDescription: productData.description,
      requestedStyle: productData.style || 'studio'
    };

    // 2. Call API
    const response = await fetch(
      'http://localhost:3001/api/product-optimize/generate-image-prompt',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        // Set timeout for long-running requests
        signal: AbortSignal.timeout(90000) // 90 seconds
      }
    );

    // 3. Handle response
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to generate prompt');
    }

    const result = await response.json();
    
    // 4. Use the generated prompt
    if (result.success) {
      return {
        prompt: result.data.prompt,
        aspectRatio: result.data.aspectRatio,
        platform: result.data.platform,
        bestImageUrl: result.data.bestImageUrl
      };
    }

    throw new Error('Unexpected response format');
    
  } catch (error) {
    console.error('Error generating image prompt:', error);
    throw error;
  }
}

// Usage
const promptData = await generateImagePrompt({
  images: ['https://example.com/product.jpg'],
  title: 'My Product',
  description: 'Product description',
  style: 'lifestyle'
});

// Use promptData.prompt with your image generation service
```

## 📊 Rate Limiting

- API hiện tại không có rate limiting cứng
- Khuyến nghị: Không gọi quá 10 requests/phút
- Nếu cần volume cao, liên hệ để thiết lập rate limiting phù hợp

## 🔐 Authentication

Hiện tại API không yêu cầu authentication. Nếu cần bảo mật, có thể thêm:
- API Key trong header
- JWT token authentication
- OAuth 2.0

## 🧪 Testing

### Test với các style khác nhau

```javascript
const styles = ['studio', 'lifestyle', 'ugc_social_proof', 'meta_ugly_ad'];

for (const style of styles) {
  const response = await fetch('http://localhost:3001/api/product-optimize/generate-image-prompt', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      productImages: ['https://example.com/product.jpg'],
      productTitle: 'Test Product',
      requestedStyle: style
    })
  });
  
  const data = await response.json();
  console.log(`Style: ${style}`, data.data.prompt.substring(0, 100));
}
```

## 🐛 Troubleshooting

### Lỗi: "Missing required fields"
- Kiểm tra `productTitle` và `productImages` đã được gửi
- Đảm bảo `productImages` là array và có ít nhất 1 phần tử

### Lỗi: "Invalid image URLs"
- Kiểm tra URL hình ảnh phải bắt đầu bằng `http://` hoặc `https://`
- Đảm bảo URL có thể truy cập được (public)

### Lỗi: Timeout
- Tăng timeout lên 90-120 giây
- Kiểm tra kích thước hình ảnh (quá lớn có thể chậm)

### Lỗi: "Failed to generate image prompt"
- Kiểm tra OpenRouter API key đã được cấu hình
- Kiểm tra log server để xem chi tiết lỗi
- Thử lại với ít hình ảnh hơn

## 📚 Related Documentation

- [Complete API Reference](./complete-api.md)
- [Image Generation APIs](./image-generation-complete.md)
- [Product Optimize API](./product-optimize.md)

## 🔄 Version History

- **v1.0.0** (2025-01-XX): Initial release
  - Support 8 image styles
  - AI-powered product analysis
  - Automatic best image selection

## 📞 Support

Nếu gặp vấn đề hoặc cần hỗ trợ:
1. Kiểm tra documentation này
2. Xem log server để debug
3. Liên hệ team phát triển

---

**Last Updated:** 2025-01-XX





