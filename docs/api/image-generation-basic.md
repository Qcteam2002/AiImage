# 🎨 Image Generation API Documentation

## Overview
API `/generate-image` được thiết kế để phân tích hình ảnh sản phẩm và tạo ra 6 prompt cho các phong cách ảnh khác nhau, tối ưu hóa cho việc tạo ảnh sản phẩm thương mại.

## Endpoint
```
POST /api/product-optimize/generate-image
```

## Request Body

### Required Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `productTitle` | string | ✅ | Tên sản phẩm |
| `productImages` | string[] | ✅ | Mảng chứa một hoặc nhiều URL hình ảnh sản phẩm. Ít nhất phải có một URL |

### Optional Fields
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

### Segmentation Object Structure
```json
{
  "name": "Tên persona",
  "painpoint": "Nỗi đau của khách hàng",
  "personaProfile": {
    "demographics": "Thông tin nhân khẩu học",
    "behaviors": "Hành vi mua sắm",
    "motivations": "Động lực"
  },
  "toneType": "Loại tông giọng",
  "voiceGuideline": "Hướng dẫn giọng văn",
  "locations": ["Địa điểm 1", "Địa điểm 2"]
}
```

## Response Format

### Success Response
```json
{
  "success": true,
  "data": {
    "product": "Tên sản phẩm",
    "analysis": "Tóm tắt ngắn về hình và đặc trưng cấu trúc sản phẩm",
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

### Error Response
```json
{
  "error": "Error message",
  "message": "Detailed error description"
}
```

## 6 Phong Cách Ảnh

### 1. 🏙 Studio Shot
- **Mục đích**: Ảnh sản phẩm chuyên nghiệp cho e-commerce
- **Đặc điểm**: Background trắng/xám, ánh sáng studio cân bằng
- **Ứng dụng**: Trang sản phẩm chính, catalog

### 2. 🏠 Lifestyle Shot
- **Mục đích**: Sản phẩm trong context sử dụng thực tế
- **Đặc điểm**: Background tự nhiên, props phù hợp
- **Ứng dụng**: Quảng cáo, social media

### 3. 📊 Infographic Style
- **Mục đích**: Ảnh với thông tin kỹ thuật và tính năng
- **Đặc điểm**: Text và icons xung quanh sản phẩm
- **Ứng dụng**: Landing page, brochure

### 4. 📸 UGC (User Generated Content)
- **Mục đích**: Ảnh tự nhiên như người dùng thật chụp
- **Đặc điểm**: Framing không hoàn hảo, ánh sáng tự nhiên
- **Ứng dụng**: Social proof, reviews

### 5. 🔍 Close-up Shot
- **Mục đích**: Chi tiết chất liệu và craftsmanship
- **Đặc điểm**: Macro lens, ánh sáng góc cạnh
- **Ứng dụng**: Highlight chất lượng, premium feel

### 6. 🎞 Motion / Animated Mock Style
- **Mục đích**: Animation 360° hoặc motion graphics
- **Đặc điểm**: Rotating animation, smooth transitions
- **Ứng dụng**: Video ads, interactive content

## Prompt Rules

Mỗi prompt được tạo ra tuân theo các quy tắc "lock sản phẩm":

1. **Use the provided image as the exact product reference**
2. **Keep the product exactly the same** — same structure, material, color, texture, and geometry
3. **Do not repaint or recreate** — Preserve pixel-identical design
4. **Only replace background and lighting** according to style
5. **No duplication, no resizing, no recolor, no redrawn details, no new props** (unless style specifies)

## Technical Settings

### AI Model
- **Model**: `openai/gpt-4o` (có khả năng phân tích hình ảnh)
- **Max Tokens**: 4096
- **Temperature**: 0.7
- **Timeout**: 120 seconds

### Image Generation Settings
- **img2img_strength**: 0.25–0.35 (để giữ nguyên thiết kế sản phẩm)
- **CFG scale**: 8–10 (để có độ chính xác cao)
- **Lighting**: natural daylight or soft studio light
- **Style**: photorealistic commercial product photography

## Example Usage

### Request
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

### Response
```json
{
  "success": true,
  "data": {
    "product": "316 Stainless Steel Thermos Bottle",
    "analysis": "Premium stainless steel thermos bottle with cylindrical design, screw-top lid, and detachable tea infuser. Features mirror finish and hand strap for portability.",
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

## Error Handling

### Common Errors
1. **400 Bad Request**: Missing required fields
2. **500 Internal Server Error**: AI API failure, JSON parsing error

### Fallback Response
Nếu AI không thể phân tích hình ảnh hoặc tạo prompt, API sẽ trả về fallback response với các prompt mẫu cơ bản.

## Integration Notes

1. **Image Analysis**: API sử dụng GPT-4o để phân tích hình ảnh và hiểu cấu trúc sản phẩm
2. **Prompt Generation**: Tạo ra 6 prompt khác nhau cho từng phong cách ảnh
3. **Product Locking**: Đảm bảo sản phẩm không bị thay đổi, chỉ background và lighting
4. **Segmentation Support**: Có thể tích hợp với dữ liệu segmentation để tạo prompt phù hợp với persona

## Use Cases

1. **E-commerce**: Tạo ảnh sản phẩm cho trang web
2. **Marketing**: Tạo ảnh quảng cáo cho các kênh khác nhau
3. **Social Media**: Tạo content cho Instagram, Facebook, TikTok
4. **Product Photography**: Hỗ trợ photographer tạo brief
5. **AI Image Generation**: Sử dụng prompt để tạo ảnh bằng Stable Diffusion, Midjourney, etc.







