# Hướng dẫn sử dụng tính năng Phân tích sản phẩm

## Tổng quan
Tính năng "Phân tích sản phẩm" cho phép bạn upload thông tin sản phẩm và sử dụng AI để phân tích chi tiết về:
- Đối tượng mục tiêu
- Phân tích thị trường
- Định vị sản phẩm
- Khuyến nghị marketing
- Tiềm năng bán hàng

## Cách sử dụng

### 1. Truy cập trang Phân tích sản phẩm
- Đăng nhập vào hệ thống
- Click vào menu "Phân tích sản phẩm" trong sidebar

### 2. Thêm sản phẩm mới
- Click nút "Thêm sản phẩm"
- Điền thông tin:
  - **Tên sản phẩm** (bắt buộc)
  - **Mô tả sản phẩm** (tùy chọn)
  - **URL hình ảnh** (tùy chọn)
  - **Link sản phẩm** (tùy chọn)
- Click "Phân tích sản phẩm"

### 3. Xem kết quả phân tích
- Sản phẩm sẽ có trạng thái:
  - **Đang chờ**: Chờ AI xử lý
  - **Đang xử lý**: AI đang phân tích
  - **Hoàn thành**: Có thể xem kết quả
  - **Lỗi**: Có lỗi xảy ra
- Click vào sản phẩm có trạng thái "Hoàn thành" để xem chi tiết

## Cấu hình API

### OpenRouter API
Tính năng sử dụng OpenRouter API để gọi GPT-4o-mini. Cần cấu hình:

```env
OPENROUTER_API_KEY=your-openrouter-api-key
SITE_URL=https://your-domain.com
SITE_NAME=AI Image Analysis
```

### Lấy API key OpenRouter
1. Truy cập https://openrouter.ai/
2. Đăng ký tài khoản
3. Tạo API key
4. Thêm vào file `.env` của backend

## Cấu trúc dữ liệu

### Bảng Product
```sql
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  product_url TEXT,
  status TEXT DEFAULT 'waiting',
  analysis_result TEXT, -- JSON
  error_message TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  analyzed_at DATETIME,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Trạng thái sản phẩm
- `waiting`: Chờ phân tích
- `processing`: Đang phân tích
- `done`: Hoàn thành
- `error`: Có lỗi

## API Endpoints

### GET /api/products
Lấy danh sách sản phẩm của user
- Query params: `page`, `limit`, `status`, `search`

### POST /api/products
Tạo sản phẩm mới
- Body: `{ name, description?, image_url?, product_url? }`

### GET /api/products/:id
Lấy chi tiết sản phẩm

### POST /api/products/:id/analyze
Bắt đầu phân tích sản phẩm

### DELETE /api/products/:id
Xóa sản phẩm

## Kết quả phân tích

Kết quả AI sẽ trả về JSON với cấu trúc:

```json
{
  "target_audience": {
    "primary": "Nhóm khách hàng chính",
    "secondary": "Nhóm khách hàng phụ",
    "demographics": {
      "age_range": "Khoảng tuổi",
      "gender": "Tỷ lệ giới tính",
      "location": "Khu vực",
      "income_level": "Mức thu nhập"
    },
    "behaviors": ["Hành vi mua sắm"],
    "painpoints": ["Vấn đề của khách hàng"]
  },
  "market_analysis": {
    "market_size": "Quy mô thị trường",
    "competition_level": "Mức độ cạnh tranh",
    "growth_potential": "Tiềm năng tăng trưởng",
    "key_competitors": ["Đối thủ chính"]
  },
  "product_positioning": {
    "usp": ["Điểm bán hàng độc đáo"],
    "price_positioning": "Định vị giá",
    "value_proposition": "Giá trị mang lại",
    "differentiation": ["Điểm khác biệt"]
  },
  "marketing_recommendations": {
    "channels": ["Kênh marketing"],
    "messaging": ["Thông điệp chính"],
    "content_ideas": ["Ý tưởng nội dung"],
    "pricing_strategy": "Chiến lược giá"
  },
  "sales_potential": {
    "estimated_demand": "Nhu cầu ước tính",
    "profit_margin": "Biên lợi nhuận",
    "roi_potential": "Tiềm năng ROI",
    "risk_level": "Mức độ rủi ro"
  }
}
```

## Troubleshooting

### Lỗi thường gặp

1. **"AI analysis failed"**
   - Kiểm tra OpenRouter API key
   - Kiểm tra kết nối internet
   - Thử lại sau vài phút

2. **"Product not found"**
   - Kiểm tra ID sản phẩm
   - Đảm bảo sản phẩm thuộc về user hiện tại

3. **"At least one URL is required"**
   - Cần cung cấp ít nhất image_url hoặc product_url

### Debug
- Kiểm tra logs backend để xem chi tiết lỗi
- Kiểm tra database để xem trạng thái sản phẩm
- Kiểm tra OpenRouter API quota

## Phát triển thêm

### Tính năng có thể thêm
1. **Export báo cáo PDF**
2. **So sánh sản phẩm**
3. **Lịch sử phân tích**
4. **Templates phân tích**
5. **Tích hợp thêm AI models**

### Cải thiện hiện tại
1. **Real-time updates** khi phân tích hoàn thành
2. **Batch analysis** nhiều sản phẩm cùng lúc
3. **Custom prompts** cho từng loại sản phẩm
4. **Caching** kết quả phân tích
