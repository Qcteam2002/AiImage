# Hướng dẫn cấu hình OpenRouter API

## Bước 1: Tạo tài khoản OpenRouter

1. Truy cập https://openrouter.ai/
2. Click "Sign Up" để tạo tài khoản
3. Xác thực email

## Bước 2: Tạo API Key

1. Đăng nhập vào dashboard
2. Vào mục "Keys" 
3. Click "Create Key"
4. Đặt tên cho key (ví dụ: "AI Image Analysis")
5. Copy API key được tạo

## Bước 3: Cấu hình Backend

Thêm vào file `.env` của backend:

```env
# OpenRouter Configuration
OPENROUTER_API_KEY=sk-or-v1-your-api-key-here
SITE_URL=http://localhost:3000
SITE_NAME=AI Image Analysis
```

## Bước 4: Kiểm tra cấu hình

1. Khởi động backend:
   ```bash
   cd backend
   npm run dev
   ```

2. Kiểm tra health check:
   ```bash
   curl http://localhost:3001/health
   ```

3. Test tạo sản phẩm và phân tích

## Bước 5: Quản lý chi phí

### Pricing
- GPT-4o-mini: ~$0.15/1M input tokens, ~$0.60/1M output tokens
- Mỗi lần phân tích sản phẩm: ~$0.01-0.05

### Giới hạn
- Có thể set spending limit trong OpenRouter dashboard
- Monitor usage qua dashboard

### Tips tiết kiệm
1. Sử dụng model rẻ hơn cho test (gpt-3.5-turbo)
2. Giới hạn độ dài prompt
3. Cache kết quả phân tích

## Troubleshooting

### Lỗi "Invalid API Key"
- Kiểm tra API key có đúng format không
- Đảm bảo key chưa bị revoke

### Lỗi "Insufficient Credits"
- Kiểm tra balance trong OpenRouter dashboard
- Thêm credits nếu cần

### Lỗi "Rate Limited"
- Giảm tần suất gọi API
- Implement retry logic

### Lỗi "Model Not Available"
- Kiểm tra model name có đúng không
- Thử model khác nếu cần

## Models khuyến nghị

### Cho phân tích sản phẩm
- `openai/gpt-4o-mini-search-preview` (mặc định)
- `openai/gpt-4o-mini` (rẻ hơn)
- `anthropic/claude-3-haiku` (nhanh)

### Cho test/development
- `openai/gpt-3.5-turbo` (rất rẻ)
- `meta-llama/llama-3.1-8b-instruct` (miễn phí)

## Monitoring

### Logs
Backend sẽ log các thông tin:
- API calls to OpenRouter
- Response times
- Error messages
- Token usage

### Metrics
Theo dõi:
- Số lần phân tích/ngày
- Chi phí/ngày
- Thời gian phản hồi trung bình
- Tỷ lệ lỗi

## Security

### Best Practices
1. Không commit API key vào git
2. Sử dụng environment variables
3. Rotate keys định kỳ
4. Monitor usage bất thường

### Rate Limiting
- Implement rate limiting ở backend
- Queue requests nếu cần
- Retry với exponential backoff
