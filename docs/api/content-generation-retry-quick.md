# Quick Reference: Content Generation Retry API

## TL;DR

API hỗ trợ retry để tạo lại content tốt hơn. Chỉ cần thêm field `previousContent` vào request body.

## Endpoint

```
POST /api/product-optimize/generate-content-from-segmentation
```

## Request Body

### Lần đầu (Generate mới)
```json
{
  "title": "...",
  "description": "...",
  "images": [...],
  "segmentation": {...}
}
```

### Lần retry (Optimize)
```json
{
  "title": "...",           // Giữ nguyên
  "description": "...",     // Giữ nguyên
  "images": [...],          // Giữ nguyên
  "segmentation": {...},    // Giữ nguyên
  "previousContent": {       // ⭐ THÊM FIELD NÀY
    "title": "Title từ lần trước",
    "description": "Description HTML từ lần trước"
  }
}
```

## Response

```json
{
  "success": true,
  "data": {
    "title": "New title",
    "description": "<article>...</article>"
  }
}
```

## Code Example

```typescript
// Lần đầu
const firstResult = await fetch('/api/product-optimize/generate-content-from-segmentation', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: product.title,
    images: product.images,
    segmentation: segmentationData,
  }),
}).then(r => r.json());

// Retry
const retryResult = await fetch('/api/product-optimize/generate-content-from-segmentation', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: product.title,        // Giữ nguyên
    images: product.images,       // Giữ nguyên
    segmentation: segmentationData, // Giữ nguyên
    previousContent: {            // ⭐ Thêm field này
      title: firstResult.data.title,
      description: firstResult.data.description,
    },
  }),
}).then(r => r.json());
```

## Lưu ý

- ✅ `previousContent` là **optional** - không có thì generate bình thường
- ✅ Giữ nguyên tất cả data khác khi retry
- ✅ Mỗi lần retry sẽ tạo version **KHÁC** và **TỐT HƠN**
- ✅ Có thể retry nhiều lần

## Full Documentation

Xem file `content-generation-retry.md` để biết chi tiết đầy đủ.

