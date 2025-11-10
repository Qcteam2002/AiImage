# Quick Reference: Feature Highlights API

## Endpoint

```
POST /api/product-optimize/generate-feature-highlights
```

## Request

```json
{
  "productTitle": "Tên sản phẩm",
  "productDescription": "Mô tả (optional)",
  "images": ["url1", "url2", "url3"],
  "segmentation": {
    "name": "Tên persona",
    "painpoints": {"primary": "Pain point chính"},
    "productBenefits": ["Benefit 1", "Benefit 2"],
    "keywordSuggestions": ["keyword1", "keyword2"]
  },
  "language": "vi-VN",
  "targetMarket": "vi"
}
```

## Response

```json
{
  "success": true,
  "data": [
    {
      "title": "Tiêu đề highlight",
      "description": "Mô tả chi tiết",
      "image": "https://url-to-image.jpg"
    }
  ]
}
```

## Code Example

```typescript
const response = await fetch('/api/product-optimize/generate-feature-highlights', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    productTitle: 'Áo Thun Unisex',
    images: ['https://example.com/img1.jpg', 'https://example.com/img2.jpg'],
    segmentation: {
      name: 'Người trẻ năng động',
      painpoints: { primary: 'Cần thoải mái' },
      productBenefits: ['Mềm mại', 'Thoáng khí'],
      keywordSuggestions: ['áo thun', 'streetwear']
    },
    language: 'vi-VN'
  })
});

const result = await response.json();
if (result.success) {
  console.log(result.data); // Array of highlights
}
```

## Required Fields

- ✅ `productTitle` (string)
- ✅ `images` (array, min 1 item)
- ✅ `segmentation` (object with `name`)

## Response Structure

Mỗi highlight có:
- `title`: Tiêu đề (5-10 từ)
- `description`: Mô tả (2-3 câu)
- `image`: URL image được AI chọn

## Notes

- Số lượng highlights: **2-4 items** (AI tự quyết định)
- Image URLs phải là public và accessible
- Tất cả text theo `language` được chỉ định
- Response time: ~10-30 giây

## Full Documentation

Xem `feature-highlights-api.md` để biết chi tiết đầy đủ.

