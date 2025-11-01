# 📘 Product Optimize API Documentation

## 🌐 Overview

Product Optimize API cung cấp các công cụ AI để tối ưu hóa sản phẩm thương mại điện tử, bao gồm:
- ✅ Quản lý sản phẩm
- 🔍 Gợi ý keywords & phân khúc khách hàng
- ✨ Tối ưu hóa nội dung (SEO, copywriting)
- 📢 Tạo quảng cáo tự động (Facebook, Instagram, TikTok)

**Version:** 1.0.0  
**Base URL:** `https://api.tikminer.info` hoặc `http://your-server:3001`  
**API Prefix:** `/api/product-optimize`

---

## 🔐 Authentication

Hiện tại API chưa yêu cầu authentication. Trong production, bạn nên thêm API key hoặc JWT token.

**Khuyến nghị thêm header:**
```http
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json
```

---

## 📋 API Endpoints

### 1. Get All Products

Lấy danh sách tất cả sản phẩm.

**Endpoint:** `GET /api/product-optimize/products`

**Request:**
```bash
curl -X GET https://api.tikminer.info/api/product-optimize/products
```

**Response:** `200 OK`
```json
{
  "products": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "name": "Tên sản phẩm",
      "description": "Mô tả sản phẩm",
      "image_url": "https://example.com/image.jpg",
      "product_url": "https://shopee.vn/product",
      "status": "done",
      "analysis_result": null,
      "error_message": null,
      "created_at": "2025-10-15T00:00:00.000Z",
      "analyzed_at": null,
      "updated_at": "2025-10-15T00:00:00.000Z"
    }
  ]
}
```

---

### 2. Add New Product

Thêm sản phẩm mới vào hệ thống.

**Endpoint:** `POST /api/product-optimize/products`

**Request Body:**
```json
{
  "title": "Áo thun nam cotton 100%",
  "description": "Áo thun nam chất liệu cotton cao cấp, thoáng mát",
  "images": [
    "https://example.com/product-image.jpg"
  ]
}
```

**cURL Example:**
```bash
curl -X POST https://api.tikminer.info/api/product-optimize/products \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Áo thun nam cotton 100%",
    "description": "Áo thun nam chất liệu cotton cao cấp, thoáng mát",
    "images": ["https://example.com/product-image.jpg"]
  }'
```

**Response:** `200 OK`
```json
{
  "product": {
    "id": "clx123456",
    "user_id": "user-uuid",
    "name": "Áo thun nam cotton 100%",
    "description": "Áo thun nam chất liệu cotton cao cấp, thoáng mát",
    "image_url": "https://example.com/product-image.jpg",
    "status": "done",
    "created_at": "2025-10-15T00:00:00.000Z",
    "updated_at": "2025-10-15T00:00:00.000Z"
  }
}
```

---

### 3. Delete Product

Xóa sản phẩm khỏi hệ thống.

**Endpoint:** `DELETE /api/product-optimize/products/:id`

**Parameters:**
- `id` (string, required) - Product ID

**Request:**
```bash
curl -X DELETE https://api.tikminer.info/api/product-optimize/products/clx123456
```

**Response:** `200 OK`
```json
{
  "success": true
}
```

---

### 4. Get Suggest Data (Keywords & Segments)

AI phân tích sản phẩm và trả về keywords, phân khúc khách hàng, painpoints.

**Endpoint:** `POST /api/product-optimize/suggest-data`

**Request Body:**
```json
{
  "product_title": "Áo thun nam cotton 100%",
  "product_description": "Áo thun nam chất liệu cotton cao cấp, thoáng mát, form regular fit",
  "product_id": "clx123456"
}
```

**cURL Example:**
```bash
curl -X POST https://api.tikminer.info/api/product-optimize/suggest-data \
  -H "Content-Type: application/json" \
  -d '{
    "product_title": "Áo thun nam cotton 100%",
    "product_description": "Áo thun nam chất liệu cotton cao cấp",
    "product_id": "clx123456"
  }'
```

**Response:** `200 OK`
```json
{
  "keywords": {
    "informational": [
      {
        "keyword": "áo thun nam là gì",
        "volume": 1000,
        "cpc": 0.5,
        "competition": "Low"
      },
      {
        "keyword": "cách chọn áo thun nam",
        "volume": 800,
        "cpc": 0.6,
        "competition": "Medium"
      }
    ],
    "transactional": [
      {
        "keyword": "mua áo thun nam",
        "volume": 2000,
        "cpc": 1.5,
        "competition": "High"
      },
      {
        "keyword": "áo thun nam giá rẻ",
        "volume": 1500,
        "cpc": 1.2,
        "competition": "High"
      }
    ],
    "comparative": [
      {
        "keyword": "áo thun cotton vs polyester",
        "volume": 600,
        "cpc": 0.8,
        "competition": "Medium"
      }
    ],
    "painpoint_related": [
      {
        "keyword": "áo thun bị co rút",
        "volume": 500,
        "cpc": 0.7,
        "competition": "Low"
      }
    ]
  },
  "target_customers": [
    {
      "name": "Nam trẻ tuổi (18-25)",
      "common_painpoints": [
        "Khó tìm size phù hợp",
        "Lo lắng về chất lượng vải",
        "Muốn giá cả hợp lý"
      ],
      "market_share_percent": 35,
      "age_range": "18-25",
      "locations": ["Hà Nội", "TP.HCM", "Đà Nẵng"]
    },
    {
      "name": "Nam văn phòng (26-40)",
      "common_painpoints": [
        "Cần áo thoải mái cho môi trường công sở",
        "Quan tâm đến độ bền",
        "Muốn thiết kế thanh lịch"
      ],
      "market_share_percent": 45,
      "age_range": "26-40",
      "locations": ["TP.HCM", "Hà Nội", "Cần Thơ"]
    }
  ]
}
```

**Notes:**
- Kết quả sẽ được cache nếu có `product_id`
- Sử dụng AI model: `google/gemini-2.5-flash-preview-09-2025`
- Thời gian xử lý: ~5-15 giây

---

### 5. Optimize Content

Tối ưu hóa tiêu đề và mô tả sản phẩm dựa trên keywords, phân khúc khách hàng, hoặc painpoints.

**Endpoint:** `POST /api/product-optimize/optimize`

#### 5.1 Optimize by Keywords

**Request Body:**
```json
{
  "type": "keyword",
  "product_id": "clx123456",
  "data": {
    "product_title": "Áo thun nam cotton 100%",
    "product_description": "Áo thun nam chất liệu cotton cao cấp",
    "keywords": [
      "áo thun nam cotton",
      "áo thun form rộng",
      "áo thun basic"
    ],
    "tone": "professional"
  }
}
```

#### 5.2 Optimize by Segmentation

**Request Body:**
```json
{
  "type": "segmentation",
  "product_id": "clx123456",
  "data": {
    "product_title": "Áo thun nam cotton 100%",
    "product_description": "Áo thun nam chất liệu cotton cao cấp",
    "segment_data": {
      "name": "Nam văn phòng (26-40)",
      "age_range": "26-40",
      "locations": ["TP.HCM", "Hà Nội"],
      "common_painpoints": ["Cần áo thoải mái", "Quan tâm độ bền"]
    },
    "tone": "friendly"
  }
}
```

#### 5.3 Optimize by Painpoint

**Request Body:**
```json
{
  "type": "painpoint",
  "product_id": "clx123456",
  "data": {
    "product_title": "Áo thun nam cotton 100%",
    "product_description": "Áo thun nam chất liệu cotton cao cấp",
    "painpoint_data": {
      "painpoint": "Khó tìm áo thun không bị co rút sau giặt",
      "customer": "Nam văn phòng (26-40)"
    },
    "tone": "persuasive"
  }
}
```

**Tone Options:**
- `professional` - Chuyên nghiệp
- `friendly` - Thân thiện
- `persuasive` - Thuyết phục
- `casual` - Thoải mái

**cURL Example:**
```bash
curl -X POST https://api.tikminer.info/api/product-optimize/optimize \
  -H "Content-Type: application/json" \
  -d '{
    "type": "keyword",
    "product_id": "clx123456",
    "data": {
      "product_title": "Áo thun nam cotton 100%",
      "product_description": "Áo thun nam chất liệu cotton cao cấp",
      "keywords": ["áo thun nam cotton", "áo thun form rộng"],
      "tone": "professional"
    }
  }'
```

**Response:** `200 OK`
```json
{
  "new_title": "Áo Thun Nam Cotton 100% Cao Cấp - Form Rộng Thoải Mái, Thấm Hút Mồ Hôi",
  "new_description": "<div style='font-family: Arial, sans-serif; line-height: 1.6;'>\n  <h3 style='color: #333;'>🌟 Áo Thun Nam Cotton 100% - Sự Lựa Chọn Hoàn Hảo</h3>\n  \n  <p><strong>Chất liệu cao cấp:</strong> Cotton 100% tự nhiên, mềm mại, thoáng mát</p>\n  \n  <ul style='list-style: none; padding-left: 0;'>\n    <li>✅ Thấm hút mồ hôi tốt</li>\n    <li>✅ Không gây kích ứng da</li>\n    <li>✅ Form regular fit thoải mái</li>\n    <li>✅ Độ bền cao, không phai màu</li>\n  </ul>\n  \n  <img src='https://example.com/product-image.jpg' style='max-width: 100%; border-radius: 8px; margin: 15px 0;' alt='Áo thun nam cotton' />\n  \n  <h3 style='color: #333;'>💎 Đặc Điểm Nổi Bật</h3>\n  <p>Thiết kế basic dễ phối đồ, phù hợp cho mọi hoàn cảnh từ đi làm đến dạo phố.</p>\n</div>"
}
```

**Notes:**
- HTML description có responsive layout và CSS inline
- Nếu có `product_id`, sẽ embed hình ảnh sản phẩm vào description
- Sử dụng AI model: `openai/gpt-4o-mini`

---

### 6. Get Cached Suggest Data

Lấy dữ liệu suggest đã được cache trước đó.

**Endpoint:** `GET /api/product-optimize/suggest-cache/:productId`

**Parameters:**
- `productId` (string, required) - Product ID

**Request:**
```bash
curl -X GET https://api.tikminer.info/api/product-optimize/suggest-cache/clx123456
```

**Response:** `200 OK`
```json
{
  "keywords": { ... },
  "target_customers": [ ... ]
}
```

**Error Response:** `404 Not Found`
```json
{
  "error": "No cached data found"
}
```

---

### 7. Generate Ads

Tạo quảng cáo tự động cho Facebook, Instagram, TikTok.

**Endpoint:** `POST /api/product-optimize/generate-ads/:productId`

**Parameters:**
- `productId` (string, required) - Product ID

**Request Body:**
```json
{
  "platform": "facebook",
  "mode": "segment",
  "format": "carousel",
  "num_versions": 3,
  "language": "vi",
  "model": "openai/gpt-4o-mini",
  "data": {
    "segment_data": {
      "name": "Nam văn phòng (26-40)",
      "age_range": "26-40",
      "locations": ["TP.HCM", "Hà Nội"],
      "common_painpoints": [
        "Cần áo thoải mái cho công sở",
        "Quan tâm đến độ bền"
      ]
    }
  }
}
```

**Platform Options:**
- `facebook` - Facebook Ads
- `instagram` - Instagram Ads
- `tiktok` - TikTok Ads

**Mode Options:**
- `segment` - Dựa trên phân khúc khách hàng
- `painpoint` - Dựa trên painpoint
- `feature` - Dựa trên tính năng sản phẩm
- `keyword` - Dựa trên keywords

**Format Options:**
- Facebook/Instagram: `single_image`, `carousel`, `video`, `collection`
- TikTok: `video`, `spark_ads`, `top_view`

**Mode Data Examples:**

**Mode: segment**
```json
{
  "data": {
    "segment_data": {
      "name": "Nam văn phòng (26-40)",
      "age_range": "26-40",
      "locations": ["TP.HCM", "Hà Nội"],
      "common_painpoints": ["Cần áo thoải mái", "Quan tâm độ bền"]
    }
  }
}
```

**Mode: painpoint**
```json
{
  "data": {
    "painpoint_data": {
      "painpoint": "Áo thun bị co rút sau khi giặt",
      "customer": "Nam văn phòng (26-40)"
    }
  }
}
```

**Mode: feature**
```json
{
  "data": {
    "feature_data": {
      "problem": "Vải cotton tự nhiên 100%",
      "satisfaction_percent": 95
    }
  }
}
```

**Mode: keyword**
```json
{
  "data": {
    "keyword_data": {
      "keywords": ["áo thun nam cotton", "áo thun form rộng", "áo basic"]
    }
  }
}
```

**cURL Example:**
```bash
curl -X POST https://api.tikminer.info/api/product-optimize/generate-ads/clx123456 \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "facebook",
    "mode": "segment",
    "format": "carousel",
    "num_versions": 3,
    "language": "vi",
    "model": "openai/gpt-4o-mini",
    "data": {
      "segment_data": {
        "name": "Nam văn phòng (26-40)",
        "age_range": "26-40",
        "locations": ["TP.HCM", "Hà Nội"],
        "common_painpoints": ["Cần áo thoải mái"]
      }
    }
  }'
```

**Response:** `200 OK`

**Facebook/Instagram Response:**
```json
{
  "versions": [
    {
      "ad_headline": "Áo Thun Cotton 100% - Thoải Mái Cho Ngày Dài Văn Phòng",
      "ad_copy": "Bạn đang tìm kiếm một chiếc áo thun vừa thoải mái vừa thanh lịch cho môi trường công sở?\n\n✨ Cotton 100% tự nhiên\n🌬️ Thoáng mát cả ngày\n💼 Thiết kế thanh lịch\n🎯 Phù hợp cho nam 26-40 tuổi\n\nĐặc biệt dành cho những người đàn ông năng động, quan tâm đến chất lượng và sự thoải mái trong công việc.",
      "cta": "Mua Ngay - Ưu Đãi 20%",
      "expected_performance": "Dự kiến CTR 2.5-3.5% với targeting chính xác phân khúc nam văn phòng 26-40 tuổi tại TP.HCM và Hà Nội"
    },
    {
      "ad_headline": "Giải Pháp Áo Thun Hoàn Hảo Cho Dân Văn Phòng",
      "ad_copy": "Mệt mỏi với những chiếc áo không thoải mái suốt 8 tiếng làm việc?\n\n🎯 Cotton cao cấp - Độ bền vượt trội\n⚡ Form chuẩn - Dễ phối đồ\n💯 Đã được 10,000+ khách hàng tin dùng\n\nPhù hợp cho:\n✅ Đi làm hàng ngày\n✅ Gặp gỡ đối tác\n✅ Dạo phố cuối tuần",
      "cta": "Xem Thêm Mẫu Mã",
      "expected_performance": "Dự kiến conversion rate 1.8-2.5% với audience lookalike từ customers hiện tại"
    },
    {
      "ad_headline": "Áo Thun Premium - Đầu Tư Đáng Giá Cho Tủ Đồ",
      "ad_copy": "Chất lượng không bao giờ lỗi mốt! 🌟\n\n🔥 HOT DEAL: Giảm 30% cho 3 áo trở lên\n\n✨ Ưu điểm vượt trội:\n• Cotton 100% Organic\n• Kháng khuẩn tự nhiên\n• Không xù lông sau giặt\n• Giữ form sau nhiều lần sử dụng\n\nMiễn phí vận chuyển toàn quốc!\nĐổi trả trong 7 ngày!",
      "cta": "Nhận Ưu Đãi Ngay",
      "expected_performance": "Dự kiến ROAS 3.5-4.5 với retargeting audience đã xem sản phẩm"
    }
  ]
}
```

**TikTok Response:**
```json
{
  "versions": [
    {
      "ad_headline": "Áo Thun Cotton Đỉnh Cao Cho Dân Văn Phòng",
      "ad_copy": "Từng mệt mỏi với áo thun kém chất lượng? 😫\n\nĐã đến lúc nâng cấp tủ đồ! 🔥\n\n✨ Cotton 100% - Mềm mại như mây\n💼 Perfect cho office style\n⚡ 10,000+ anh em đã tin dùng\n\n#aothunnam #cotton #officestyle #fashion",
      "cta": "Xem Ngay",
      "ad_visual_idea": "Video 15s:\n- Scene 1 (3s): Close-up vải cotton mềm mại\n- Scene 2 (5s): Người mẫu mặc áo trong môi trường văn phòng hiện đại\n- Scene 3 (4s): Demo độ co giãn và thấm hút mồ hôi\n- Scene 4 (3s): CTA với text overlay 'Mua ngay - Giảm 30%'\n\nMusic: Upbeat, trendy\nTransition: Smooth cuts với trending effects",
      "expected_performance": "Dự kiến view rate 45-60% với TikTok targeting 25-40 tuổi, interests: Fashion, Lifestyle"
    }
  ]
}
```

**Notes:**
- Số lượng versions có thể từ 1-5
- TikTok ads bao gồm `ad_visual_idea` cho video script
- Model mặc định: `openai/gpt-4o-mini`
- Thời gian xử lý: ~10-20 giây

---

## 🔧 Error Handling

### Error Response Format

```json
{
  "error": "Error message description"
}
```

### Common HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad Request - Invalid parameters |
| 404 | Not Found - Resource not found |
| 500 | Internal Server Error |
| 503 | Service Unavailable - AI service error |

### Example Error Responses

**400 Bad Request:**
```json
{
  "error": "Invalid optimization type"
}
```

**404 Not Found:**
```json
{
  "error": "Product not found"
}
```

**500 Internal Server Error:**
```json
{
  "error": "OpenRouter API key not configured"
}
```

---

## 🚀 Integration Examples

### JavaScript/TypeScript

```typescript
const API_BASE_URL = 'https://api.tikminer.info';

// 1. Add Product
async function addProduct(title: string, description: string, images: string[]) {
  const response = await fetch(`${API_BASE_URL}/api/product-optimize/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title, description, images })
  });
  
  return await response.json();
}

// 2. Get Suggestions
async function getSuggestions(productTitle: string, productDescription: string, productId?: string) {
  const response = await fetch(`${API_BASE_URL}/api/product-optimize/suggest-data`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      product_title: productTitle,
      product_description: productDescription,
      product_id: productId
    })
  });
  
  return await response.json();
}

// 3. Optimize Content
async function optimizeContent(type: 'keyword' | 'segmentation' | 'painpoint', data: any) {
  const response = await fetch(`${API_BASE_URL}/api/product-optimize/optimize`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ type, data })
  });
  
  return await response.json();
}

// 4. Generate Ads
async function generateAds(productId: string, options: {
  platform: 'facebook' | 'instagram' | 'tiktok';
  mode: 'segment' | 'painpoint' | 'feature' | 'keyword';
  format: string;
  num_versions: number;
  language: string;
  data: any;
}) {
  const response = await fetch(`${API_BASE_URL}/api/product-optimize/generate-ads/${productId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(options)
  });
  
  return await response.json();
}

// Usage Example
async function completeWorkflow() {
  // Step 1: Add product
  const product = await addProduct(
    'Áo thun nam cotton 100%',
    'Áo thun nam chất liệu cotton cao cấp',
    ['https://example.com/image.jpg']
  );
  
  console.log('Product created:', product);
  
  // Step 2: Get suggestions
  const suggestions = await getSuggestions(
    product.product.name,
    product.product.description,
    product.product.id
  );
  
  console.log('Suggestions:', suggestions);
  
  // Step 3: Optimize content with keywords
  const optimized = await optimizeContent('keyword', {
    product_title: product.product.name,
    product_description: product.product.description,
    keywords: suggestions.keywords.transactional.slice(0, 3).map(k => k.keyword),
    tone: 'professional'
  });
  
  console.log('Optimized content:', optimized);
  
  // Step 4: Generate Facebook ads
  const ads = await generateAds(product.product.id, {
    platform: 'facebook',
    mode: 'segment',
    format: 'carousel',
    num_versions: 3,
    language: 'vi',
    data: {
      segment_data: suggestions.target_customers[0]
    }
  });
  
  console.log('Generated ads:', ads);
}
```

### Python

```python
import requests
import json

API_BASE_URL = 'https://api.tikminer.info'

class ProductOptimizeAPI:
    def __init__(self, base_url: str = API_BASE_URL):
        self.base_url = base_url
        self.headers = {'Content-Type': 'application/json'}
    
    def add_product(self, title: str, description: str, images: list):
        """Add new product"""
        url = f"{self.base_url}/api/product-optimize/products"
        data = {
            "title": title,
            "description": description,
            "images": images
        }
        response = requests.post(url, json=data, headers=self.headers)
        return response.json()
    
    def get_suggestions(self, product_title: str, product_description: str, product_id: str = None):
        """Get AI suggestions for keywords and segments"""
        url = f"{self.base_url}/api/product-optimize/suggest-data"
        data = {
            "product_title": product_title,
            "product_description": product_description
        }
        if product_id:
            data["product_id"] = product_id
        
        response = requests.post(url, json=data, headers=self.headers)
        return response.json()
    
    def optimize_content(self, opt_type: str, data: dict):
        """Optimize product content"""
        url = f"{self.base_url}/api/product-optimize/optimize"
        payload = {
            "type": opt_type,
            "data": data
        }
        response = requests.post(url, json=payload, headers=self.headers)
        return response.json()
    
    def generate_ads(self, product_id: str, platform: str, mode: str, 
                     format: str, num_versions: int, language: str, data: dict):
        """Generate ads for product"""
        url = f"{self.base_url}/api/product-optimize/generate-ads/{product_id}"
        payload = {
            "platform": platform,
            "mode": mode,
            "format": format,
            "num_versions": num_versions,
            "language": language,
            "data": data
        }
        response = requests.post(url, json=payload, headers=self.headers)
        return response.json()

# Usage
api = ProductOptimizeAPI()

# Add product
product = api.add_product(
    title="Áo thun nam cotton 100%",
    description="Áo thun nam chất liệu cotton cao cấp",
    images=["https://example.com/image.jpg"]
)

print("Product created:", product)

# Get suggestions
suggestions = api.get_suggestions(
    product_title=product['product']['name'],
    product_description=product['product']['description'],
    product_id=product['product']['id']
)

print("Keywords:", len(suggestions['keywords']['transactional']))
print("Target segments:", len(suggestions['target_customers']))

# Optimize content
optimized = api.optimize_content('keyword', {
    "product_title": product['product']['name'],
    "product_description": product['product']['description'],
    "keywords": [k['keyword'] for k in suggestions['keywords']['transactional'][:3]],
    "tone": "professional"
})

print("Optimized title:", optimized['new_title'])

# Generate ads
ads = api.generate_ads(
    product_id=product['product']['id'],
    platform='facebook',
    mode='segment',
    format='carousel',
    num_versions=3,
    language='vi',
    data={
        "segment_data": suggestions['target_customers'][0]
    }
)

print(f"Generated {len(ads['versions'])} ad versions")
```

### PHP

```php
<?php

class ProductOptimizeAPI {
    private $baseUrl;
    
    public function __construct($baseUrl = 'https://api.tikminer.info') {
        $this->baseUrl = $baseUrl;
    }
    
    private function request($method, $endpoint, $data = null) {
        $ch = curl_init();
        $url = $this->baseUrl . $endpoint;
        
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        
        if ($method === 'POST') {
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        } elseif ($method === 'DELETE') {
            curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'DELETE');
        }
        
        $response = curl_exec($ch);
        curl_close($ch);
        
        return json_decode($response, true);
    }
    
    public function addProduct($title, $description, $images) {
        return $this->request('POST', '/api/product-optimize/products', [
            'title' => $title,
            'description' => $description,
            'images' => $images
        ]);
    }
    
    public function getSuggestions($productTitle, $productDescription, $productId = null) {
        $data = [
            'product_title' => $productTitle,
            'product_description' => $productDescription
        ];
        
        if ($productId) {
            $data['product_id'] = $productId;
        }
        
        return $this->request('POST', '/api/product-optimize/suggest-data', $data);
    }
    
    public function optimizeContent($type, $data) {
        return $this->request('POST', '/api/product-optimize/optimize', [
            'type' => $type,
            'data' => $data
        ]);
    }
    
    public function generateAds($productId, $options) {
        return $this->request('POST', "/api/product-optimize/generate-ads/{$productId}", $options);
    }
}

// Usage
$api = new ProductOptimizeAPI();

// Add product
$product = $api->addProduct(
    'Áo thun nam cotton 100%',
    'Áo thun nam chất liệu cotton cao cấp',
    ['https://example.com/image.jpg']
);

echo "Product ID: " . $product['product']['id'] . "\n";

// Get suggestions
$suggestions = $api->getSuggestions(
    $product['product']['name'],
    $product['product']['description'],
    $product['product']['id']
);

echo "Keywords: " . count($suggestions['keywords']['transactional']) . "\n";

// Optimize content
$optimized = $api->optimizeContent('keyword', [
    'product_title' => $product['product']['name'],
    'product_description' => $product['product']['description'],
    'keywords' => array_column(array_slice($suggestions['keywords']['transactional'], 0, 3), 'keyword'),
    'tone' => 'professional'
]);

echo "New title: " . $optimized['new_title'] . "\n";

// Generate ads
$ads = $api->generateAds($product['product']['id'], [
    'platform' => 'facebook',
    'mode' => 'segment',
    'format' => 'carousel',
    'num_versions' => 3,
    'language' => 'vi',
    'data' => [
        'segment_data' => $suggestions['target_customers'][0]
    ]
]);

echo "Generated " . count($ads['versions']) . " ad versions\n";
?>
```

---

## 📊 Rate Limiting

Hiện tại chưa có rate limiting. Khuyến nghị:
- **Development:** 100 requests/hour
- **Production:** 1000 requests/hour
- **Enterprise:** Unlimited

---

## 🔒 Security Best Practices

### For API Consumers

1. **HTTPS Only:** Luôn sử dụng HTTPS trong production
2. **API Key:** Store API key trong environment variables
3. **Input Validation:** Validate dữ liệu trước khi gửi
4. **Error Handling:** Handle timeout và network errors

### For API Providers

1. **Add Authentication:** Implement API key hoặc OAuth
2. **Rate Limiting:** Giới hạn số requests
3. **Input Sanitization:** Sanitize user inputs
4. **CORS Configuration:** Restrict allowed origins
5. **Logging:** Log tất cả requests cho audit

---

## 💰 AI Model Costs

API sử dụng OpenRouter để gọi các AI models:

| Feature | Model | Cost per request* |
|---------|-------|-------------------|
| Suggest Data | google/gemini-2.5-flash-preview-09-2025 | ~$0.01-0.02 |
| Optimize Content | openai/gpt-4o-mini | ~$0.005-0.01 |
| Generate Ads | openai/gpt-4o-mini | ~$0.01-0.02 |

*Giá ước tính, tùy thuộc vào độ dài input/output

---

## 🆘 Support & Contact

- **Documentation:** https://github.com/your-repo/docs
- **Issues:** https://github.com/your-repo/issues
- **Email:** support@tikminer.info
- **Website:** https://tikminer.info

---

## 📝 Changelog

### Version 1.0.0 (2025-10-15)
- ✅ Initial release
- ✅ Product management endpoints
- ✅ AI suggestions for keywords & segments
- ✅ Content optimization
- ✅ Ads generation for Facebook, Instagram, TikTok

---

## 📄 License

Copyright © 2025 TikMiner. All rights reserved.

---

**Last Updated:** 2025-10-15  
**API Version:** 1.0.0  
**Status:** 🟢 Active

