# 🧪 Postman Test Request cho `/generate-image` API

## 📋 Request Details

### **Method**: `POST`
### **URL**: `http://localhost:3001/api/product-optimize/generate-image`
### **Headers**:
```
Content-Type: application/json
```

### **Body (JSON)**:
```json
{
  "productTitle": "Elegant Gold Starfish & Shell Pearl Dangle Earrings",
  "productDescription": "Drift into the essence of the ocean with these enchanting gold-tone dangle earrings, featuring delicate starfish, seashells, love hearts, and luminous pearls. Designed for the free-spirited woman who loves beachy elegance, these earrings add a touch of bohemian charm to any outfit—perfect for vacations, summer outings, or effortless everyday glam.",
  "productImages": [
    "https://cdn.shopify.com/s/files/1/0679/2540/9948/files/EDFD2307-A92F-4C65-8D7C-8DF8A0D6C023.webp?v=1743751021",
    "https://cdn.shopify.com/s/files/1/0679/2540/9948/files/Hefde5c4a46f94c6883e32e00f01f52feY.webp?v=1743751021",
    "https://cdn.shopify.com/s/files/1/0679/2540/9948/files/H6e4e58cdd3cc4d12b95efa7fb5d872dbi.webp?v=1743751021",
    "https://cdn.shopify.com/s/files/1/0679/2540/9948/files/H5db0812b86c74c52ac6b2de55c31e2een.webp?v=1743751021",
    "https://cdn.shopify.com/s/files/1/0679/2540/9948/files/H738585f6315e4e5da923990139bc6e16a.webp?v=1743751021",
    "https://cdn.shopify.com/s/files/1/0679/2540/9948/files/Hcd74262760dc4796a9ac9ed0f0639b03z.webp?v=1743751021",
    "https://cdn.shopify.com/s/files/1/0679/2540/9948/files/He21417f7c2074ef397050a1f64530da7K.webp?v=1743751021",
    "https://cdn.shopify.com/s/files/1/0679/2540/9948/files/Ha90003dec46d46fda63b72f9adeee46aj.webp?v=1743751021",
    "https://cdn.shopify.com/s/files/1/0679/2540/9948/files/H6b098f020663409993baeb1d6e19ce83L.webp?v=1743751021",
    "https://cdn.shopify.com/s/files/1/0679/2540/9948/files/H006bd86da6334e9298a19c116e076e974.webp?v=1743751021"
  ],
  "keyFeature": "Gold-tone dangle earrings with starfish, seashells, and pearls",
  "persona": "Free-spirited women who love beachy elegance",
  "painpoints": [
    "Difficulty finding unique beach-inspired accessories",
    "Want jewelry that matches vacation outfits",
    "Looking for versatile pieces for both casual and special occasions"
  ],
  "keywords": [
    "beach earrings",
    "bohemian jewelry",
    "gold dangle earrings",
    "starfish jewelry",
    "vacation accessories"
  ],
  "tone": "Enchanting and free-spirited",
  "language": "en",
  "market": "us",
  "segmentation": {
    "name": "Beach Bohemian Lovers",
    "painpoint": "Want unique beach-inspired accessories that stand out",
    "personaProfile": {
      "demographics": "Women aged 25-40, love beach vacations and bohemian style",
      "behaviors": "Active on Instagram, shop for vacation outfits, value unique accessories"
    },
    "toneType": "Enchanting and Free-spirited",
    "voiceGuideline": "Use mystical, ocean-inspired language with emotional connection",
    "locations": ["Beach destinations", "Music festivals", "Summer vacations"],
    "productBenefits": [
      "Perfect for beach vacations and summer outings",
      "Versatile styling for both casual and special occasions",
      "Unique bohemian design that stands out from typical jewelry"
    ]
  }
}
```

## 🔍 Expected Response Structure

```json
{
  "success": true,
  "data": {
    "product": "Elegant Gold Starfish & Shell Pearl Dangle Earrings",
    "analysis": "Detailed product analysis in Vietnamese describing materials, colors, structure, and visual features",
    "bestImageUrl": "https://cdn.shopify.com/s/files/1/0679/2540/9948/files/[selected-best-image].webp?v=1743751021",
    "imageSelectionReason": "Explanation in Vietnamese of why this specific image was chosen",
    "styles": {
      "studio": "Studio shot prompt with white background and product locking constraints",
      "lifestyle": "Lifestyle shot prompt with beach/bohemian context and product locking",
      "infographic": "Infographic style prompt with callouts and product locking",
      "ugc": "UGC style prompt mimicking user-generated content with product locking",
      "closeup": "Close-up shot prompt focusing on textures and details with product locking",
      "motion": "360-degree rotation prompt with product locking"
    },
    "tech_settings": {
      "img2img_strength": 0.3,
      "cfg_scale": 9,
      "lighting": "natural daylight or balanced studio light, soft realistic shadows",
      "style": "photorealistic commercial product photography, high detail, high conversion intent"
    }
  },
  "timestamp": "2025-01-27T14:30:00.000Z"
}
```

## 📊 Console Logs to Monitor

Khi bạn gọi API này, server sẽ log ra console:

1. **Request Body Log**: 
   ```
   📥 Generate Image API Request: {
     productTitle: "Elegant Gold Starfish & Shell Pearl Dangle Earrings",
     productImages: [10 URLs],
     language: "en",
     market: "us"
   }
   ```

2. **AI Request Details**:
   ```
   🤖 AI Request Details: {
     model: "openai/gpt-4o-mini",
     timeout: 60000,
     max_tokens: 2048
   }
   ```

3. **AI Response Preview**:
   ```
   📝 AI Response Preview: [Contains base64 image data] hoặc [first 200 chars]...
   ```

4. **Final API Response Summary**:
   ```
   ✅ Generate Image API Response: {
     success: true,
     productAnalysis: "Detailed analysis...",
     bestImageSelected: "URL",
     stylesGenerated: 6,
     processingTime: "Xms"
   }
   ```

## 🧪 cURL Command hoàn chỉnh để test

### **Full cURL Command** (Copy & Paste luôn):

```bash
curl -X POST http://localhost:3001/api/product-optimize/generate-image \
  -H "Content-Type: application/json" \
  -d '{
    "productTitle": "Elegant Gold Starfish & Shell Pearl Dangle Earrings",
    "productDescription": "Drift into the essence of the ocean with these enchanting gold-tone dangle earrings, featuring delicate starfish, seashells, love hearts, and luminous pearls. Designed for the free-spirited woman who loves beachy elegance, these earrings add a touch of bohemian charm to any outfit—perfect for vacations, summer outings, or effortless everyday glam.",
    "productImages": [
      "https://cdn.shopify.com/s/files/1/0679/2540/9948/files/EDFD2307-A92F-4C65-8D7C-8DF8A0D6C023.webp?v=1743751021",
      "https://cdn.shopify.com/s/files/1/0679/2540/9948/files/Hefde5c4a46f94c6883e32e00f01f52feY.webp?v=1743751021",
      "https://cdn.shopify.com/s/files/1/0679/2540/9948/files/H6e4e58cdd3cc4d12b95efa7fb5d872dbi.webp?v=1743751021",
      "https://cdn.shopify.com/s/files/1/0679/2540/9948/files/H5db0812b86c74c52ac6b2de55c31e2een.webp?v=1743751021",
      "https://cdn.shopify.com/s/files/1/0679/2540/9948/files/H738585f6315e4e5da923990139bc6e16a.webp?v=1743751021",
      "https://cdn.shopify.com/s/files/1/0679/2540/9948/files/Hcd74262760dc4796a9ac9ed0f0639b03z.webp?v=1743751021",
      "https://cdn.shopify.com/s/files/1/0679/2540/9948/files/He21417f7c2074ef397050a1f64530da7K.webp?v=1743751021",
      "https://cdn.shopify.com/s/files/1/0679/2540/9948/files/Ha90003dec46d46fda63b72f9adeee46aj.webp?v=1743751021",
      "https://cdn.shopify.com/s/files/1/0679/2540/9948/files/H6b098f020663409993baeb1d6e19ce83L.webp?v=1743751021",
      "https://cdn.shopify.com/s/files/1/0679/2540/9948/files/H006bd86da6334e9298a19c116e076e974.webp?v=1743751021"
    ],
    "keyFeature": "Gold-tone dangle earrings with starfish, seashells, and pearls",
    "persona": "Free-spirited women who love beachy elegance",
    "painpoints": [
      "Difficulty finding unique beach-inspired accessories",
      "Want jewelry that matches vacation outfits",
      "Looking for versatile pieces for both casual and special occasions"
    ],
    "keywords": [
      "beach earrings",
      "bohemian jewelry",
      "gold dangle earrings",
      "starfish jewelry",
      "vacation accessories"
    ],
    "tone": "Enchanting and free-spirited",
    "language": "en",
    "market": "us",
    "segmentation": {
      "name": "Beach Bohemian Lovers",
      "painpoint": "Want unique beach-inspired accessories that stand out",
      "personaProfile": {
        "demographics": "Women aged 25-40, love beach vacations and bohemian style",
        "behaviors": "Active on Instagram, shop for vacation outfits, value unique accessories"
      },
      "toneType": "Enchanting and Free-spirited",
      "voiceGuideline": "Use mystical, ocean-inspired language with emotional connection",
      "locations": ["Beach destinations", "Music festivals", "Summer vacations"],
      "productBenefits": [
        "Perfect for beach vacations and summer outings",
        "Versatile styling for both casual and special occasions",
        "Unique bohemian design that stands out from typical jewelry"
      ]
    }
  }'
```

### **Simplified cURL Command** (Test nhanh):

```bash
curl -X POST http://localhost:3001/api/product-optimize/generate-image \
  -H "Content-Type: application/json" \
  -d '{
    "productTitle": "Test Product",
    "productImages": [
      "https://cdn.shopify.com/s/files/1/0679/2540/9948/files/unisex-organic-mid-light-t-shirt-french-navy-back-6829702087446.jpg?v=1747546160"
    ],
    "language": "en"
  }'
```

### **Pretty Print Response** (Với jq):

```bash
curl -X POST http://localhost:3001/api/product-optimize/generate-image \
  -H "Content-Type: application/json" \
  -d '{
    "productTitle": "Test Product",
    "productImages": ["https://cdn.shopify.com/s/files/1/0679/2540/9948/files/unisex-organic-mid-light-t-shirt-french-navy-back-6829702087446.jpg?v=1747546160"],
    "language": "en"
  }' | jq '.data | {product, analysis, bestImageUrl, imageSelectionReason, styles: (.styles | keys)}'
```

## 🧪 Alternative Test Request (Simplified)

Nếu bạn muốn test với data đơn giản hơn:

```json
{
  "productTitle": "Test Product",
  "productImages": [
    "https://cdn.shopify.com/s/files/1/0679/2540/9948/files/unisex-organic-mid-light-t-shirt-french-navy-back-6829702087446.jpg?v=1747546160"
  ],
  "language": "en"
}
```

## 🔧 Troubleshooting

- **524 Timeout**: Nếu gặp timeout, thử giảm số lượng images hoặc dùng `/generate-image-quick`
- **400 Bad Request**: Check JSON format và required fields
- **Server không chạy**: Đảm bảo backend server đang chạy trên port 3001

## 📝 Notes

- API sẽ phân tích tất cả images và chọn 1 hình tốt nhất
- Tất cả prompts sẽ có "product locking" constraints
- Response sẽ có 6 styles khác nhau cho commercial use
- Console logs sẽ ẩn base64 data để tránh spam
