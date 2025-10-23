# 🧠 API Documentation: Market Segmentation Analysis

## 📋 Tổng quan

API `/suggestDataSegmentation` được thiết kế để phân tích sản phẩm và đề xuất 3 nhóm phân khúc khách hàng (market segmentation) tiềm năng nhất. API sử dụng AI để tạo ra các chân dung khách hàng chi tiết, giúp đội marketing có thể xây dựng chiến lược tiếp cận hiệu quả.

## 🎯 Mục tiêu

- Phân tích sâu sản phẩm để hiểu giá trị cốt lõi và USP
- Tạo ra 3 chân dung khách hàng khác biệt và sắc nét
- Đánh giá tiềm năng (Win Rate) của từng phân khúc
- Cung cấp thông tin chi tiết về demographics, behaviors, motivations
- Gợi ý kênh tiếp cận và từ khóa marketing

---

## 🔗 Endpoint

```
POST /api/product-optimize/suggestDataSegmentation
```

## 📥 Request Body

### Cấu trúc JSON

```json
{
  "title": "string (required)",
  "description": "string (required)", 
  "images": ["string array (optional)"],
  "targetMarket": "string (required)",
  "language": "string (required)",
  "productType": "string (optional)",
  "brandTone": "string (optional)",
  "goals": ["string array (optional)"]
}
```

### Mô tả các trường

| Trường | Loại | Bắt buộc | Mô tả | Ví dụ |
|--------|------|----------|-------|-------|
| `title` | string | ✅ | Tên sản phẩm | `"Bộ 4 nhẫn Punk Olivia Rodrigo"` |
| `description` | string | ✅ | Mô tả chi tiết sản phẩm | `"Bộ nhẫn phong cách punk lấy cảm hứng từ ca sĩ Olivia Rodrigo..."` |
| `images` | string[] | ❌ | Danh sách URL hình ảnh sản phẩm | `["https://cdn.shopify.com/products/ring1.jpg"]` |
| `targetMarket` | string | ✅ | Thị trường mục tiêu (mã quốc gia) | `"vi"`, `"us"`, `"id"` |
| `language` | string | ✅ | Ngôn ngữ phản hồi | `"vi-VN"`, `"en-US"` |
| `productType` | string | ❌ | Loại sản phẩm | `"Accessory"`, `"Clothing"`, `"Electronics"` |
| `brandTone` | string | ❌ | Tông giọng thương hiệu | `"Edgy & Confident"`, `"Professional"` |
| `goals` | string[] | ❌ | Mục tiêu marketing | `["Increase Conversion Rate", "Target Niche Audience"]` |

### Mã thị trường hỗ trợ

| Mã | Quốc gia |
|----|----------|
| `vi` | Vietnam |
| `us` | United States |
| `id` | Indonesia |
| `th` | Thailand |
| `my` | Malaysia |
| `ph` | Philippines |
| `sg` | Singapore |
| `jp` | Japan |
| `kr` | South Korea |
| `au` | Australia |

---

## 📤 Response

### Cấu trúc JSON thành công

```json
{
  "status": "success",
  "segmentations": [
    {
      "name": "string",
      "painpoint": "string", 
      "winRate": "number (0.0-1.0)",
      "reason": "string",
      "personaProfile": {
        "demographics": "string",
        "behaviors": "string",
        "motivations": "string", 
        "communicationChannels": "string"
      },
      "keywordSuggestions": ["string array"]
    }
  ]
}
```

### Mô tả các trường response

| Trường | Loại | Mô tả |
|--------|------|-------|
| `status` | string | Trạng thái API: `"success"` hoặc `"success_fallback"` |
| `segmentations` | array | Mảng 3 phân khúc khách hàng |
| `name` | string | Tên phân khúc khách hàng (sáng tạo, giàu hình ảnh) |
| `painpoint` | string | Nỗi đau/nhu cầu cốt lõi mà sản phẩm giải quyết |
| `winRate` | number | Tỷ lệ phù hợp (0.0-1.0), ví dụ: 0.75 = 75% |
| `reason` | string | Lý do chiến lược tại sao phân khúc này tiềm năng |
| `personaProfile.demographics` | string | Mô tả nhân khẩu học (tuổi, giới tính, nghề nghiệp, địa điểm) |
| `personaProfile.behaviors` | string | Mô tả hành vi (mua sắm ở đâu, dùng mạng xã hội nào) |
| `personaProfile.motivations` | string | Mô tả động lực mua hàng (họ tìm kiếm điều gì) |
| `personaProfile.communicationChannels` | string | Các kênh hiệu quả để tiếp cận họ |
| `keywordSuggestions` | string[] | Danh sách từ khóa gợi ý cho marketing |

### Response lỗi

```json
{
  "error": "string"
}
```

---

## 💡 Ví dụ sử dụng

### Request mẫu

```bash
curl -X POST http://localhost:3001/api/product-optimize/suggestDataSegmentation \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Bộ 4 nhẫn Punk Olivia Rodrigo",
    "description": "Bộ nhẫn phong cách punk lấy cảm hứng từ ca sĩ Olivia Rodrigo, làm từ hợp kim cao cấp không gỉ, phù hợp cho các buổi tiệc và thể hiện cá tính mạnh mẽ.",
    "images": [
      "https://cdn.shopify.com/products/ring1.jpg",
      "https://cdn.shopify.com/products/ring2.jpg"
    ],
    "targetMarket": "vi",
    "language": "vi-VN",
    "productType": "Accessory",
    "brandTone": "Edgy & Confident",
    "goals": ["Increase Conversion Rate", "Target Niche Audience"]
  }'
```

### Response mẫu

```json
{
  "status": "success",
  "segmentations": [
    {
      "name": "Chiến binh Gen Z: Tín đồ Văn hóa Pop-Punk",
      "painpoint": "Nhu cầu thể hiện bản thân khác biệt, tìm kiếm phụ kiện độc đáo, không đại trà để 'flex' phong cách cá nhân và sự ủng hộ dành cho thần tượng.",
      "winRate": 0.9,
      "reason": "Phù hợp nhất (Perfect Match). Nhóm này là khán giả cốt lõi của Olivia Rodrigo, nhạy cảm với xu hướng, và sẵn sàng chi tiền cho các sản phẩm liên quan đến thần tượng và phong cách Punk/Grunge.",
      "personaProfile": {
        "demographics": "Nữ, 16-24 tuổi. Học sinh, sinh viên hoặc người mới đi làm. Sống tại các thành phố lớn (Hà Nội, TP.HCM, Đà Nẵng).",
        "behaviors": "Hoạt động mạnh mẽ trên TikTok, Instagram Reels, X (Twitter). Săn lùng các món đồ 'aesthetic' và 'trendy'. Thường xuyên đi xem hòa nhạc, sự kiện thời trang đường phố.",
        "motivations": "Địa vị xã hội trong nhóm bạn, sự công nhận về gu thời trang độc đáo, cảm giác kết nối với thần tượng.",
        "communicationChannels": "TikTok (Challenge, Review Unboxing), Instagram (Stories, Reels), Cộng đồng Fan/Group anti-fan/Group chia sẻ gu thời trang trên Facebook."
      },
      "keywordSuggestions": ["Olivia Rodrigo merch Việt Nam", "nhẫn punk gen z", "phụ kiện edgy", "grunge aesthetic ring", "thời trang concert"]
    },
    {
      "name": "Người Phụ nữ Tự tin: Biểu Tượng Nổi loạn Văn phòng",
      "painpoint": "Mệt mỏi với phong cách công sở truyền thống, muốn thêm 'gia vị' cá tính vào trang phục hàng ngày mà vẫn giữ được sự chuyên nghiệp cơ bản.",
      "winRate": 0.75,
      "reason": "Nhóm này có khả năng chi tiêu cao hơn và tìm kiếm sự nâng cấp về phong cách. Sản phẩm là cầu nối giữa thời trang đường phố và môi trường làm việc.",
      "personaProfile": {
        "demographics": "Nữ, 25-35 tuổi. Nhân viên văn phòng, quản lý cấp trung, freelancer sáng tạo. Thu nhập ổn định. Sống tại khu vực trung tâm thành phố.",
        "behaviors": "Quan tâm đến các tạp chí thời trang (Elle, L'Officiel), theo dõi các fashion blogger Việt Nam. Mua sắm online qua Shopee Mall/Lazada Mall hoặc các local brand có chất lượng cao.",
        "motivations": "Thể hiện cá tính mạnh mẽ, khẳng định gu thẩm mỹ trưởng thành, tạo sự khác biệt tinh tế trong môi trường chuyên nghiệp.",
        "communicationChannels": "Facebook Ads (Retargeting, Lookalike Audience), Influencer Marketing (KOLs/Micro-KOLs về thời trang công sở phá cách), Bài viết PR trên các trang tin tức phụ nữ/lifestyle."
      },
      "keywordSuggestions": ["nhẫn statement công sở", "phụ kiện cá tính 25+", "nhẫn hợp kim cao cấp", "mix đồ punk office", "thời trang tự tin"]
    },
    {
      "name": "Nhà Sưu tập Phong cách: Người Khám phá Niche",
      "painpoint": "Luôn đi tìm các món đồ phụ kiện 'hiếm', độc đáo, thể hiện kiến thức sâu rộng về các subculture như Punk, Gothic, Emo.",
      "winRate": 0.8,
      "reason": "Mặc dù là nhóm nhỏ (Niche), họ là những người mua sắm trung thành và có khả năng lan truyền (Word-of-Mouth) cao. Sản phẩm đáp ứng chính xác nhu cầu về tính 'biểu tượng' và 'chất'.",
      "personaProfile": {
        "demographics": "Nam/Nữ, 18-30 tuổi. Sinh viên nghệ thuật, designer, photographer hoặc người làm trong ngành giải trí/sáng tạo. Có gu thẩm mỹ cá nhân rất rõ ràng.",
        "behaviors": "Hoạt động trên các diễn đàn/group chuyên về thời trang Niche. Ít bị ảnh hưởng bởi quảng cáo đại trà, tin tưởng vào đánh giá của cộng đồng.",
        "motivations": "Sự độc quyền, tính nghệ thuật, thể hiện sự am hiểu về thời trang và subculture, xây dựng bộ sưu tập phụ kiện cá nhân.",
        "communicationChannels": "Group Facebook kín (Seedling, Review từ thành viên), hợp tác với các cửa hàng thời trang/phụ kiện độc lập (Indie/Local Brand), Pinterest (Visual Content)."
      },
      "keywordSuggestions": ["phụ kiện subculture", "nhẫn gothic punk Việt Nam", "nhẫn statement độc", "thời trang indie", "hợp kim không gỉ chất lượng"]
    }
  ]
}
```

---

## ⚠️ Lưu ý quan trọng

### 1. **Không bao gồm CPC và Volume**
- API này **KHÔNG** cung cấp dữ liệu CPC (Cost Per Click) và Volume tìm kiếm
- Lý do: AI không có quyền truy cập thời gian thực vào cơ sở dữ liệu SEO
- Khuyến nghị: Sử dụng công cụ SEO chuyên dụng (Google Keyword Planner, Ahrefs) để xác thực từ khóa

### 2. **Quy trình làm việc tối ưu**
```
Bước 1: Gọi API suggestDataSegmentation → Lấy persona và keywordSuggestions
Bước 2: Đưa keywordSuggestions vào công cụ SEO → Lấy volume, CPC, competition
Bước 3: Kết hợp dữ liệu để xây dựng chiến lược marketing hoàn chỉnh
```

### 3. **Xử lý lỗi**
- API có fallback response chất lượng cao khi AI gặp lỗi
- Timeout: 45 giây
- Luôn kiểm tra trường `status` trong response

### 4. **Tối ưu hóa**
- Sử dụng `response_format: { "type": "json_object" }` để đảm bảo JSON hợp lệ
- Model: `google/gemini-pro` cho kết quả tốt nhất
- Temperature: 0.7 để cân bằng giữa sáng tạo và chính xác

---

## 🔧 Integration Guide

### JavaScript/Node.js

```javascript
const axios = require('axios');

async function getMarketSegmentation(productData) {
  try {
    const response = await axios.post(
      'http://localhost:3001/api/product-optimize/suggestDataSegmentation',
      {
        title: productData.title,
        description: productData.description,
        images: productData.images || [],
        targetMarket: productData.targetMarket,
        language: productData.language,
        productType: productData.productType,
        brandTone: productData.brandTone,
        goals: productData.goals || []
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 60000
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error calling segmentation API:', error.response?.data || error.message);
    throw error;
  }
}

// Sử dụng
const productData = {
  title: "Bộ 4 nhẫn Punk Olivia Rodrigo",
  description: "Bộ nhẫn phong cách punk...",
  targetMarket: "vi",
  language: "vi-VN",
  productType: "Accessory",
  brandTone: "Edgy & Confident",
  goals: ["Increase Conversion Rate"]
};

getMarketSegmentation(productData)
  .then(result => {
    console.log('Segmentation Results:', result);
    result.segmentations.forEach((segment, index) => {
      console.log(`Segment ${index + 1}: ${segment.name} (${segment.winRate * 100}% match)`);
    });
  })
  .catch(error => {
    console.error('Failed to get segmentation:', error);
  });
```

### Python

```python
import requests
import json

def get_market_segmentation(product_data):
    url = "http://localhost:3001/api/product-optimize/suggestDataSegmentation"
    
    payload = {
        "title": product_data["title"],
        "description": product_data["description"],
        "images": product_data.get("images", []),
        "targetMarket": product_data["targetMarket"],
        "language": product_data["language"],
        "productType": product_data.get("productType"),
        "brandTone": product_data.get("brandTone"),
        "goals": product_data.get("goals", [])
    }
    
    headers = {
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=60)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error calling segmentation API: {e}")
        raise

# Sử dụng
product_data = {
    "title": "Bộ 4 nhẫn Punk Olivia Rodrigo",
    "description": "Bộ nhẫn phong cách punk...",
    "targetMarket": "vi",
    "language": "vi-VN",
    "productType": "Accessory",
    "brandTone": "Edgy & Confident",
    "goals": ["Increase Conversion Rate"]
}

try:
    result = get_market_segmentation(product_data)
    print("Segmentation Results:")
    for i, segment in enumerate(result["segmentations"]):
        print(f"Segment {i+1}: {segment['name']} ({segment['winRate']*100:.0f}% match)")
except Exception as e:
    print(f"Failed to get segmentation: {e}")
```

---

## 📊 Use Cases

### 1. **E-commerce Platform**
- Phân tích sản phẩm mới trước khi launch
- Xây dựng chiến lược marketing cho từng phân khúc
- Tối ưu hóa quảng cáo Facebook/Google Ads

### 2. **Marketing Agency**
- Nghiên cứu thị trường cho khách hàng
- Tạo persona cho chiến dịch quảng cáo
- Phát triển content strategy

### 3. **Product Manager**
- Hiểu rõ đối tượng khách hàng tiềm năng
- Định hướng phát triển sản phẩm
- Lập kế hoạch go-to-market

---

## 🚀 Best Practices

1. **Cung cấp thông tin đầy đủ**: Càng nhiều thông tin về sản phẩm, kết quả càng chính xác
2. **Sử dụng hình ảnh chất lượng**: AI có thể phân tích hình ảnh để hiểu rõ hơn về sản phẩm
3. **Xác định mục tiêu rõ ràng**: Goals giúp AI tập trung vào các phân khúc phù hợp
4. **Kết hợp với dữ liệu SEO**: Sử dụng keywordSuggestions với công cụ SEO để có dữ liệu chính xác
5. **Theo dõi và điều chỉnh**: Test với các sản phẩm khác nhau để tối ưu hóa kết quả

---

## 📞 Support

Nếu gặp vấn đề khi sử dụng API, vui lòng:
1. Kiểm tra format JSON request
2. Xác nhận tất cả trường bắt buộc đã được cung cấp
3. Kiểm tra kết nối mạng và timeout
4. Liên hệ team phát triển với thông tin lỗi chi tiết

---

*Documentation được cập nhật lần cuối: 2025-10-22*

