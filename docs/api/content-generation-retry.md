# API: Content Generation với Retry/Optimize

## Tổng quan

API `/generate-content-from-segmentation` hỗ trợ tính năng **Retry/Optimize** cho phép tạo lại nội dung sản phẩm với chất lượng tốt hơn dựa trên kết quả lần trước.

## Endpoint

```
POST /api/product-optimize/generate-content-from-segmentation
```

## Request Format

### Lần gọi đầu tiên (Generate mới)

```json
{
  "title": "Áo Thun Unisex Đen",
  "description": "Mô tả sản phẩm ban đầu...",
  "images": ["https://example.com/image1.jpg", "https://example.com/image2.jpg"],
  "productImages": ["https://example.com/image1.jpg"], // Alternative field name
  "segmentation": {
    "name": "Người trẻ năng động",
    "painpoints": {
      "primary": "Cần quần áo thoải mái cho hoạt động hàng ngày",
      "secondary": ["Giá cả hợp lý", "Dễ phối đồ"]
    },
    "personaProfile": {
      "demographics": "18-30 tuổi, sinh viên, nhân viên văn phòng",
      "behaviors": "Thích phong cách streetwear, mua sắm online",
      "motivations": "Thể hiện cá tính, tự do trong phong cách"
    },
    "productBenefits": [
      "Chất liệu cotton mềm mại, thoáng khí",
      "Thiết kế unisex phù hợp mọi phong cách"
    ],
    "toneType": "Thân thiện, trẻ trung",
    "voiceGuideline": "Gần gũi, không quá formal",
    "keywordSuggestions": ["áo thun", "streetwear", "unisex"],
    "locations": ["Hà Nội", "TP.HCM"]
  },
  "targetMarket": "vi",
  "language": "vi-VN"
}
```

### Lần gọi thứ hai (Retry/Optimize)

```json
{
  "title": "Áo Thun Unisex Đen",
  "description": "Mô tả sản phẩm ban đầu...",
  "images": ["https://example.com/image1.jpg", "https://example.com/image2.jpg"],
  "segmentation": {
    // ... giữ nguyên segmentation data như lần đầu
  },
  "targetMarket": "vi",
  "language": "vi-VN",
  "previousContent": {
    "title": "Áo Thun Unisex Đen - Phong Cách Tự Do Cho Giới Trẻ",
    "description": "<article class='product-description'>...</article>"
  }
}
```

## Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `title` | string | ✅ Yes | Tên sản phẩm gốc |
| `description` | string | ❌ No | Mô tả sản phẩm gốc |
| `images` | string[] | ❌ No | Danh sách URL hình ảnh sản phẩm |
| `productImages` | string[] | ❌ No | Alternative field name cho `images` |
| `segmentation` | object | ✅ Yes | Dữ liệu segmentation (persona, pain points, benefits, etc.) |
| `targetMarket` | string | ❌ No | Mã thị trường (default: "vi") |
| `language` | string | ❌ No | Mã ngôn ngữ (default: "vi-VN") |
| `previousContent` | object | ❌ No | **Chỉ dùng khi retry** - Nội dung đã generate lần trước |

### previousContent Object (khi retry)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | ✅ Yes | Title đã được generate từ lần trước |
| `description` | string | ✅ Yes | HTML description đã được generate từ lần trước |

## Response Format

### Success Response

```json
{
  "success": true,
  "data": {
    "title": "Áo Thun Unisex Đen - Phong Cách Tự Do Cho Giới Trẻ",
    "description": "<article class='product-description'>...</article>"
  }
}
```

### Error Response

```json
{
  "error": "Missing required fields: title and segmentation",
  "message": "Detailed error message"
}
```

## Cách hoạt động

### Lần gọi đầu tiên
- API nhận thông tin sản phẩm và segmentation
- AI tạo title và description mới hoàn toàn
- Trả về kết quả cho frontend

### Lần gọi retry (có `previousContent`)
- API nhận thông tin như lần đầu **+** `previousContent` từ lần trước
- AI được yêu cầu:
  - ✅ Tạo version **KHÁC BIỆT** hoàn toàn
  - ✅ **CẢI THIỆN** chất lượng so với lần trước
  - ✅ Tránh lặp lại từ ngữ, cấu trúc, góc tiếp cận
  - ✅ Tìm góc tiếp cận mới, emotional hooks mới
- Trả về version mới tốt hơn

## Ví dụ Implementation

### JavaScript/TypeScript

```typescript
interface GenerateContentRequest {
  title: string;
  description?: string;
  images?: string[];
  productImages?: string[];
  segmentation: SegmentationData;
  targetMarket?: string;
  language?: string;
  previousContent?: {
    title: string;
    description: string;
  };
}

interface GenerateContentResponse {
  success: boolean;
  data?: {
    title: string;
    description: string;
  };
  error?: string;
  message?: string;
}

// Lần gọi đầu tiên
async function generateContentFirstTime(
  productData: ProductData,
  segmentation: SegmentationData
): Promise<GenerateContentResponse> {
  const response = await fetch('/api/product-optimize/generate-content-from-segmentation', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: productData.title,
      description: productData.description,
      images: productData.images,
      segmentation: segmentation,
      targetMarket: 'vi',
      language: 'vi-VN',
    }),
  });

  return response.json();
}

// Lần gọi retry
async function retryGenerateContent(
  productData: ProductData,
  segmentation: SegmentationData,
  previousResult: { title: string; description: string }
): Promise<GenerateContentResponse> {
  const response = await fetch('/api/product-optimize/generate-content-from-segmentation', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: productData.title,
      description: productData.description,
      images: productData.images,
      segmentation: segmentation,
      targetMarket: 'vi',
      language: 'vi-VN',
      previousContent: {
        title: previousResult.title,
        description: previousResult.description,
      },
    }),
  });

  return response.json();
}
```

### React Component Example

```tsx
import { useState } from 'react';

function ContentGenerator() {
  const [generatedContent, setGeneratedContent] = useState<{
    title: string;
    description: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Generate lần đầu
  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/product-optimize/generate-content-from-segmentation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: product.title,
          description: product.description,
          images: product.images,
          segmentation: segmentationData,
          targetMarket: 'vi',
          language: 'vi-VN',
        }),
      });

      const result = await response.json();
      if (result.success) {
        setGeneratedContent(result.data);
      }
    } catch (error) {
      console.error('Error generating content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Retry với previousContent
  const handleRetry = async () => {
    if (!generatedContent) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/product-optimize/generate-content-from-segmentation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: product.title,
          description: product.description,
          images: product.images,
          segmentation: segmentationData,
          targetMarket: 'vi',
          language: 'vi-VN',
          previousContent: {
            title: generatedContent.title,
            description: generatedContent.description,
          },
        }),
      });

      const result = await response.json();
      if (result.success) {
        setGeneratedContent(result.data); // Update với version mới
      }
    } catch (error) {
      console.error('Error retrying content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <button onClick={handleGenerate} disabled={isLoading}>
        Generate Content
      </button>
      
      {generatedContent && (
        <>
          <div>
            <h3>Generated Title:</h3>
            <p>{generatedContent.title}</p>
            <div dangerouslySetInnerHTML={{ __html: generatedContent.description }} />
          </div>
          
          <button onClick={handleRetry} disabled={isLoading}>
            🔄 Retry / Optimize
          </button>
        </>
      )}
    </div>
  );
}
```

## Best Practices

### 1. Khi nào nên dùng Retry?
- ✅ Khi user không hài lòng với kết quả lần đầu
- ✅ Khi muốn có nhiều phiên bản để so sánh
- ✅ Khi cần cải thiện chất lượng content

### 2. Lưu ý quan trọng
- ⚠️ **Luôn giữ nguyên** `segmentation` data giữa lần đầu và retry
- ⚠️ **Luôn giữ nguyên** `title`, `description`, `images` gốc
- ⚠️ **Chỉ thay đổi** `previousContent` khi retry
- ⚠️ Mỗi lần retry sẽ tạo version **KHÁC BIỆT**, không phải chỉnh sửa version cũ

### 3. UX Recommendations
- Hiển thị loading state khi đang generate
- Cho phép user xem và so sánh các version
- Có thể retry nhiều lần (mỗi lần sẽ khác nhau)
- Lưu lại các version tốt để user có thể chọn

## Error Handling

```typescript
try {
  const response = await generateContent(data);
  
  if (!response.success) {
    if (response.error === 'Missing required fields: title and segmentation') {
      // Handle missing fields
    } else {
      // Handle other errors
      console.error('Error:', response.message);
    }
  }
} catch (error) {
  // Handle network errors
  console.error('Network error:', error);
}
```

## Testing

### Test Case 1: Generate lần đầu
```json
POST /api/product-optimize/generate-content-from-segmentation
{
  "title": "Test Product",
  "segmentation": { ... }
}
```
**Expected:** Trả về title và description mới

### Test Case 2: Retry với previousContent
```json
POST /api/product-optimize/generate-content-from-segmentation
{
  "title": "Test Product",
  "segmentation": { ... },
  "previousContent": {
    "title": "Previous Title",
    "description": "Previous Description"
  }
}
```
**Expected:** Trả về title và description **KHÁC** với previousContent

## Notes

- API này **backward compatible**: Nếu không có `previousContent`, sẽ hoạt động như generate lần đầu
- AI sẽ tự động phân tích và tạo version mới tốt hơn khi có `previousContent`
- Có thể retry nhiều lần, mỗi lần sẽ tạo version khác nhau

## Support

Nếu có vấn đề hoặc câu hỏi, vui lòng liên hệ backend team.

