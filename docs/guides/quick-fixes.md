# 🚨 SỬA LỖI API SEGMENTATION - HƯỚNG DẪN NHANH

## ❌ **LỖI HIỆN TẠI:**
```
URL: /api/segmentation
Status: 500 Internal Server Error
```

## ✅ **CÁCH SỬA:**

### **1. Thay đổi URL endpoint:**
```javascript
// ❌ SAI - URL cũ
const response = await fetch('/api/segmentation', {
  method: 'POST',
  body: formData
});

// ✅ ĐÚNG - URL mới
const response = await fetch('/api/product-optimize/suggestDataSegmentation', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(data)
});
```

### **2. Convert FormData sang JSON:**
```javascript
// Thêm hàm này vào file api.segmentation.jsx
function convertFormDataToJSON(formData) {
  const data = {};
  
  // Lấy các trường cơ bản
  data.title = formData.get('title');
  data.description = formData.get('description');
  data.targetMarket = formData.get('targetMarket');
  data.language = formData.get('language');
  data.productType = formData.get('productType');
  data.brandTone = formData.get('brandTone');
  
  // Xử lý images array
  const images = [];
  let index = 0;
  while (formData.get(`images[${index}]`)) {
    const imageUrl = formData.get(`images[${index}]`);
    if (imageUrl && imageUrl.trim() !== '') {
      images.push(imageUrl);
    }
    index++;
  }
  data.images = images;
  
  // Xử lý goals
  const goals = formData.get('goals');
  if (goals) {
    data.goals = goals.split(',').map(g => g.trim()).filter(g => g);
  } else {
    data.goals = [];
  }
  
  return data;
}
```

### **3. Sửa action function:**
```javascript
export async function action({ request }) {
  try {
    const formData = await request.formData();
    
    // Convert FormData sang JSON
    const jsonData = convertFormDataToJSON(formData);
    
    // Gọi API với URL đúng
    const response = await fetch('/api/product-optimize/suggestDataSegmentation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(jsonData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    return { success: true, data: result };
    
  } catch (error) {
    console.error('API Error:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
}
```

## 🎯 **TÓM TẮT THAY ĐỔI:**

1. **URL:** `/api/segmentation` → `/api/product-optimize/suggestDataSegmentation`
2. **Format:** FormData → JSON
3. **Header:** Thêm `Content-Type: application/json`
4. **Body:** `formData` → `JSON.stringify(data)`

## 🧪 **TEST NGAY:**

```bash
curl -X POST https://mayor-deer-designers-cho.trycloudflare.com/api/product-optimize/suggestDataSegmentation \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Product",
    "description": "Test Description",
    "images": ["https://example.com/image1.jpg"],
    "targetMarket": "vi",
    "language": "vi-VN",
    "productType": "Accessory",
    "brandTone": "friendly",
    "goals": ["Increase Sales"]
  }'
```

**Sau khi sửa xong, API sẽ trả về status 200 với dữ liệu segmentation!** 🎉










