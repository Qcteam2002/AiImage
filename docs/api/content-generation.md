# 🎨 Content Generation API Documentation

## Overview
API này generate content tối ưu (title + HTML description) cho sản phẩm dựa trên **segmentation data** đã được phân tích. Sử dụng model **Grok-4-Fast** với khả năng vision để hiểu sâu về sản phẩm và viết content cá nhân hóa theo từng persona.

---

## API Endpoint

### **POST** `/api/product-optimize/generate-content-from-segmentation`

**Base URL:** `http://localhost:3001` (development)

**Content-Type:** `application/json`

**Timeout:** 60 seconds

---

## Request Body

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `title` | string | Tên sản phẩm hiện tại |
| `segmentation` | object | Đầy đủ thông tin segmentation của persona được chọn |

### Optional Fields

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `description` | string | `null` | Mô tả sản phẩm hiện tại (để AI tham khảo) |
| `images` | array | `[]` | Mảng URL hình ảnh sản phẩm (AI sẽ tự chọn và chèn vào HTML) |
| `targetMarket` | string | `'vi'` | Thị trường mục tiêu: `'vi'` (Vietnam) hoặc `'us'` (United States) |
| `language` | string | `'vi-VN'` | Ngôn ngữ content: `'vi-VN'` hoặc `'en-US'` |

### Segmentation Object Structure

```json
{
  "name": "The Coastal Traveler (Beach & Vacation Enthusiast)",
  "painpoint": "Feeling frustrated when packing for a beach vacation...",
  "winRate": 0.9,
  "reason": "The product's starfish motif perfectly embodies...",
  "personaProfile": {
    "demographics": "Female, 25-40 years old, middle to upper-middle income...",
    "behaviors": "Active on Instagram and Pinterest...",
    "motivations": "Seeking authentic coastal aesthetic...",
    "communicationChannels": [
      "Instagram Reels: Beach styling videos",
      "Pinterest: Vacation mood boards"
    ]
  },
  "locations": [
    "Miami Beach, FL (high-end resorts)",
    "San Diego, CA (laid-back beach culture)",
    "Malibu, CA (coastal luxury)"
  ],
  "keywordSuggestions": [
    "starfish cuff bracelet",
    "coastal jewelry for vacation",
    "beach accessories gold and silver"
  ],
  "seasonalTrends": "Peak relevance from late Spring through Summer...",
  "productBenefits": [
    "Dual-Tone Versatility: Matches both gold and silver",
    "Beach-Proof Design: Won't tarnish in water",
    "Adjustable Fit: Comfortable for all wrist sizes"
  ],
  "toneType": "Aspirational & Effortless",
  "voiceGuideline": "Start by validating their travel dilemma: 'Tired of packing bulky jewelry?' Then shift to inspiring tone: 'Embrace effortless coastal elegance.'"
}
```

---

## Complete Request Example

```javascript
// Frontend call example
const response = await fetch('http://localhost:3001/api/product-optimize/generate-content-from-segmentation', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: "Golden & Silvery Starfish Cuff Bracelet",
    description: "Channel oceanic elegance with this stunning starfish cuff bracelet...",
    images: [
      "https://cdn.shopify.com/files/starfish-bracelet-1.jpg",
      "https://cdn.shopify.com/files/starfish-bracelet-2.jpg",
      "https://cdn.shopify.com/files/starfish-bracelet-3.jpg"
    ],
    targetMarket: "us",
    segmentation: {
      name: "The Coastal Traveler",
      painpoint: "Feeling frustrated when packing for a beach vacation because their current jewelry is either too delicate or too formal...",
      personaProfile: {
        demographics: "Female, 25-40 years old, active travelers",
        behaviors: "Shops on Instagram, values aesthetic",
        motivations: "Wants effortless beach style"
      },
      productBenefits: [
        "Dual-Tone Versatility: Matches both gold and silver hardware",
        "Beach-Proof Design: Won't tarnish in saltwater",
        "Adjustable Cuff: Comfortable for all wrist sizes"
      ],
      toneType: "Aspirational & Effortless",
      voiceGuideline: "Start with validation, then inspire action",
      keywordSuggestions: ["starfish bracelet", "beach jewelry"],
      seasonalTrends: "Peak in summer months",
      locations: ["Miami Beach, FL", "Malibu, CA"]
    },
    language: "en-US"
  })
});

const result = await response.json();
console.log(result);
```

---

## Response Format

### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "title": "Starfish Cuff Bracelet - Your Perfect Beach Vacation Companion ✨",
    "description": "<div class='product-description'>\n  <div class='hero-section'>\n    <h2>🌟 Effortless Coastal Elegance for Every Adventure</h2>\n    <p class='hook'>Tired of packing bulky jewelry that doesn't match your beach vibe? Imagine slipping on one stunning piece that works with everything—from sunrise yoga to sunset cocktails.</p>\n  </div>\n  \n  <div class='benefits-section'>\n    <h3>✨ Why You'll Love This Cuff</h3>\n    <ul class='benefits-list'>\n      <li>🔥 <strong>Dual-Tone Magic:</strong> Gold and silver tones mean it matches every outfit in your suitcase</li>\n      <li>✅ <strong>Beach-Proof:</strong> Saltwater, sunscreen, sand? No problem. This beauty won't tarnish or fade</li>\n      <li>💎 <strong>All-Day Comfort:</strong> Adjustable cuff design fits perfectly without pinching</li>\n      <li>🌊 <strong>Instagram-Worthy:</strong> That starfish detail? Pure coastal chic in every photo</li>\n    </ul>\n  </div>\n  \n  <div class='transformation-section'>\n    <h3>🚀 The Result? Vacation Confidence</h3>\n    <p>No more packing stress. No more outfit indecision. Just slip this on and feel that effortless beach goddess energy from breakfast to beach club. Your vacation photos will thank you.</p>\n  </div>\n  \n  <div class='cta-section'>\n    <p class='cta'><strong>🎁 Add to Cart - Your Next Adventure Awaits!</strong></p>\n  </div>\n</div>"
  }
}
```

### Error Response (400 Bad Request)

```json
{
  "error": "Missing required fields: title and segmentation"
}
```

### Error Response (500 Internal Server Error)

```json
{
  "error": "Failed to generate content",
  "message": "Detailed error message here"
}
```

---

## Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | `true` nếu thành công |
| `data.title` | string | Title mới được tối ưu (50-80 ký tự, có SEO keywords) |
| `data.description` | string | HTML description đầy đủ với cấu trúc sections |

---

## HTML Description Structure

Generated HTML bao gồm 4 sections chính:

### 1. Hero Section
```html
<div class='hero-section'>
  <h2>🌟 Tiêu đề chính đánh vào kết quả mong muốn</h2>
  <p class='hook'>Câu chuyện hoặc câu hỏi chạm vào pain point</p>
</div>
```

### 2. Benefits Section
```html
<div class='benefits-section'>
  <h3>✨ Tại Sao Bạn Sẽ Yêu Thích Sản Phẩm Này?</h3>
  <ul class='benefits-list'>
    <li>🔥 <strong>Benefit 1:</strong> Chi tiết</li>
    <li>✅ <strong>Benefit 2:</strong> Chi tiết</li>
    <li>💎 <strong>Benefit 3:</strong> Chi tiết</li>
  </ul>
</div>
```

### 3. Transformation Section
```html
<div class='transformation-section'>
  <h3>🚀 Kết Quả Bạn Sẽ Đạt Được</h3>
  <p>Mô tả sự chuyển đổi và kết quả</p>
</div>
```

### 4. CTA Section
```html
<div class='cta-section'>
  <p class='cta'><strong>🎁 Lời kêu gọi hành động mạnh mẽ</strong></p>
</div>
```

---

## Prompt Structure

API sử dụng cấu trúc prompt **"Bất Bại"** với 5 phần:

### 1. [ĐÓNG VAI]
- AI đóng vai copywriter chuyên Direct Response Marketing
- Thấu hiểu tâm lý khách hàng, viết content đánh vào cảm xúc

### 2. [BỐI CẢNH]
- Thông tin sản phẩm (title, description, images)
- Segmentation data đầy đủ (persona, pain point, benefits)
- Demographics, behaviors, motivations
- Locations, trends, keywords

### 3. [NHIỆM VỤ]
- Viết title mới (50-80 ký tự, có SEO keywords)
- Viết description HTML format
- Kể câu chuyện, khơi gợi cảm xúc

### 4. [YÊU CẦU & RÀNG BUỘC]
- Tone Type từ segmentation (Aspirational, Friendly, Professional...)
- Voice Guideline cụ thể (2 giai đoạn: empathy → action)
- Văn phong: câu ngắn, emoji, focus vào lợi ích
- Cá nhân hóa cho đúng persona

### 5. [ĐỊNH DẠNG ĐẦU RA]
- JSON format với `title` và `description`
- HTML với 4 sections có class names
- Không có markdown, không có text ngoài JSON

---

## AI Model

**Model:** `openai/gpt-4o-mini`

**Capabilities:**
- ✅ Vision: Có thể "xem" và phân tích hình ảnh sản phẩm
- ✅ Fast: Tốc độ generate nhanh (~10-20s)
- ✅ Context: Hiểu được context phức tạp từ segmentation
- ✅ Multilingual: Hỗ trợ cả tiếng Việt và tiếng Anh
- ✅ Cost-effective: Giá rẻ hơn so với GPT-4

**Parameters:**
```javascript
{
  model: 'openai/gpt-4o-mini',
  max_tokens: 4096,
  temperature: 0.7  // Creative but consistent
}
```

---

## Images Handling

### Image Processing
- API chấp nhận tối đa **3 hình ảnh** để tránh quá tải
- Images được gửi kèm với text prompt cho AI
- AI sẽ "xem" images để hiểu rõ hơn về sản phẩm
- **AI tự chọn và chèn 2-3 hình ảnh phù hợp vào HTML description**
- Images được chèn với thẻ `<img>` và styling responsive

### Image Format
```javascript
messageContent: [
  {
    type: 'text',
    text: '...'
  },
  {
    type: 'image_url',
    image_url: {
      url: 'https://cdn.shopify.com/image1.jpg'
    }
  },
  {
    type: 'image_url',
    image_url: {
      url: 'https://cdn.shopify.com/image2.jpg'
    }
  }
]
```

---

## Error Handling

### Fallback Mechanism

Nếu AI response không parse được (invalid JSON), API sẽ trả về **fallback template**:

```javascript
{
  success: true,
  data: {
    title: "Original Title",  // Giữ nguyên title gốc
    description: `<div class="product-description">
      <div class="hero-section">
        <h2>✨ ${title}</h2>
        <p>${description}</p>
      </div>
      <div class="benefits-section">
        <h3>🌟 Lợi Ích Nổi Bật:</h3>
        <ul class="benefits-list">
          <li>✅ ${benefit1}</li>
          <li>✅ ${benefit2}</li>
          ...
        </ul>
      </div>
    </div>`
  }
}
```

### Console Logging

API có logging chi tiết để debug:

```
🎨 Content Generation - Segmentation: The Coastal Traveler
🤖 Calling Grok-4-Fast for content generation...
📝 Raw AI response length: 2543
✅ Content generated successfully
📌 New title: Starfish Cuff Bracelet - Your Perfect...
```

---

## Best Practices

### 1. **Chọn Segmentation Phù Hợp**
- Sử dụng segmentation có `winRate` cao nhất
- Đảm bảo segmentation data đầy đủ tất cả fields

### 2. **Cung Cấp Images Chất Lượng**
- Ảnh sản phẩm rõ nét, góc chụp đẹp
- Tối đa 3 ảnh để tránh timeout
- Ưu tiên ảnh hero image và lifestyle images

### 3. **Kiểm Tra Language Setting**
- `language: 'vi-VN'` cho thị trường Việt Nam
- `language: 'en-US'` cho thị trường US/International
- Đảm bảo segmentation data cũng đúng ngôn ngữ

### 4. **Review Generated Content**
- Luôn review lại title và description trước khi publish
- Check emoji có phù hợp với brand không
- Verify HTML structure render đúng

### 5. **Handle Errors Gracefully**
- Có fallback UI nếu API timeout
- Show loading state trong khi generate (~20-30s)
- Cho phép user retry nếu failed

---

## Performance

### Response Time
- **Average:** 20-30 seconds
- **Worst case:** 50-60 seconds (với 3 images)
- **Timeout:** 60 seconds

### Optimization Tips
1. Giảm số lượng images (1-2 ảnh thay vì 3)
2. Rút gọn description gốc nếu quá dài
3. Cache segmentation data để tránh gọi lại

---

## Integration Example

### React Component

```jsx
import { useState } from 'react';

function ContentGenerator({ product, segmentation }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  
  const generateContent = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/product-optimize/generate-content-from-segmentation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: product.title,
          description: product.description,
          images: product.images.slice(0, 3),
          segmentation: segmentation,
          language: 'vi-VN'
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setResult(data.data);
      }
    } catch (error) {
      console.error('Failed to generate content:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      <button onClick={generateContent} disabled={loading}>
        {loading ? 'Generating...' : 'Generate Content'}
      </button>
      
      {result && (
        <div>
          <h3>New Title:</h3>
          <p>{result.title}</p>
          
          <h3>New Description:</h3>
          <div dangerouslySetInnerHTML={{ __html: result.description }} />
        </div>
      )}
    </div>
  );
}
```

---

## Testing

### cURL Example

```bash
curl -X POST http://localhost:3001/api/product-optimize/generate-content-from-segmentation \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Product",
    "segmentation": {
      "name": "Test Persona",
      "painpoint": "Test pain point",
      "personaProfile": {
        "demographics": "Test demographics",
        "behaviors": "Test behaviors",
        "motivations": "Test motivations"
      },
      "productBenefits": ["Benefit 1", "Benefit 2"],
      "toneType": "Friendly",
      "voiceGuideline": "Test voice",
      "keywordSuggestions": ["keyword1"],
      "seasonalTrends": "Test trends",
      "locations": ["Location 1"]
    },
    "language": "vi-VN"
  }'
```

### Postman Collection

```json
{
  "name": "Generate Content from Segmentation",
  "request": {
    "method": "POST",
    "url": "http://localhost:3001/api/product-optimize/generate-content-from-segmentation",
    "header": [
      {
        "key": "Content-Type",
        "value": "application/json"
      }
    ],
    "body": {
      "mode": "raw",
      "raw": "{\n  \"title\": \"Golden Starfish Bracelet\",\n  \"segmentation\": {...}\n}"
    }
  }
}
```

---

## Troubleshooting

### Common Issues

#### 1. Timeout Error (408)
**Cause:** Request takes longer than 60 seconds  
**Solution:** 
- Reduce number of images
- Simplify segmentation data
- Retry the request

#### 2. Invalid JSON Response
**Cause:** AI returns malformed JSON  
**Solution:** 
- API automatically falls back to template
- Check console logs for raw response
- Report to developer if persistent

#### 3. Missing Segmentation Data
**Cause:** Required fields not provided  
**Solution:**
- Ensure all segmentation fields are present
- Check segmentation object structure
- Validate with TypeScript types

#### 4. Model Not Available
**Cause:** Grok-4-Fast model quota exceeded  
**Solution:**
- Wait and retry
- Check OpenRouter API status
- Contact support if persistent

---

## Rate Limits

**OpenRouter API Limits:**
- Requests per minute: 60
- Tokens per request: 4096 (output)
- Concurrent requests: 10

**Recommendations:**
- Implement request queuing if generating multiple products
- Add delay between requests (1-2 seconds)
- Cache results to avoid regenerating

---

## Changelog

### v1.1.0 (2025-10-23)
- ✅ **NEW:** AI tự chọn và chèn images vào HTML description
- ✅ **NEW:** Thêm targetMarket parameter (vi/us)
- ✅ **CHANGED:** Switch từ Grok-4-Fast sang GPT-4o-mini (cost-effective)
- ✅ **IMPROVED:** Enhanced prompt với image selection instructions
- ✅ Vision capabilities (image understanding)
- ✅ Structured prompt with "Bất Bại" framework
- ✅ Fallback mechanism for error handling
- ✅ Multilingual support (vi-VN, en-US)

### v1.0.0 (2025-10-23)
- ✅ Initial release
- ✅ Support for Grok-4-Fast model
- ✅ Vision capabilities (image understanding)
- ✅ Structured prompt with "Bất Bại" framework
- ✅ Fallback mechanism for error handling
- ✅ Multilingual support (vi-VN, en-US)

---

## Support

For issues or questions:
- GitHub Issues: [Your Repo]
- Email: your-email@example.com
- Documentation: This file

---

## License

MIT License - See LICENSE file for details

