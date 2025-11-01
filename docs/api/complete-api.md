# Virtual Try-On API Documentation

## Overview
API này cho phép tạo ảnh virtual try-on bằng cách kết hợp ảnh người dùng và ảnh sản phẩm quần áo.

## Base URL
```
http://localhost:3001/api/images
```

## Endpoint

### POST /tryon
Tạo ảnh virtual try-on từ ảnh người dùng và ảnh sản phẩm.

**URL:** `POST /api/images/tryon`

**Authentication:** Optional (Bearer Token)
- Nếu có token: sẽ trừ credit và lưu vào database
- Nếu không có token: chỉ tạo ảnh, không lưu database

## Request Format

### Headers
```
Content-Type: multipart/form-data
Authorization: Bearer <your-jwt-token> (optional)
```

### Body (multipart/form-data)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `userImage` | File | Yes | Ảnh người dùng (JPG, PNG, WebP, GIF) |
| `productImage` | File | No | Ảnh sản phẩm (nếu không có thì dùng productImageUrl) |
| `productImageUrl` | String | No | URL ảnh sản phẩm (nếu không có file upload) |
| `productTitle` | String | No | Tên sản phẩm (tối đa 200 ký tự) |
| `customPrompt` | String | No | Prompt tùy chỉnh (tối đa 1000 ký tự) |

**Lưu ý:** Phải có ít nhất một trong hai: `productImage` (file) hoặc `productImageUrl` (URL)

## Response Format

### Success Response (200)
```json
{
  "success": true,
  "generatedImageUrl": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
  "message": "Virtual try-on generated successfully!",
  "creditsRemaining": 9
}
```

### Error Response (400/500)
```json
{
  "success": false,
  "error": "Error message description"
}
```

## Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `success` | Boolean | Trạng thái thành công/thất bại |
| `generatedImageUrl` | String | URL ảnh kết quả (base64 data URL) |
| `message` | String | Thông báo mô tả |
| `creditsRemaining` | Number | Số credit còn lại (chỉ có khi có authentication) |

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Thiếu dữ liệu đầu vào |
| 500 | Internal Server Error - Lỗi server |

## Examples

### 1. Upload với file (có authentication)

**cURL:**
```bash
curl -X POST http://localhost:3001/api/images/tryon \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "userImage=@/path/to/user.jpg" \
  -F "productImage=@/path/to/product.jpg" \
  -F "productTitle=Red T-Shirt" \
  -F "customPrompt=Make it look casual and stylish"
```

**JavaScript (fetch):**
```javascript
const formData = new FormData();
formData.append('userImage', userImageFile);
formData.append('productImage', productImageFile);
formData.append('productTitle', 'Red T-Shirt');
formData.append('customPrompt', 'Make it look casual and stylish');

const response = await fetch('http://localhost:3001/api/images/tryon', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  },
  body: formData
});

const result = await response.json();
console.log(result);
```

### 2. Upload với URL sản phẩm (không authentication)

**cURL:**
```bash
curl -X POST http://localhost:3001/api/images/tryon \
  -F "userImage=@/path/to/user.jpg" \
  -F "productImageUrl=https://example.com/product.jpg" \
  -F "productTitle=Blue Jeans"
```

**JavaScript (fetch):**
```javascript
const formData = new FormData();
formData.append('userImage', userImageFile);
formData.append('productImageUrl', 'https://example.com/product.jpg');
formData.append('productTitle', 'Blue Jeans');

const response = await fetch('http://localhost:3001/api/images/tryon', {
  method: 'POST',
  body: formData
});

const result = await response.json();
console.log(result);
```

### 3. React Native Example

```javascript
import { launchImageLibrary } from 'react-native-image-picker';

const createVirtualTryOn = async () => {
  // Select user image
  const userImageResult = await launchImageLibrary({
    mediaType: 'photo',
    quality: 0.8,
  });

  if (userImageResult.assets && userImageResult.assets[0]) {
    const userImage = userImageResult.assets[0];
    
    const formData = new FormData();
    formData.append('userImage', {
      uri: userImage.uri,
      type: userImage.type,
      name: userImage.fileName || 'user.jpg',
    });
    formData.append('productImageUrl', 'https://example.com/product.jpg');
    formData.append('productTitle', 'Fashion T-Shirt');

    try {
      const response = await fetch('http://localhost:3001/api/images/tryon', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const result = await response.json();
      
      if (result.success) {
        // Hiển thị ảnh kết quả
        setGeneratedImage(result.generatedImageUrl);
      } else {
        console.error('Error:', result.error);
      }
    } catch (error) {
      console.error('Network error:', error);
    }
  }
};
```

### 4. Python Example

```python
import requests

def create_virtual_tryon(user_image_path, product_image_url, product_title="", custom_prompt=""):
    url = "http://localhost:3001/api/images/tryon"
    
    with open(user_image_path, 'rb') as user_file:
        files = {
            'userImage': user_file
        }
        data = {
            'productImageUrl': product_image_url,
            'productTitle': product_title,
            'customPrompt': custom_prompt
        }
        
        response = requests.post(url, files=files, data=data)
        return response.json()

# Usage
result = create_virtual_tryon(
    user_image_path="/path/to/user.jpg",
    product_image_url="https://example.com/product.jpg",
    product_title="Red T-Shirt",
    custom_prompt="Make it look professional"
)

if result['success']:
    print("Generated image URL:", result['generatedImageUrl'])
else:
    print("Error:", result['error'])
```

## Image Requirements

### Supported Formats
- **Input:** JPG, PNG, WebP, GIF
- **Output:** JPEG (base64 data URL)

### Size Limits
- **Max file size:** 10MB per image
- **Recommended resolution:** 1024x1024 pixels
- **Auto-resize:** Ảnh sẽ được resize tự động để tối ưu cho API

### Quality Tips
- Ảnh người dùng: Rõ nét, ánh sáng tốt, chủ thể chính rõ ràng
- Ảnh sản phẩm: Chất lượng cao, màu sắc chính xác
- Tránh ảnh mờ, tối, hoặc có nhiều chi tiết phức tạp

## Rate Limiting

- **Không có authentication:** Không giới hạn
- **Có authentication:** Phụ thuộc vào số credit còn lại
- **Mỗi lần gọi thành công:** Trừ 1 credit

## Troubleshooting

### Common Errors

1. **"Missing user image"**
   - Đảm bảo field `userImage` được gửi kèm

2. **"Missing product image URL or file"**
   - Phải có ít nhất một trong hai: `productImage` hoặc `productImageUrl`

3. **"File size too large"**
   - Giảm kích thước ảnh xuống dưới 10MB

4. **"Unsupported file type"**
   - Chỉ hỗ trợ JPG, PNG, WebP, GIF

### Debug Tips

1. Kiểm tra Content-Type header: `multipart/form-data`
2. Đảm bảo file ảnh hợp lệ và có thể đọc được
3. Kiểm tra URL sản phẩm có thể truy cập được
4. Xem log server để biết chi tiết lỗi

## Support

Nếu gặp vấn đề, vui lòng:
1. Kiểm tra log server
2. Đảm bảo đúng format request
3. Test với ảnh đơn giản trước
4. Liên hệ support team



















