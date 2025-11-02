# Quick Start - Virtual Try-On API

## 🚀 Cách sử dụng nhanh

### 1. Endpoint
```
POST http://localhost:3001/api/images/tryon
```

### 2. Request đơn giản nhất

**cURL:**
```bash
curl -X POST http://localhost:3001/api/images/tryon \
  -F "userImage=@user.jpg" \
  -F "productImageUrl=https://example.com/product.jpg"
```

**JavaScript:**
```javascript
const formData = new FormData();
formData.append('userImage', userImageFile);
formData.append('productImageUrl', 'https://example.com/product.jpg');

fetch('http://localhost:3001/api/images/tryon', {
  method: 'POST',
  body: formData
})
.then(response => response.json())
.then(data => {
  if (data.success) {
    console.log('Generated image:', data.generatedImageUrl);
  } else {
    console.error('Error:', data.error);
  }
});
```

### 3. Response
```json
{
  "success": true,
  "generatedImageUrl": "data:image/jpeg;base64,/9j/4AAQ...",
  "message": "Virtual try-on generated successfully!"
}
```

### 4. Test ngay
Mở file `test-api-example.html` trong browser để test API trực tiếp.

## 📋 Required Fields
- `userImage` (file): Ảnh người dùng
- Một trong hai:
  - `productImage` (file): Ảnh sản phẩm
  - `productImageUrl` (string): URL ảnh sản phẩm

## 📋 Optional Fields
- `productTitle`: Tên sản phẩm
- `customPrompt`: Mô tả tùy chỉnh
- `Authorization`: Bearer token (để trừ credit)

## ⚠️ Lưu ý
- Ảnh tối đa 10MB
- Hỗ trợ: JPG, PNG, WebP, GIF
- Output: Base64 data URL




















