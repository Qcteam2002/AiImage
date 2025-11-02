# 🖼️ Alt Text Generation API Documentation

## Overview

API này sử dụng AI model `x-ai/grok-4-fast` để phân tích hình ảnh sản phẩm trực tiếp và tạo alt text chính xác dựa trên nội dung thực tế của từng ảnh. Alt text được tối ưu cho SEO và AI recognition.

**Version:** 1.0.0  
**Base URL:** `https://api.tikminer.info` hoặc `http://your-server:3001`  
**Endpoint:** `/api/product-optimize/generate-alt-text`

---

## 🔐 Authentication

Hiện tại API chưa yêu cầu authentication. Trong production, bạn nên thêm API key hoặc JWT token.

**Khuyến nghị header:**
```http
Content-Type: application/json
```

---

## 📋 API Endpoint

### Generate Alt Text for Product Images

Tạo alt text cho các hình ảnh sản phẩm dựa trên phân tích AI trực tiếp từ hình ảnh.

**Endpoint:** `POST /api/product-optimize/generate-alt-text`

---

## 📥 Request

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `productTitle` | string | ✅ | Tên sản phẩm |
| `images` | array | ✅ | Mảng chứa các object hình ảnh với `id` và `url` |
| `selectedSegment` | object | ⚠️ | Thông tin về phân khúc khách hàng (recommended) |
| `targetMarket` | string | ❌ | Thị trường mục tiêu (default: `"vi"`). Hỗ trợ nhiều market codes: `"vi"`, `"us"`, `"id"`, `"th"`, `"my"`, `"ph"`, `"sg"`, `"jp"`, `"kr"`, `"au"`, `"gb"`, `"ca"`, `"de"`, `"fr"`, `"es"`, `"it"`, etc. |
| `tone` | string | ❌ | Tông giọng cho alt text (default: `"friendly"`) |
| `language` | string | ❌ | Ngôn ngữ output (default: `"vi-VN"`). Hỗ trợ nhiều format: `"vi-VN"`, `"vi"`, `"en-US"`, `"en"`, `"id-ID"`, `"th-TH"`, `"fr-FR"`, `"de-DE"`, `"es-ES"`, `"ja-JP"`, `"ko-KR"`, `"zh-CN"`, etc. |

#### Images Array Structure

Mỗi item trong array `images` phải có cấu trúc:

```json
{
  "id": "string (required)",      // Image ID (e.g., Shopify ProductImage ID)
  "url": "string (optional)",      // URL hình ảnh để AI phân tích
  "src": "string (optional)",      // Alternative field cho URL
  "imageUrl": "string (optional)"  // Alternative field cho URL
}
```

**Lưu ý:** Nếu không có `url`, AI sẽ tạo alt text dựa trên metadata sản phẩm thay vì phân tích hình ảnh trực tiếp.

#### SelectedSegment Object Structure

```json
{
  "name": "string",                              // Tên phân khúc (e.g., "Urban Career Woman")
  "keywordSuggestions": ["string", "string"]     // Mảng từ khóa gợi ý
}
```

### Request Example

#### English Output (language: "en")

```json
{
  "productTitle": "Elegant Freshwater Pearl Shell Earrings for Professional Women",
  "images": [
    {
      "id": "gid://shopify/ProductImage/41582085079196",
      "url": "https://cdn.shopify.com/s/files/1/0679/2540/9948/files/image1.webp?v=1743750957"
    },
    {
      "id": "gid://shopify/ProductImage/41582085111964",
      "url": "https://cdn.shopify.com/s/files/1/0679/2540/9948/files/image2.webp?v=1743750957"
    },
    {
      "id": "gid://shopify/ProductImage/41582085144732",
      "url": "https://cdn.shopify.com/s/files/1/0679/2540/9948/files/image3.webp?v=1743750957"
    }
  ],
  "selectedSegment": {
    "name": "Urban Career Woman",
    "keywordSuggestions": [
      "elegant freshwater pearl earrings",
      "lightweight shell earrings for work",
      "professional pearl jewelry"
    ]
  },
  "targetMarket": "us",
  "tone": "friendly",
  "language": "en-US"
}
```

#### Vietnamese Output (language: "vi-VN")

```json
{
  "productTitle": "Khuyên Tai Ngọc Trai Vỏ Sò Sang Trọng Nhẹ Nhàng Cho Công Việc",
  "images": [
    {
      "id": "gid://shopify/ProductImage/41582085079196",
      "url": "https://cdn.shopify.com/s/files/1/0679/2540/9948/files/image1.webp?v=1743750957"
    },
    {
      "id": "gid://shopify/ProductImage/41582085111964",
      "url": "https://cdn.shopify.com/s/files/1/0679/2540/9948/files/image2.webp?v=1743750957"
    },
    {
      "id": "gid://shopify/ProductImage/41582085144732",
      "url": "https://cdn.shopify.com/s/files/1/0679/2540/9948/files/image3.webp?v=1743750957"
    }
  ],
  "selectedSegment": {
    "name": "Urban Career Woman",
    "keywordSuggestions": [
      "elegant freshwater pearl earrings",
      "lightweight shell earrings for work",
      "professional pearl jewelry"
    ]
  },
    "targetMarket": "vi",
    "tone": "friendly",
    "language": "vi-VN"
}
```

### cURL Example

```bash
curl -X POST https://api.tikminer.info/api/product-optimize/generate-alt-text \
  -H "Content-Type: application/json" \
  -d '{
    "productTitle": "Elegant Freshwater Pearl Shell Earrings",
    "images": [
      {
        "id": "gid://shopify/ProductImage/41582085079196",
        "url": "https://cdn.shopify.com/s/files/1/0679/2540/9948/files/image1.webp?v=1743750957"
      }
    ],
    "selectedSegment": {
      "name": "Urban Career Woman",
      "keywordSuggestions": ["elegant freshwater pearl earrings", "professional pearl jewelry"]
    },
    "targetMarket": "us",
    "tone": "friendly",
    "language": "en-US"
  }'
```

---

## 📤 Response

### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "productTitle": "Elegant Freshwater Pearl Shell Earrings for Professional Women",
    "images": [
      {
        "imageId": "gid://shopify/ProductImage/41582085079196",
        "altText": "Elegant freshwater pearl earrings with lightweight shell design on white studio background, perfect for professional daily wear.",
        "imageUrl": "https://cdn.shopify.com/s/files/1/0679/2540/9948/files/image1.webp?v=1743750957"
      },
      {
        "imageId": "gid://shopify/ProductImage/41582085111964",
        "altText": "Close-up detail of sophisticated freshwater pearl and iridescent shell details in business casual earrings.",
        "imageUrl": "https://cdn.shopify.com/s/files/1/0679/2540/9948/files/image2.webp?v=1743750957"
      },
      {
        "imageId": "gid://shopify/ProductImage/41582085144732",
        "altText": "Urban career woman wearing lightweight shell earrings for work, adding subtle elegance to office attire.",
        "imageUrl": "https://cdn.shopify.com/s/files/1/0679/2540/9948/files/image3.webp?v=1743750957"
      }
    ],
    "count": 3
  }
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Trạng thái thành công |
| `data.productTitle` | string | Tên sản phẩm |
| `data.images` | array | Mảng kết quả alt text cho từng hình ảnh |
| `data.images[].imageId` | string | ID hình ảnh (giữ nguyên từ request) |
| `data.images[].altText` | string | Alt text được tạo bởi AI |
| `data.images[].imageUrl` | string | URL hình ảnh (nếu có) |
| `data.count` | number | Số lượng alt text đã tạo |

### Error Responses

#### 400 Bad Request

```json
{
  "error": "productTitle is required"
}
```

hoặc

```json
{
  "error": "images array is required and must not be empty"
}
```

#### 500 Internal Server Error

```json
{
  "success": false,
  "error": "Failed to generate alt text",
  "message": "OpenRouter API error: [error details]"
}
```

---

## 🔧 Parameters Details

### targetMarket

Thị trường mục tiêu cho sản phẩm. Ảnh hưởng đến cách AI tạo alt text phù hợp với thị trường đó.

**Supported Market Codes:**
- `"vi"` (default) - Vietnam
- `"us"` - United States
- `"id"` - Indonesia
- `"th"` - Thailand
- `"my"` - Malaysia
- `"ph"` - Philippines
- `"sg"` - Singapore
- `"jp"` - Japan
- `"kr"` - South Korea
- `"au"` - Australia
- `"gb"` - United Kingdom
- `"ca"` - Canada
- `"de"` - Germany
- `"fr"` - France
- `"es"` - Spain
- `"it"` - Italy
- `"nl"` - Netherlands
- `"mx"` - Mexico
- `"br"` - Brazil
- `"in"` - India
- `"cn"` - China
- Và nhiều market codes khác...

**Example:**
```json
{
  "targetMarket": "us"
}
```

### language

Ngôn ngữ output cho alt text. Quan trọng để tạo alt text đúng ngôn ngữ.

**Supported Language Formats:**

**ISO 639-1 với country code (khuyến nghị):**
- `"vi-VN"` (default) - Tiếng Việt
- `"en-US"` - English (US)
- `"en-GB"` - English (UK)
- `"id-ID"` - Bahasa Indonesia
- `"th-TH"` - ภาษาไทย
- `"ms-MY"` - Bahasa Melayu
- `"fr-FR"` - Français
- `"de-DE"` - Deutsch
- `"es-ES"` - Español
- `"it-IT"` - Italiano
- `"pt-BR"` - Português (Brasil)
- `"ja-JP"` - 日本語
- `"ko-KR"` - 한국어
- `"zh-CN"` - 中文 (简体)
- `"zh-TW"` - 中文 (繁體)
- `"ar-SA"` - العربية
- `"hi-IN"` - हिन्दी
- Và nhiều ngôn ngữ khác...

**ISO 639-1 short codes (cũng được hỗ trợ):**
- `"vi"` - Tiếng Việt
- `"en"` - English
- `"id"` - Bahasa Indonesia
- `"th"` - ภาษาไทย
- `"fr"` - Français
- `"de"` - Deutsch
- `"es"` - Español
- `"ja"` - 日本語
- `"ko"` - 한국어
- `"zh"` - 中文
- Và nhiều ngôn ngữ khác...

**Example:**
```json
{
  "language": "vi-VN"
}
```

hoặc

```json
{
  "language": "en-US"
}
```

### tone

Tông giọng cho alt text. Ảnh hưởng đến phong cách viết.

**Values:**
- `"friendly"` (default)
- `"professional"`
- `"luxury"`
- Hoặc các giá trị khác

**Example:**
```json
{
  "tone": "friendly"
}
```

---

## 💡 Features

### ✅ AI Image Analysis

API sử dụng AI model `x-ai/grok-4-fast` với vision capability để:
- Phân tích trực tiếp từng hình ảnh
- Nhận diện góc chụp (studio, close-up, lifestyle, model wearing, etc.)
- Mô tả chi tiết: màu sắc, chi tiết sản phẩm, bối cảnh, người mẫu (nếu có)
- Tạo alt text chính xác dựa trên nội dung thực tế của ảnh

### ✅ SEO Optimization

Alt text được tối ưu cho:
- Google Images search
- AI recognition systems
- Accessibility (screen readers)
- Natural keyword integration

### ✅ Fallback Mechanism

Nếu image URLs không hợp lệ hoặc API không thể phân tích hình ảnh:
- Tự động fallback về text-only generation
- Vẫn tạo alt text dựa trên metadata (productTitle, keywords, etc.)
- Đảm bảo API luôn trả về kết quả

---

## 📝 Best Practices

### 1. Image URLs

**✅ DO:**
- Cung cấp URLs hợp lệ, có thể truy cập công khai
- Sử dụng URLs từ CDN hoặc hosting ổn định
- Đảm bảo hình ảnh có độ phân giải tốt

**❌ DON'T:**
- Gửi URLs không tồn tại
- Sử dụng URLs yêu cầu authentication
- Gửi base64 data URLs (API hỗ trợ nhưng không khuyến nghị)

### 2. Product Title

- Mô tả rõ ràng và chính xác sản phẩm
- Bao gồm từ khóa quan trọng
- Giữ độ dài hợp lý (50-100 ký tự)

### 3. Keywords

- Cung cấp 3-5 từ khóa chính trong `keywordSuggestions`
- Từ khóa nên phù hợp với sản phẩm và thị trường
- Tránh từ khóa quá chung chung

### 4. Language Selection

- Chọn `language` phù hợp với thị trường:
  - `"vi-VN"` hoặc `"vi"` cho thị trường Việt Nam
  - `"en-US"` hoặc `"en"` cho thị trường Mỹ
  - `"en-GB"` cho thị trường Anh
  - `"id-ID"` cho thị trường Indonesia
  - `"th-TH"` cho thị trường Thái Lan
  - Và nhiều ngôn ngữ khác tùy theo targetMarket
- Khuyến nghị dùng format `"xx-XX"` (ví dụ: `"vi-VN"`) thay vì chỉ `"xx"` để chính xác hơn

---

## 🧪 Testing Examples

### Test with Real Shopify Image

```javascript
const response = await fetch('https://api.tikminer.info/api/product-optimize/generate-alt-text', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    productTitle: "Khuyên Tai Ngọc Trai Vỏ Sò Sang Trọng Nhẹ Nhàng Cho Công Việc",
    images: [
      {
        id: "gid://shopify/ProductImage/41582085079196",
        url: "https://cdn.shopify.com/s/files/1/0679/2540/9948/files/image.webp?v=1743750957"
      }
    ],
    selectedSegment: {
      name: "Urban Career Woman",
      keywordSuggestions: [
        "elegant freshwater pearl earrings",
        "lightweight shell earrings for work"
      ]
    },
    targetMarket: "vi",
    tone: "friendly",
    language: "vi-VN"
  })
});

const data = await response.json();
console.log(data.data.images[0].altText);
```

### Test without Image URLs (Fallback)

```javascript
const response = await fetch('https://api.tikminer.info/api/product-optimize/generate-alt-text', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    productTitle: "Professional Pearl Earrings",
    images: [
      { id: "image-1" },
      { id: "image-2" }
    ],
    targetMarket: "us",
    language: "en-US"
  })
});
```

---

## ⚠️ Rate Limits & Performance

- **Timeout:** 120 giây (2 phút) khi có hình ảnh, 60 giây khi chỉ text-only
- **Max Images:** Không giới hạn, nhưng khuyến nghị tối đa 10-15 ảnh mỗi request
- **Rate Limits:** Phụ thuộc vào OpenRouter API limits

---

## 🔄 Change Log

### Version 1.0.0 (2025-01-XX)
- ✅ Initial release
- ✅ Support for English and Vietnamese output
- ✅ AI image analysis integration
- ✅ Fallback mechanism for invalid URLs
- ✅ Support for multiple markets (targetMarket)
- ✅ Configurable tone parameter

---

## 📚 Related Documentation

- [Product Optimize API](./product-optimize.md)
- [Complete API Reference](./complete-api.md)
- [Image Generation API](./image-generation-complete.md)

---

## 🚀 Quick Start

### Minimal Request Example

Request đơn giản nhất chỉ cần `productTitle` và `images`:

```json
{
  "productTitle": "Your Product Title",
  "images": [
    {
      "id": "image-1",
      "url": "https://example.com/product-image.jpg"
    }
  ]
}
```

### Full Request Example với tất cả options

```json
{
  "productTitle": "Elegant Freshwater Pearl Earrings",
  "images": [
    {
      "id": "gid://shopify/ProductImage/12345",
      "url": "https://cdn.shopify.com/s/files/1/0000/image.webp"
    },
    {
      "id": "gid://shopify/ProductImage/12346",
      "url": "https://cdn.shopify.com/s/files/1/0000/image2.webp"
    }
  ],
  "selectedSegment": {
    "name": "Urban Career Woman",
    "keywordSuggestions": [
      "elegant pearl earrings",
      "professional jewelry",
      "workplace accessories"
    ]
  },
  "targetMarket": "us",
  "tone": "friendly",
  "language": "en-US"
}
```

---

## 📊 Response Examples

### Success Response với 3 images

```json
{
  "success": true,
  "data": {
    "productTitle": "Elegant Freshwater Pearl Earrings",
    "images": [
      {
        "imageId": "gid://shopify/ProductImage/12345",
        "altText": "Elegant freshwater pearl earrings on white studio background",
        "imageUrl": "https://cdn.shopify.com/s/files/1/0000/image.webp"
      },
      {
        "imageId": "gid://shopify/ProductImage/12346",
        "altText": "Close-up detail of pearl earrings showing texture",
        "imageUrl": "https://cdn.shopify.com/s/files/1/0000/image2.webp"
      },
      {
        "imageId": "gid://shopify/ProductImage/12347",
        "altText": "Model wearing pearl earrings in professional setting",
        "imageUrl": "https://cdn.shopify.com/s/files/1/0000/image3.webp"
      }
    ],
    "count": 3
  }
}
```

---

## 🔍 Common Use Cases

### 1. Shopify Integration

```javascript
// Lấy product images từ Shopify và tạo alt text
async function generateAltTextForShopifyProduct(product, selectedSegment) {
  const images = product.images.map(img => ({
    id: img.id,
    url: img.src
  }));

  const response = await fetch('https://api.tikminer.info/api/product-optimize/generate-alt-text', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      productTitle: product.title,
      images: images,
      selectedSegment: selectedSegment,
      targetMarket: product.market || 'vi',
      language: product.language || 'vi-VN',
      tone: 'friendly'
    })
  });

  const result = await response.json();
  
  // Map alt text back to Shopify images
  return result.data.images.map(item => ({
    id: item.imageId,
    altText: item.altText
  }));
}
```

### 2. Batch Processing Multiple Products

```javascript
async function batchGenerateAltText(products) {
  const results = [];
  
  for (const product of products) {
    try {
      const response = await fetch('https://api.tikminer.info/api/product-optimize/generate-alt-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productTitle: product.title,
          images: product.images,
          targetMarket: product.market,
          language: product.language
        })
      });
      
      const data = await response.json();
      results.push({
        productId: product.id,
        altTexts: data.data.images
      });
      
      // Rate limiting: wait 1 second between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Error processing product ${product.id}:`, error);
    }
  }
  
  return results;
}
```

---

## ⚠️ Important Notes

1. **Image URLs Must Be Accessible**: Hình ảnh phải có thể truy cập công khai qua URL. API sẽ tự động download và phân tích.

2. **Language vs Market**: `language` và `targetMarket` có thể khác nhau:
   - `targetMarket="us"` + `language="en-US"` ✅
   - `targetMarket="us"` + `language="vi-VN"` ✅ (cho Vietnamese speakers ở US)

3. **Image Order Matters**: Alt text được trả về theo thứ tự images trong request.

4. **Fallback Behavior**: Nếu image URLs không hợp lệ, API sẽ tự động tạo alt text dựa trên metadata.

---

## 🆘 Support & Contact

Nếu có vấn đề hoặc cần hỗ trợ, vui lòng liên hệ qua:
- Email: [support email]
- Documentation: [docs URL]
- Issue Tracker: [issues URL]

