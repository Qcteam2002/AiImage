# API: Generate Feature Highlights

## Tổng quan

API này tạo ra các "Feature Highlights" cho sản phẩm - mỗi highlight bao gồm:
- **Title**: Tiêu đề hấp dẫn về tính năng/lợi ích
- **Description**: Mô tả thuyết phục, cá nhân hóa cho persona
- **Image**: URL hình ảnh phù hợp nhất để showcase tính năng đó

API sẽ phân tích tất cả hình ảnh sản phẩm và tự động chọn hình ảnh phù hợp nhất cho mỗi highlight.

## Endpoint

```
POST /api/product-optimize/generate-feature-highlights
```

## Request Format

### Request Body

```json
{
  "productTitle": "Áo Thun Unisex Đen - Streetwear",
  "productDescription": "Áo thun unisex chất lượng cao, phong cách streetwear...",
  "images": [
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg",
    "https://example.com/image3.jpg"
  ],
  "segmentation": {
    "name": "Người trẻ năng động",
    "painpoints": {
      "primary": "Cần quần áo thoải mái cho hoạt động hàng ngày",
      "secondary": ["Giá cả hợp lý", "Dễ phối đồ"]
    },
    "productBenefits": [
      "Chất liệu cotton mềm mại, thoáng khí",
      "Thiết kế unisex phù hợp mọi phong cách",
      "Dễ giặt, không bị phai màu"
    ],
    "toneType": "Thân thiện, trẻ trung",
    "voiceGuideline": "Gần gũi, không quá formal",
    "keywordSuggestions": [
      "áo thun",
      "streetwear",
      "unisex",
      "thời trang nam nữ"
    ]
  },
  "language": "vi-VN",
  "targetMarket": "vi"
}
```

### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `productTitle` | string | ✅ Yes | Tên sản phẩm |
| `productDescription` | string | ❌ No | Mô tả sản phẩm (có thể để trống) |
| `images` | string[] \| object[] | ✅ Yes | Danh sách hình ảnh sản phẩm (ít nhất 1 ảnh) |
| `productImages` | string[] \| object[] | ❌ No | Alternative field name cho `images` |
| `segmentation` | object | ✅ Yes | Dữ liệu segmentation (persona, pain points, benefits) |
| `language` | string | ❌ No | Mã ngôn ngữ (default: "vi-VN") |
| `targetMarket` | string | ❌ No | Mã thị trường (default: "vi") |

### Images Format

API hỗ trợ 2 format cho images:

**Format 1: Array of strings**
```json
{
  "images": [
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg"
  ]
}
```

**Format 2: Array of objects**
```json
{
  "images": [
    { "url": "https://example.com/image1.jpg" },
    { "src": "https://example.com/image2.jpg" }
  ]
}
```

API sẽ tự động extract URL từ cả 2 format.

### Segmentation Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | ✅ Yes | Tên persona/customer segment |
| `painpoints` | object \| string | ❌ No | Pain points (hỗ trợ cả object và string) |
| `painpoints.primary` | string | ❌ No | Pain point chính (nếu dùng object) |
| `painpoints.secondary` | string[] | ❌ No | Pain points phụ (nếu dùng object) |
| `painpoint` | string | ❌ No | Old format - pain point dạng string |
| `productBenefits` | string[] | ❌ No | Danh sách lợi ích sản phẩm |
| `toneType` | string | ❌ No | Tone của content (ví dụ: "Thân thiện, trẻ trung") |
| `voiceGuideline` | string | ❌ No | Hướng dẫn về voice/style |
| `keywordSuggestions` | string[] | ❌ No | Keywords để tích hợp vào content |

## Response Format

### Success Response

```json
{
  "success": true,
  "data": [
    {
      "title": "Chất Liệu Cotton Mềm Mại, Thoáng Khí",
      "description": "Áo thun được làm từ 100% cotton cao cấp, mang lại cảm giác mềm mại và thoáng khí khi mặc. Là người trẻ năng động, bạn sẽ cảm thấy thoải mái suốt cả ngày dù có hoạt động nhiều. Chất liệu này giúp thấm hút mồ hôi tốt, giữ cho bạn luôn khô ráo và tự tin.",
      "image": "https://example.com/image1.jpg"
    },
    {
      "title": "Thiết Kế Unisex - Phù Hợp Mọi Phong Cách",
      "description": "Với thiết kế unisex hiện đại, áo thun này phù hợp cho cả nam và nữ. Bạn có thể dễ dàng phối với nhiều trang phục khác nhau, từ quần jean đến chân váy, tạo nên phong cách streetwear cá tính. Không cần lo lắng về việc chọn size hay phối đồ - sản phẩm này giúp bạn tự do thể hiện phong cách.",
      "image": "https://example.com/image2.jpg"
    },
    {
      "title": "Dễ Giặt, Không Bị Phai Màu",
      "description": "Áo thun được xử lý công nghệ chống phai màu, giữ nguyên màu sắc sau nhiều lần giặt. Là người bận rộn, bạn sẽ tiết kiệm được thời gian và công sức trong việc bảo quản. Chỉ cần giặt máy bình thường, sản phẩm vẫn giữ được chất lượng và màu sắc như mới.",
      "image": "https://example.com/image3.jpg"
    }
  ]
}
```

### Response Structure

Mỗi item trong array `data` có cấu trúc:

| Field | Type | Description |
|-------|------|-------------|
| `title` | string | Tiêu đề highlight (5-10 từ) |
| `description` | string | Mô tả chi tiết (2-3 câu) |
| `image` | string | URL hình ảnh được AI chọn để showcase tính năng này |

**Lưu ý:**
- Số lượng highlights: **2-4 items** (AI tự quyết định dựa trên sản phẩm)
- Image URL phải là một trong các URL đã gửi trong request
- Tất cả text đều bằng ngôn ngữ được chỉ định trong `language`

### Error Response

```json
{
  "error": "Missing required fields: productTitle, segmentation, and at least one image.",
  "message": "Detailed error message"
}
```

**HTTP Status Codes:**
- `400`: Missing required fields
- `500`: Server error hoặc lỗi parse AI response

## Code Examples

### JavaScript/TypeScript

```typescript
interface FeatureHighlight {
  title: string;
  description: string;
  image: string;
}

interface GenerateFeatureHighlightsRequest {
  productTitle: string;
  productDescription?: string;
  images: string[] | Array<{ url?: string; src?: string }>;
  segmentation: {
    name: string;
    painpoints?: {
      primary?: string;
      secondary?: string[];
    } | string;
    productBenefits?: string[];
    toneType?: string;
    voiceGuideline?: string;
    keywordSuggestions?: string[];
  };
  language?: string;
  targetMarket?: string;
}

interface GenerateFeatureHighlightsResponse {
  success: boolean;
  data?: FeatureHighlight[];
  error?: string;
  message?: string;
}

async function generateFeatureHighlights(
  request: GenerateFeatureHighlightsRequest
): Promise<GenerateFeatureHighlightsResponse> {
  try {
    const response = await fetch('/api/product-optimize/generate-feature-highlights', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || error.error || 'Failed to generate feature highlights');
    }

    return await response.json();
  } catch (error) {
    console.error('Error generating feature highlights:', error);
    throw error;
  }
}

// Usage
const result = await generateFeatureHighlights({
  productTitle: 'Áo Thun Unisex Đen',
  productDescription: 'Áo thun chất lượng cao...',
  images: [
    'https://example.com/image1.jpg',
    'https://example.com/image2.jpg',
  ],
  segmentation: {
    name: 'Người trẻ năng động',
    painpoints: {
      primary: 'Cần quần áo thoải mái',
      secondary: ['Giá cả hợp lý']
    },
    productBenefits: [
      'Chất liệu cotton mềm mại',
      'Thiết kế unisex'
    ],
    toneType: 'Thân thiện, trẻ trung',
    keywordSuggestions: ['áo thun', 'streetwear']
  },
  language: 'vi-VN',
  targetMarket: 'vi'
});

if (result.success && result.data) {
  console.log(`Generated ${result.data.length} feature highlights`);
  result.data.forEach((highlight, index) => {
    console.log(`${index + 1}. ${highlight.title}`);
    console.log(`   Image: ${highlight.image}`);
  });
}
```

### React Component Example

```tsx
import { useState } from 'react';

interface FeatureHighlight {
  title: string;
  description: string;
  image: string;
}

function FeatureHighlightsGenerator() {
  const [highlights, setHighlights] = useState<FeatureHighlight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/product-optimize/generate-feature-highlights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productTitle: product.title,
          productDescription: product.description,
          images: product.images, // Array of image URLs
          segmentation: {
            name: selectedSegmentation.name,
            painpoints: selectedSegmentation.painpoints,
            productBenefits: selectedSegmentation.productBenefits,
            toneType: selectedSegmentation.toneType,
            voiceGuideline: selectedSegmentation.voiceGuideline,
            keywordSuggestions: selectedSegmentation.keywordSuggestions,
          },
          language: 'vi-VN',
          targetMarket: 'vi',
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || result.error || 'Failed to generate highlights');
      }

      if (result.success && result.data) {
        setHighlights(result.data);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="feature-highlights-generator">
      <button 
        onClick={handleGenerate} 
        disabled={isLoading}
        className="generate-button"
      >
        {isLoading ? 'Generating...' : 'Generate Feature Highlights'}
      </button>

      {error && (
        <div className="error-message">
          ❌ {error}
        </div>
      )}

      {highlights.length > 0 && (
        <div className="highlights-list">
          <h3>Generated Highlights ({highlights.length})</h3>
          {highlights.map((highlight, index) => (
            <div key={index} className="highlight-item">
              <div className="highlight-image">
                <img 
                  src={highlight.image} 
                  alt={highlight.title}
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder-image.jpg';
                  }}
                />
              </div>
              <div className="highlight-content">
                <h4>{highlight.title}</h4>
                <p>{highlight.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### Vue.js Example

```vue
<template>
  <div class="feature-highlights-generator">
    <button 
      @click="generateHighlights" 
      :disabled="isLoading"
    >
      {{ isLoading ? 'Generating...' : 'Generate Feature Highlights' }}
    </button>

    <div v-if="error" class="error">
      ❌ {{ error }}
    </div>

    <div v-if="highlights.length > 0" class="highlights">
      <h3>Generated Highlights ({{ highlights.length }})</h3>
      <div 
        v-for="(highlight, index) in highlights" 
        :key="index" 
        class="highlight-item"
      >
        <img :src="highlight.image" :alt="highlight.title" />
        <div>
          <h4>{{ highlight.title }}</h4>
          <p>{{ highlight.description }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface FeatureHighlight {
  title: string;
  description: string;
  image: string;
}

const highlights = ref<FeatureHighlight[]>([]);
const isLoading = ref(false);
const error = ref<string | null>(null);

const generateHighlights = async () => {
  isLoading.value = true;
  error.value = null;

  try {
    const response = await fetch('/api/product-optimize/generate-feature-highlights', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productTitle: product.value.title,
        images: product.value.images,
        segmentation: segmentation.value,
        language: 'vi-VN',
        targetMarket: 'vi',
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || result.error);
    }

    if (result.success && result.data) {
      highlights.value = result.data;
    }
  } catch (err: any) {
    error.value = err.message || 'An error occurred';
  } finally {
    isLoading.value = false;
  }
};
</script>
```

## Best Practices

### 1. Image URLs
- ✅ Đảm bảo tất cả image URLs đều accessible (public URLs)
- ✅ Sử dụng HTTPS URLs
- ✅ Gửi ít nhất 2-3 images để AI có nhiều lựa chọn
- ✅ Gửi images chất lượng cao, rõ ràng

### 2. Segmentation Data
- ✅ Cung cấp đầy đủ thông tin persona để AI tạo content cá nhân hóa
- ✅ Liệt kê rõ ràng product benefits
- ✅ Cung cấp keywords để tích hợp vào content

### 3. Error Handling
```typescript
try {
  const result = await generateFeatureHighlights(data);
  
  if (!result.success) {
    // Handle API error
    if (result.error === 'Missing required fields...') {
      // Show user-friendly message
      alert('Vui lòng điền đầy đủ thông tin sản phẩm');
    } else {
      // Handle other errors
      console.error('Error:', result.message);
    }
    return;
  }
  
  // Use result.data
  displayHighlights(result.data);
  
} catch (error) {
  // Handle network errors
  console.error('Network error:', error);
  alert('Không thể kết nối đến server. Vui lòng thử lại.');
}
```

### 4. Loading States
- Hiển thị loading indicator khi đang generate
- Disable button trong lúc đang xử lý
- Show progress nếu có thể

### 5. Display Results
- Hiển thị images với fallback nếu load lỗi
- Format description text đẹp (line breaks, spacing)
- Responsive design cho mobile

## Common Issues & Solutions

### Issue 1: "Missing required fields"
**Solution:** Kiểm tra:
- `productTitle` có giá trị không?
- `segmentation` object có tồn tại không?
- `images` array có ít nhất 1 item không?

### Issue 2: Image URLs không hợp lệ
**Solution:** 
- Đảm bảo URLs là public và accessible
- Kiểm tra CORS nếu cần
- Sử dụng HTTPS

### Issue 3: AI response không đúng format
**Solution:**
- API sẽ tự động retry và parse
- Nếu vẫn lỗi, kiểm tra logs trong console
- Có thể thử lại với nhiều images hơn

### Issue 4: Không có highlights nào được tạo
**Solution:**
- Kiểm tra xem có đủ thông tin segmentation không
- Đảm bảo có ít nhất 2 images
- Thử với product description chi tiết hơn

## Testing

### Test Case 1: Basic Request
```json
{
  "productTitle": "Test Product",
  "images": ["https://example.com/image.jpg"],
  "segmentation": {
    "name": "Test Persona"
  }
}
```
**Expected:** Trả về 2-4 feature highlights

### Test Case 2: Full Request
```json
{
  "productTitle": "Áo Thun",
  "productDescription": "Mô tả chi tiết...",
  "images": ["url1", "url2", "url3"],
  "segmentation": {
    "name": "Người trẻ",
    "painpoints": {"primary": "Cần thoải mái"},
    "productBenefits": ["Mềm mại", "Thoáng khí"],
    "keywordSuggestions": ["áo thun"]
  },
  "language": "vi-VN"
}
```
**Expected:** Trả về highlights với content tiếng Việt, có keywords

## Notes

- ⏱️ **Response Time:** Thường mất 10-30 giây tùy vào số lượng images
- 🖼️ **Image Selection:** AI tự động chọn image phù hợp nhất cho mỗi highlight
- 📝 **Content Quality:** Content được tối ưu cho persona và tích hợp keywords
- 🔄 **Retry:** Có thể gọi lại API nhiều lần để có các version khác nhau

## Support

Nếu có vấn đề hoặc câu hỏi, vui lòng liên hệ backend team hoặc check logs trong console.

