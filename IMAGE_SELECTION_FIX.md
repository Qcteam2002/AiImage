# 🖼️ Image Selection Fix - AI Vision Integration

## 🚨 Vấn đề đã phát hiện

**User báo cáo:** "Tôi chọn các segment khác nhau để optimize content nhưng image URL trả ra giống nhau"

**Nguyên nhân:**
1. ❌ **Model sai:** Đang dùng `x-ai/grok-4-fast` thay vì `openai/gpt-4o-mini`
2. ❌ **Prompt không rõ ràng:** AI không được hướng dẫn cụ thể về việc chọn images
3. ❌ **Thiếu logging:** Không có debug info để kiểm tra AI có thực sự chọn images khác nhau

---

## ✅ Giải pháp đã áp dụng

### 1. **Sửa Model về GPT-4o-mini**
```typescript
// ❌ TRƯỚC
model: 'x-ai/grok-4-fast'

// ✅ SAU  
model: 'openai/gpt-4o-mini'
```

### 2. **Cải thiện Prompt cho Image Selection**

#### **TRƯỚC:**
```
- Trong danh sách hình ảnh sản phẩm ở trên, hãy TỰ CHỌN 2-3 hình ảnh phù hợp nhất
- CHÈN trực tiếp URL hình ảnh vào HTML description bằng thẻ <img>
```

#### **SAU:**
```
- Tôi đã gửi kèm hình ảnh sản phẩm trong message này. Hãy XEM và PHÂN TÍCH từng hình ảnh
- TỰ CHỌN 2-3 hình ảnh phù hợp nhất dựa trên nội dung và persona "${personaName}"
- CHÈN trực tiếp URL hình ảnh đã chọn vào HTML description bằng thẻ <img>
- Chọn hình ảnh phù hợp với từng section:
  * Hero section: Hình ảnh đẹp nhất, thu hút nhất
  * Benefits section: Hình ảnh minh họa tính năng/lợi ích
  * Lifestyle section: Hình ảnh sản phẩm trong context sử dụng
- Đảm bảo hình ảnh tăng tính thuyết phục và phù hợp với persona
```

### 3. **Thêm Lưu ý Quan trọng**

```
**LƯU Ý QUAN TRỌNG:**
- PHẢI XEM và PHÂN TÍCH hình ảnh đã gửi kèm
- PHẢI chọn 2-3 hình ảnh phù hợp dựa trên persona và nội dung
- Mỗi persona khác nhau PHẢI chọn hình ảnh khác nhau phù hợp với persona đó
- KHÔNG được chọn cùng 1 hình ảnh cho tất cả personas
```

### 4. **Thêm Debug Logging**

```typescript
// Log images being sent to AI
console.log('🖼️ Sending images to AI for analysis:', imageUrls.length);
imageUrls.forEach((imageUrl: string, index: number) => {
  console.log(`📸 Image ${index + 1}:`, imageUrl);
});

// Log AI response analysis
console.log('🖼️ Response contains images:', content.includes('<img'));
console.log('📊 Number of <img> tags:', (content.match(/<img/g) || []).length);
```

---

## 🧪 Cách Test

### **Test Case 1: Different Personas, Different Images**

```javascript
// Persona 1: "Gen Z Trendsetters"
const segmentation1 = {
  name: "Gen Z Trendsetters",
  personaProfile: {
    demographics: "16-25 tuổi, học sinh/sinh viên"
  }
};

// Persona 2: "Người trẻ thành đạt"  
const segmentation2 = {
  name: "Người trẻ thành đạt",
  personaProfile: {
    demographics: "25-35 tuổi, nhân viên văn phòng"
  }
};

// Expected: AI should select different images for each persona
```

### **Test Case 2: Image Analysis Logging**

**Check console logs:**
```
🖼️ Sending images to AI for analysis: 3
📸 Image 1: https://example.com/image1.jpg
📸 Image 2: https://example.com/image2.jpg  
📸 Image 3: https://example.com/image3.jpg
🤖 Calling GPT-4o-mini for content generation...
📝 Raw AI response length: 2847
🖼️ Response contains images: true
📊 Number of <img> tags: 3
```

---

## 🎯 Expected Results

### **Với Persona "Gen Z Trendsetters":**
- AI chọn images phù hợp với style trẻ trung, năng động
- Có thể chọn image với màu sắc tươi sáng, phong cách streetwear

### **Với Persona "Người trẻ thành đạt":**
- AI chọn images phù hợp với style chuyên nghiệp, tinh tế
- Có thể chọn image với thiết kế sang trọng, phù hợp công sở

### **Với Persona "Người yêu thích nghệ thuật":**
- AI chọn images phù hợp với tính nghệ thuật, độc đáo
- Có thể chọn image với thiết kế creative, artistic

---

## 🔍 Debugging Guide

### **Nếu vẫn thấy images giống nhau:**

1. **Check Model:**
   ```bash
   # Trong console log, tìm:
   🤖 Calling GPT-4o-mini for content generation...
   ```

2. **Check Images Sent:**
   ```bash
   # Phải thấy:
   🖼️ Sending images to AI for analysis: 3
   📸 Image 1: [URL]
   📸 Image 2: [URL]
   📸 Image 3: [URL]
   ```

3. **Check AI Response:**
   ```bash
   # Phải thấy:
   🖼️ Response contains images: true
   📊 Number of <img> tags: 2-3
   ```

4. **Check Persona Names:**
   ```bash
   # Trong prompt, phải thấy:
   persona "${personaName}" # với personaName khác nhau
   ```

---

## 📋 Checklist

- ✅ **Model:** `openai/gpt-4o-mini` (có vision)
- ✅ **Prompt:** Rõ ràng về việc XEM và CHỌN images
- ✅ **Persona-specific:** Mỗi persona chọn images khác nhau
- ✅ **Logging:** Debug info đầy đủ
- ✅ **Section-specific:** Hero, Benefits, Lifestyle images khác nhau

---

## 🚀 Next Steps

1. **Test với multiple personas** để verify images khác nhau
2. **Monitor console logs** để đảm bảo AI thực sự analyze images
3. **Collect feedback** từ user về quality của image selection
4. **Fine-tune prompt** nếu cần thiết dựa trên results

---

**Kết quả mong đợi:** AI sẽ thực sự XEM images và CHỌN images phù hợp với từng persona khác nhau! 🎯✨
