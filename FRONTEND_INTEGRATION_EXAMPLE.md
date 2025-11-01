# Frontend Integration Example - Image Generation API

## Cách xử lý Base64 Image từ API

Khi API trả về `generatedImage` dưới dạng base64 data URL, frontend cần xử lý để hiển thị:

### 1. JavaScript/React Example

```javascript
// Gọi API generate-image-result
const generateImage = async (prompt, originalImageUrl, style) => {
  try {
    const response = await fetch('/api/product-optimize/generate-image-result', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: prompt,
        originalImageUrl: originalImageUrl,
        style: style
      })
    });

    const data = await response.json();
    
    if (data.success) {
      const generatedImageUrl = data.data.generatedImage;
      
      // Kiểm tra nếu là base64 data URL
      if (generatedImageUrl.startsWith('data:image/')) {
        // Base64 data URL - có thể hiển thị trực tiếp
        displayImage(generatedImageUrl);
      } else if (generatedImageUrl.startsWith('http')) {
        // HTTP URL - hiển thị bình thường
        displayImage(generatedImageUrl);
      } else {
        console.error('Invalid image format:', generatedImageUrl);
      }
    }
  } catch (error) {
    console.error('Error generating image:', error);
  }
};

// Hiển thị hình ảnh
const displayImage = (imageUrl) => {
  const imgElement = document.getElementById('generated-image');
  imgElement.src = imageUrl;
  imgElement.style.display = 'block';
};
```

### 2. React Component Example

```jsx
import React, { useState } from 'react';

const ImageGenerator = () => {
  const [generatedImage, setGeneratedImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerateImage = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/product-optimize/generate-image-result', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: "studio shot with white background",
          originalImageUrl: "https://example.com/product.jpg",
          style: "studio"
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setGeneratedImage(data.data.generatedImage);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={handleGenerateImage} disabled={loading}>
        {loading ? 'Generating...' : 'Generate Image'}
      </button>
      
      {generatedImage && (
        <div>
          <h3>Generated Image:</h3>
          <img 
            src={generatedImage} 
            alt="Generated" 
            style={{ maxWidth: '100%', height: 'auto' }}
            onError={(e) => {
              console.error('Image load error:', e);
              e.target.style.display = 'none';
            }}
          />
          
          {/* Download button cho base64 */}
          {generatedImage.startsWith('data:image/') && (
            <button 
              onClick={() => downloadBase64Image(generatedImage, 'generated-image.png')}
            >
              Download Image
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// Function để download base64 image
const downloadBase64Image = (base64DataUrl, filename) => {
  const link = document.createElement('a');
  link.href = base64DataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export default ImageGenerator;
```

### 3. HTML Example

```html
<!DOCTYPE html>
<html>
<head>
    <title>Image Generator</title>
</head>
<body>
    <button onclick="generateImage()">Generate Image</button>
    
    <div id="result" style="display: none;">
        <h3>Generated Image:</h3>
        <img id="generated-image" style="max-width: 500px; height: auto;" />
        <br><br>
        <button onclick="downloadImage()">Download Image</button>
    </div>

    <script>
        let currentImageUrl = null;

        async function generateImage() {
            try {
                const response = await fetch('/api/product-optimize/generate-image-result', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        prompt: "studio shot with white background",
                        originalImageUrl: "https://example.com/product.jpg",
                        style: "studio"
                    })
                });

                const data = await response.json();
                
                if (data.success) {
                    currentImageUrl = data.data.generatedImage;
                    document.getElementById('generated-image').src = currentImageUrl;
                    document.getElementById('result').style.display = 'block';
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Failed to generate image');
            }
        }

        function downloadImage() {
            if (currentImageUrl) {
                const link = document.createElement('a');
                link.href = currentImageUrl;
                link.download = 'generated-image.png';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        }
    </script>
</body>
</html>
```

### 4. Shopify App Integration Example

```javascript
// Trong Shopify App
const generateProductImage = async (productId, style) => {
  try {
    // Lấy thông tin sản phẩm
    const product = await fetch(`/admin/api/2023-10/products/${productId}.json`);
    const productData = await product.json();
    
    // Lấy hình ảnh đầu tiên của sản phẩm
    const originalImageUrl = productData.product.images[0]?.src;
    
    if (!originalImageUrl) {
      throw new Error('No product image found');
    }

    // Gọi API generate image
    const response = await fetch('/api/product-optimize/generate-image-result', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: `Create a ${style} shot of this product`,
        originalImageUrl: originalImageUrl,
        style: style
      })
    });

    const data = await response.json();
    
    if (data.success) {
      const generatedImageUrl = data.data.generatedImage;
      
      // Upload generated image to Shopify
      if (generatedImageUrl.startsWith('data:image/')) {
        await uploadBase64ToShopify(generatedImageUrl, productId);
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

// Upload base64 image to Shopify
const uploadBase64ToShopify = async (base64DataUrl, productId) => {
  try {
    // Convert base64 to blob
    const response = await fetch(base64DataUrl);
    const blob = await response.blob();
    
    // Create FormData
    const formData = new FormData();
    formData.append('image', blob, 'generated-image.png');
    
    // Upload to Shopify
    const uploadResponse = await fetch(`/admin/api/2023-10/products/${productId}/images.json`, {
      method: 'POST',
      body: formData
    });
    
    const result = await uploadResponse.json();
    console.log('Image uploaded to Shopify:', result);
  } catch (error) {
    console.error('Upload error:', error);
  }
};
```

## Lưu ý quan trọng:

1. **Base64 Data URL**: Có thể hiển thị trực tiếp trong `<img src="">`
2. **File Size**: Base64 images có thể lớn, cần optimize nếu cần
3. **Download**: Có thể download base64 image bằng cách tạo `<a>` tag
4. **Error Handling**: Luôn có fallback khi image load fail
5. **Performance**: Base64 images load nhanh hơn HTTP requests

## Response Format từ API:

```json
{
  "success": true,
  "data": {
    "generatedImage": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...", // Base64 data URL
    "style": "studio",
    "originalImageUrl": "https://example.com/product.jpg",
    "prompt": "studio shot with white background",
    "techSettings": {...},
    "timestamp": "2025-01-26T13:30:00.000Z",
    "note": "Image generated successfully"
  }
}
```

Base64 data URL có format: `data:image/jpeg;base64,<base64-encoded-image-data>`







