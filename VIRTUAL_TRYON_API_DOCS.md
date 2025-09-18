# Virtual Try-On API Documentation

## Overview
The Virtual Try-On API allows you to generate realistic images showing how clothing items would look when worn by a person. This API uses Google's Gemini 2.5 Flash Image Preview model via OpenRouter to create high-quality virtual try-on results.

## Base URL
```
http://your-server-ip:3002
```

## Authentication
Currently, this API does not require authentication. However, for production use, consider implementing API keys or JWT tokens.

## Endpoints

### 1. Virtual Try-On Generation

**POST** `/api/tryon`

Generate a virtual try-on image showing how clothing would look on a person.

#### Request Headers
```
Content-Type: multipart/form-data
```

#### Request Body (Form Data)
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `userImage` | File | Yes | Image file of the person (JPG, PNG, WebP) |
| `productImage` | File | Yes | Image file of the clothing item (JPG, PNG, WebP) |
| `customPrompt` | String | No | Custom styling instructions (optional) |

#### File Requirements
- **Supported formats**: JPG, JPEG, PNG, WebP
- **Maximum file size**: 10MB per file
- **Recommended resolution**: 1024x1024 pixels or smaller
- **Total request size**: 20MB maximum

#### Example Request (cURL)
```bash
curl -X POST http://your-server-ip:3002/api/tryon \
  -F "userImage=@person.jpg" \
  -F "productImage=@clothing.jpg" \
  -F "customPrompt=Create a professional e-commerce fashion photo with studio lighting"
```

#### Example Request (JavaScript)
```javascript
const formData = new FormData();
formData.append('userImage', userImageFile);
formData.append('productImage', productImageFile);
formData.append('customPrompt', 'Professional studio lighting');

const response = await fetch('http://your-server-ip:3002/api/tryon', {
  method: 'POST',
  body: formData
});

const result = await response.json();
```

#### Response Format

**Success Response (200 OK)**
```json
{
  "success": true,
  "generatedImageUrl": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
  "message": "Virtual try-on generated successfully!"
}
```

**Error Response (400 Bad Request)**
```json
{
  "success": false,
  "error": "Missing user image"
}
```

**Error Response (500 Internal Server Error)**
```json
{
  "success": false,
  "error": "Failed to generate virtual try-on"
}
```

#### Response Fields
| Field | Type | Description |
|-------|------|-------------|
| `success` | Boolean | Indicates if the request was successful |
| `generatedImageUrl` | String | Base64-encoded image data URL of the generated virtual try-on |
| `message` | String | Success message |
| `error` | String | Error message (only present when success is false) |

### 2. Health Check

**GET** `/health`

Check if the API service is running.

#### Response
```json
{
  "status": "ok",
  "service": "Image Processing API",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "environment": "production",
  "geminiConfigured": true
}
```

## Default Prompts

If no custom prompt is provided, the API uses this default prompt:

```
Create a professional e-commerce fashion photo. Take the clothing item from the first image and place it realistically on the model from the second image. Ensure the product's original color, texture, and size are preserved. Generate a full-body, photorealistic shot of the model wearing the item, with lighting and shadows adjusted naturally to match the scene.
```

## Custom Prompts

You can provide custom styling instructions using the `customPrompt` parameter. Examples:

- `"Create a casual streetwear look with natural outdoor lighting"`
- `"Professional business attire with studio lighting"`
- `"Evening wear with dramatic lighting and shadows"`
- `"Summer casual style with bright, natural lighting"`

## Error Handling

### Common Error Codes

| Status Code | Description | Solution |
|-------------|-------------|----------|
| 400 | Bad Request | Check file format and size requirements |
| 413 | Payload Too Large | Reduce image file sizes |
| 500 | Internal Server Error | Check server logs or try again later |
| 503 | Service Unavailable | API service is temporarily down |

### Error Response Format
All error responses follow this format:
```json
{
  "success": false,
  "error": "Error description"
}
```

## Rate Limiting

Currently, there are no rate limits implemented. For production use, consider implementing:
- Request rate limiting per IP
- Daily/monthly usage quotas
- API key-based access control

## Image Processing

### Input Processing
- Images are automatically resized to 1024x1024 pixels maximum
- Images are converted to JPEG format with 80% quality
- Aspect ratio is preserved during resizing

### Output Format
- Generated images are returned as base64-encoded data URLs
- Format: `data:image/jpeg;base64,{base64_string}`
- Typical size: 1-3MB per generated image

## Best Practices

### Image Quality
1. **Use high-quality input images** (at least 512x512 pixels)
2. **Ensure good lighting** in both person and product photos
3. **Use clear, well-lit product images** with minimal background
4. **Person images should show full body** for best results

### Performance
1. **Resize images before sending** to reduce upload time
2. **Use appropriate file formats** (JPEG for photos, PNG for graphics)
3. **Implement client-side validation** for file size and format

### Security
1. **Validate file types** on the client side
2. **Implement file size limits** to prevent abuse
3. **Consider adding authentication** for production use
4. **Monitor API usage** for unusual patterns

## Integration Examples

### React/Next.js
```jsx
const handleTryOn = async (userImage, productImage, customPrompt = '') => {
  const formData = new FormData();
  formData.append('userImage', userImage);
  formData.append('productImage', productImage);
  if (customPrompt) {
    formData.append('customPrompt', customPrompt);
  }

  try {
    const response = await fetch('http://your-server-ip:3002/api/tryon', {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    
    if (result.success) {
      // Display the generated image
      setGeneratedImage(result.generatedImageUrl);
    } else {
      console.error('Error:', result.error);
    }
  } catch (error) {
    console.error('Network error:', error);
  }
};
```

### Vue.js
```javascript
async function generateTryOn(userImage, productImage, customPrompt = '') {
  const formData = new FormData();
  formData.append('userImage', userImage);
  formData.append('productImage', productImage);
  if (customPrompt) {
    formData.append('customPrompt', customPrompt);
  }

  try {
    const response = await fetch('http://your-server-ip:3002/api/tryon', {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error generating try-on:', error);
    throw error;
  }
}
```

### Python
```python
import requests

def generate_virtual_tryon(user_image_path, product_image_path, custom_prompt=''):
    url = 'http://your-server-ip:3002/api/tryon'
    
    files = {
        'userImage': open(user_image_path, 'rb'),
        'productImage': open(product_image_path, 'rb')
    }
    
    data = {}
    if custom_prompt:
        data['customPrompt'] = custom_prompt
    
    try:
        response = requests.post(url, files=files, data=data)
        result = response.json()
        
        if result['success']:
            return result['generatedImageUrl']
        else:
            raise Exception(result['error'])
    except Exception as e:
        print(f"Error: {e}")
        return None
    finally:
        files['userImage'].close()
        files['productImage'].close()
```

## Support

For technical support or questions about the API, please contact the development team or check the server logs for detailed error information.

## Changelog

### Version 1.0.0
- Initial release
- Virtual try-on generation endpoint
- Support for custom prompts
- Base64 image response format
