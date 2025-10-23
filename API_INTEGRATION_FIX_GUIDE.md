# 🚨 Hướng dẫn sửa lỗi tích hợp API Segmentation

## ❌ **Lỗi hiện tại:**

```
Status Code: 500 Internal Server Error
URL: https://mayor-deer-designers-cho.trycloudflare.com/api/segmentation
Error: External API error: 500 Internal Server Error
```

## 🔍 **Nguyên nhân lỗi:**

### **1. URL Endpoint sai:**
- **❌ Đang gọi:** `/api/segmentation`
- **✅ Phải gọi:** `/api/product-optimize/suggestDataSegmentation`

### **2. Format dữ liệu sai:**
- **❌ Đang gửi:** Form Data với `images[0]`, `images[1]`...
- **✅ Phải gửi:** JSON với `images: ["url1", "url2", ...]`

### **3. Content-Type header sai:**
- **❌ Đang dùng:** `application/x-www-form-urlencoded` hoặc `multipart/form-data`
- **✅ Phải dùng:** `application/json`

---

## 🔧 **Cách sửa lỗi:**

### **Bước 1: Sửa URL endpoint**

```javascript
// ❌ SAI
const response = await fetch('/api/segmentation', {
  method: 'POST',
  body: formData
});

// ✅ ĐÚNG
const response = await fetch('/api/product-optimize/suggestDataSegmentation', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(data)
});
```

### **Bước 2: Convert FormData sang JSON**

```javascript
// Hàm convert FormData sang JSON
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
  
  // Xử lý goals (nếu có)
  const goals = formData.get('goals');
  if (goals) {
    data.goals = goals.split(',').map(g => g.trim()).filter(g => g);
  } else {
    data.goals = [];
  }
  
  return data;
}
```

### **Bước 3: Code hoàn chỉnh**

```javascript
// Trong file api.segmentation.jsx
export async function action({ request }) {
  try {
    const formData = await request.formData();
    
    // Convert FormData sang JSON
    const jsonData = convertFormDataToJSON(formData);
    
    // Gọi API với đúng endpoint và format
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

// Hàm helper
function convertFormDataToJSON(formData) {
  const data = {};
  
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

---

## 📋 **Cấu trúc dữ liệu đúng:**

### **Input (từ form):**
```javascript
{
  title: "Thể hiện phong cách độc đáo với bộ 4 nhẫn Punk Olivia Rodrigo - Quà tặng hoàn hảo cho fan!",
  description: "Bộ nhẫn phong cách punk lấy cảm hứng từ ca sĩ Olivia Rodrigo...",
  productId: "58",
  targetMarket: "vi",
  language: "vi-VN",
  productType: "Accessory",
  brandTone: "friendly",
  images: [
    "https://cdn.shopify.com/s/files/1/0679/2540/9948/files/S7b9c20a3f7af4d9597225069be8c2271R.webp?v=1743661265",
    "https://cdn.shopify.com/s/files/1/0679/2540/9948/files/S6dd57add52a34d10adb0865f1f24765f4.webp?v=1743661265",
    "https://cdn.shopify.com/s/files/1/0679/2540/9948/files/Sda2edcfaff1b4aaf8ad32932e66ca67dC.webp?v=1743661265",
    "https://cdn.shopify.com/s/files/1/0679/2540/9948/files/S7a1becfb2e7147f69f5a311655133be4J.webp?v=1743661265",
    "https://cdn.shopify.com/s/files/1/0679/2540/9948/files/S0d7f4e42ec264bccb6ea26eebe4f03cdY.webp?v=1743661266",
    "https://cdn.shopify.com/s/files/1/0679/2540/9948/files/S235abb728d12427bb3b830cf61b5e4fc0.webp?v=1743661265"
  ],
  goals: ["Increase Conversion Rate", "Target Niche Audience"]
}
```

### **Output (từ API):**
```javascript
{
  "status": "success",
  "segmentations": [
    {
      "name": "Chiến binh Gen Z: Tín đồ Văn hóa Pop-Punk",
      "painpoint": "Nhu cầu thể hiện bản thân khác biệt...",
      "winRate": 0.9,
      "reason": "Phù hợp nhất (Perfect Match)...",
      "personaProfile": {
        "demographics": "Nữ, 16-24 tuổi...",
        "behaviors": "Hoạt động mạnh mẽ trên TikTok...",
        "motivations": "Địa vị xã hội trong nhóm bạn...",
        "communicationChannels": "TikTok (Challenge, Review Unboxing)..."
      },
      "keywordSuggestions": ["Olivia Rodrigo merch Việt Nam", "nhẫn punk gen z", ...]
    }
    // ... 2 segments khác
  ]
}
```

---

## 🧪 **Test API sau khi sửa:**

### **1. Test với curl:**
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

### **2. Test với JavaScript:**
```javascript
const testData = {
  title: "Test Product",
  description: "Test Description",
  images: ["https://example.com/image1.jpg"],
  targetMarket: "vi",
  language: "vi-VN",
  productType: "Accessory",
  brandTone: "friendly",
  goals: ["Increase Sales"]
};

fetch('/api/product-optimize/suggestDataSegmentation', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(testData)
})
.then(response => response.json())
.then(data => console.log('Success:', data))
.catch(error => console.error('Error:', error));
```

---

## ⚠️ **Lưu ý quan trọng:**

### **1. URL đầy đủ:**
- **Local:** `http://localhost:3001/api/product-optimize/suggestDataSegmentation`
- **Production:** `https://mayor-deer-designers-cho.trycloudflare.com/api/product-optimize/suggestDataSegmentation`

### **2. Headers bắt buộc:**
```javascript
headers: {
  'Content-Type': 'application/json'
}
```

### **3. Timeout:**
```javascript
// Thêm timeout để tránh lỗi
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 giây

fetch('/api/product-optimize/suggestDataSegmentation', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(data),
  signal: controller.signal
})
.then(response => {
  clearTimeout(timeoutId);
  return response.json();
})
.catch(error => {
  clearTimeout(timeoutId);
  if (error.name === 'AbortError') {
    console.error('Request timeout');
  } else {
    console.error('Request failed:', error);
  }
});
```

### **4. Error handling:**
```javascript
try {
  const response = await fetch('/api/product-optimize/suggestDataSegmentation', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const result = await response.json();
  
  if (result.status === 'success') {
    // Xử lý kết quả thành công
    console.log('Segmentation data:', result.segmentations);
  } else {
    // Xử lý lỗi từ API
    console.error('API error:', result.error);
  }
  
} catch (error) {
  console.error('Request failed:', error);
}
```

---

## 📞 **Sau khi sửa xong:**

1. **Test API** với dữ liệu thực tế
2. **Kiểm tra response** có đúng format không
3. **Xử lý error cases** (timeout, network error, API error)
4. **Log kết quả** để debug nếu cần

---

## 🎯 **Kết quả mong đợi:**

Sau khi sửa, API sẽ trả về:
- **Status 200** thay vì 500
- **JSON response** với 3 phân khúc khách hàng
- **Dữ liệu chi tiết** về persona, painpoint, winRate, keywords

---

*Hướng dẫn này sẽ giúp hệ thống bên kia tích hợp API thành công!*

