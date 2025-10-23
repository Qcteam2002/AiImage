# 🔧 API Integration Improvements

## Vấn đề hiện tại

API integration code hiện tại thiếu 2 parameters mới:
1. **`targetMarket`** - Thị trường mục tiêu (vi/us)
2. **Image processing** - AI sẽ tự chọn và chèn images vào HTML

---

## Cập nhật cần thiết

### 1. **Thêm `targetMarket` parameter**

```javascript
// ❌ HIỆN TẠI - Thiếu targetMarket
const requestData = {
  title: title,
  description: description || null,
  images: images.slice(0, 3),
  segmentation: segmentation,
  language: language  // Chỉ có language
};

// ✅ CẦN SỬA - Thêm targetMarket
const requestData = {
  title: title,
  description: description || null,
  images: images.slice(0, 3),
  segmentation: segmentation,
  targetMarket: "us", // ✅ THÊM MỚI
  language: language
};
```

### 2. **Cập nhật form data processing**

```javascript
// ❌ HIỆN TẠI
const language = formData.get("language") || "vi-VN";

// ✅ CẦN SỬA
const language = formData.get("language") || "vi-VN";
const targetMarket = formData.get("targetMarket") || "vi"; // ✅ THÊM MỚI
```

### 3. **Cập nhật request data**

```javascript
// ✅ REQUEST DATA HOÀN CHỈNH
const requestData = {
  title: title,
  description: description || null,
  images: images.slice(0, 3),
  segmentation: segmentation,
  targetMarket: targetMarket, // ✅ THÊM MỚI
  language: language
};
```

### 4. **Cập nhật debug logging**

```javascript
// ✅ DEBUG LOGGING HOÀN CHỈNH
console.log('=== GENERATE CONTENT SEGMENTATION API REQUEST ===');
console.log('Title:', title);
console.log('Description:', description?.substring(0, 100) + '...');
console.log('Product ID:', productId);
console.log('Language:', language);
console.log('Target Market:', targetMarket); // ✅ THÊM MỚI
console.log('Images count:', images.length);
console.log('Segmentation name:', segmentation.name);
console.log('Segmentation winRate:', segmentation.winRate);
```

---

## Code hoàn chỉnh đã cập nhật

```javascript
import { json } from "@remix-run/node";

const API_BASE_URL = 'http://localhost:3001';

export async function action({ request }) {
  try {
    const formData = await request.formData();
    const title = formData.get("title");
    const description = formData.get("description");
    const productId = formData.get("productId");
    const language = formData.get("language") || "vi-VN";
    const targetMarket = formData.get("targetMarket") || "vi"; // ✅ THÊM MỚI
    
    // Get segmentation data
    const segmentationData = formData.get("segmentation");
    let segmentation;
    
    try {
      segmentation = JSON.parse(segmentationData);
    } catch (error) {
      return json({ 
        error: "Invalid segmentation data format" 
      }, { status: 400 });
    }

    if (!title || !segmentation) {
      return json({ 
        error: "Title and segmentation are required" 
      }, { status: 400 });
    }

    // Process images array
    const images = [];
    let index = 0;
    while (formData.get(`images[${index}]`)) {
      const imageUrl = formData.get(`images[${index}]`);
      if (imageUrl && imageUrl.trim() !== '') {
        images.push(imageUrl);
      }
      index++;
    }

    // ✅ REQUEST DATA HOÀN CHỈNH
    const requestData = {
      title: title,
      description: description || null,
      images: images.slice(0, 3), // Max 3 images
      segmentation: segmentation,
      targetMarket: targetMarket, // ✅ THÊM MỚI
      language: language
    };

    // ✅ DEBUG LOGGING HOÀN CHỈNH
    console.log('=== GENERATE CONTENT SEGMENTATION API REQUEST ===');
    console.log('Title:', title);
    console.log('Description:', description?.substring(0, 100) + '...');
    console.log('Product ID:', productId);
    console.log('Language:', language);
    console.log('Target Market:', targetMarket); // ✅ THÊM MỚI
    console.log('Images count:', images.length);
    console.log('Segmentation name:', segmentation.name);
    console.log('Segmentation winRate:', segmentation.winRate);

    // Call external API for content generation
    const response = await fetch(`${API_BASE_URL}/api/product-optimize/generate-content-from-segmentation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData)
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status}`);
    }

    const data = await response.json();
    
    // Debug: Log the actual API response structure
    console.log('=== API RESPONSE DEBUG ===');
    console.log('Response status:', data.success);
    console.log('Generated title length:', data.data?.title?.length || 0);
    console.log('Generated description length:', data.data?.description?.length || 0);
    console.log('Description contains images:', data.data?.description?.includes('<img') || false); // ✅ THÊM MỚI

    if (data.error) {
      throw new Error(data.error);
    }

    if (!data.data || !data.data.title || !data.data.description) {
      throw new Error('Invalid response format: missing title or description');
    }

    // Return the generated content
    const transformedData = {
      success: true,
      data: {
        title: data.data.title,
        description: data.data.description,
        segmentation: {
          name: segmentation.name,
          winRate: segmentation.winRate,
          toneType: segmentation.toneType,
          voiceGuideline: segmentation.voiceGuideline
        }
      }
    };

    console.log('Transformed response:', {
      success: transformedData.success,
      titleLength: transformedData.data.title.length,
      descriptionLength: transformedData.data.description.length,
      descriptionHasImages: transformedData.data.description.includes('<img'), // ✅ THÊM MỚI
      segmentationName: transformedData.data.segmentation.name
    });

    return json(transformedData);

  } catch (error) {
    console.error('Generate content segmentation API error:', error);
    
    // Return fallback content if API fails
    const formData = await request.formData();
    const title = formData.get("title");
    const description = formData.get("description");
    
    console.log('Returning fallback content due to API error');
    const fallbackData = {
      success: true,
      data: {
        title: title || "Product Title",
        description: description ? 
          `<div class="product-description">
            <div class="hero-section">
              <h2>✨ ${title}</h2>
              <p>${description}</p>
            </div>
            <div class="benefits-section">
              <h3>🌟 Key Features:</h3>
              <ul class="benefits-list">
                <li>✅ High quality materials</li>
                <li>✅ Perfect for daily use</li>
                <li>✅ Great value for money</li>
              </ul>
            </div>
          </div>` : 
          `<div class="product-description">
            <div class="hero-section">
              <h2>✨ ${title}</h2>
              <p>Discover this amazing product that combines quality and style.</p>
            </div>
          </div>`,
        segmentation: {
          name: "Fallback",
          winRate: 0.5,
          toneType: "Friendly",
          voiceGuideline: "Use friendly and approachable tone"
        }
      }
    };
    
    return json(fallbackData);
  }
}
```

---

## Frontend Form cần cập nhật

### Thêm targetMarket field vào form:

```html
<!-- ✅ THÊM MỚI -->
<select name="targetMarket" required>
  <option value="vi">Vietnam</option>
  <option value="us">United States</option>
</select>

<!-- Hoặc hidden field nếu auto-detect -->
<input type="hidden" name="targetMarket" value="us" />
```

### JavaScript form submission:

```javascript
// ✅ CẬP NHẬT FORM DATA
const formData = new FormData();
formData.append('title', productTitle);
formData.append('description', productDescription);
formData.append('segmentation', JSON.stringify(selectedSegmentation));
formData.append('targetMarket', 'us'); // ✅ THÊM MỚI
formData.append('language', 'en-US');

// Append images
productImages.forEach((image, index) => {
  formData.append(`images[${index}]`, image);
});
```

---

## Testing

### Test với targetMarket khác nhau:

```javascript
// Test Vietnam market
const requestDataVN = {
  title: "Vòng Tay Sao Biển",
  segmentation: segmentationVN,
  targetMarket: "vi",
  language: "vi-VN"
};

// Test US market  
const requestDataUS = {
  title: "Starfish Cuff Bracelet",
  segmentation: segmentationUS,
  targetMarket: "us", 
  language: "en-US"
};
```

---

## Expected Results

### Với targetMarket = "vi":
- Content sẽ focus vào thị trường Việt Nam
- Keywords tiếng Việt
- Cultural context phù hợp

### Với targetMarket = "us":
- Content sẽ focus vào thị trường US
- Keywords tiếng Anh
- US cultural context

### Với images:
- AI sẽ tự chọn 2-3 images phù hợp
- Chèn vào HTML với thẻ `<img>`
- Styling responsive

---

## Summary

**Cần cập nhật:**
1. ✅ Thêm `targetMarket` parameter
2. ✅ Cập nhật form data processing
3. ✅ Cập nhật debug logging
4. ✅ Thêm image detection logging
5. ✅ Cập nhật frontend form

**Kết quả:**
- API sẽ generate content phù hợp với thị trường
- AI sẽ tự chọn và chèn images vào HTML
- Better debugging với targetMarket info
