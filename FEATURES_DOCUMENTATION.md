# AI Image Processing Platform - Tài liệu Tính năng

## Tổng quan Hệ thống

Đây là một nền tảng xử lý ảnh AI toàn diện với các tính năng chính:
- **Virtual Try-On**: Thử quần áo ảo với AI
- **Product Image Generator**: Tạo prompt hình ảnh sản phẩm dựa trên painpoint
- **Product AI Flow**: Tạo 5 hình ảnh sản phẩm cho các painpoint khác nhau
- **Product Analysis**: Phân tích sản phẩm với AI
- **Video Generation**: Tạo video từ hình ảnh
- **Image Processing**: Xử lý và tối ưu hóa hình ảnh

---

## 1. VIRTUAL TRY-ON (Thử quần áo ảo)

### Mục tiêu
Cho phép người dùng thử quần áo ảo bằng cách kết hợp hình ảnh người mẫu và sản phẩm quần áo.

### Tính năng chính
- Upload hình ảnh người mẫu và sản phẩm
- Nhập URL hình ảnh
- Custom prompt để tùy chỉnh kết quả
- Tạo hình ảnh thử quần áo thực tế
- Download và chia sẻ kết quả

### Files liên quan
**Backend:**
- `backend/src/routes/images.ts` - API endpoints cho virtual try-on
- `backend/src/services/imageProcessingService.ts` - Xử lý hình ảnh với AI
- `backend/src/middleware/auth.ts` - Xác thực người dùng

**Frontend:**
- `frontend/src/pages/VirtualTryOnPage.tsx` - Giao diện chính
- `frontend/src/components/ImageUpload.tsx` - Component upload hình ảnh
- `frontend/src/services/api.ts` - API calls

**Database:**
- `ImageProcess` model - Lưu trữ quá trình xử lý hình ảnh

### API Endpoints
- `POST /api/images/virtual-tryon` - Upload files và tạo virtual try-on
- `POST /api/images/virtual-tryon-urls` - Sử dụng URLs
- `POST /api/images/tryon` - Public endpoint (không cần auth)
- `GET /api/images/history` - Lịch sử xử lý
- `GET /api/images/stats` - Thống kê

---

## 2. PRODUCT IMAGE GENERATOR

### Mục tiêu
Tạo prompt hình ảnh sản phẩm dựa trên painpoint của khách hàng cho thị trường US.

### Tính năng chính
- Upload hình ảnh sản phẩm
- AI phân tích painpoint và tạo 5 prompts
- Tạo hình ảnh từ prompts
- Giữ nguyên thiết kế sản phẩm gốc
- Thay đổi bối cảnh, ánh sáng, môi trường

### Files liên quan
**Backend:**
- `backend/src/routes/productImageGenerator.ts` - API endpoints
- `backend/src/services/imageProcessingService.ts` - Xử lý AI

**Frontend:**
- `frontend/src/pages/ProductImageGeneratorPage.tsx` - Giao diện chính
- `frontend/src/pages/ProductImageGeneratorDetailPage.tsx` - Chi tiết kết quả
- `frontend/src/services/productImageGeneratorService.ts` - API service

**Database:**
- `ProductImageGenerator` model - Lưu trữ generators và kết quả

### API Endpoints
- `GET /api/product-image-generators` - Danh sách generators
- `POST /api/product-image-generators` - Tạo generator mới
- `POST /api/product-image-generators/:id/generate` - Tạo prompts
- `POST /api/product-image-generators/:id/generate-image` - Tạo hình ảnh
- `DELETE /api/product-image-generators/:id` - Xóa generator

---

## 3. PRODUCT AI FLOW

### Mục tiêu
Tạo 5 hình ảnh sản phẩm cho 5 painpoint khác nhau mà khách hàng gặp phải.

### Tính năng chính
- Upload hình ảnh sản phẩm
- AI phân tích 5 painpoint
- Tạo 5 hình ảnh tương ứng với mỗi painpoint
- Giữ nguyên sản phẩm gốc, chỉ thay đổi bối cảnh
- Tạo hình ảnh với DALL-E 2

### Files liên quan
**Backend:**
- `backend/src/routes/productAIFlow.ts` - API endpoints
- `backend/src/services/imageProcessingService.ts` - Xử lý AI

**Frontend:**
- `frontend/src/pages/ProductAIFlowPage.tsx` - Giao diện chính
- `frontend/src/pages/ProductAIFlowDetailPage.tsx` - Chi tiết kết quả
- `frontend/src/services/productAIFlowService.ts` - API service

**Database:**
- `ProductAIFlow` model - Lưu trữ AI flows và kết quả

### API Endpoints
- `GET /api/product-ai-flows` - Danh sách AI flows
- `POST /api/product-ai-flows` - Tạo AI flow mới
- `POST /api/product-ai-flows/upload` - Upload file và tạo AI flow
- `POST /api/product-ai-flows/:id/generate` - Tạo 5 hình ảnh
- `DELETE /api/product-ai-flows/:id` - Xóa AI flow

---

## 4. PRODUCT ANALYSIS

### Mục tiêu
Phân tích sản phẩm để phục vụ nghiên cứu thị trường, lên kế hoạch bán hàng và phát triển nội dung.

### Tính năng chính
- Upload hình ảnh sản phẩm hoặc URL
- AI phân tích target users
- Phân tích painpoints và solutions
- Tạo image prompts cho từng painpoint
- Phân tích thị trường Việt Nam

### Files liên quan
**Backend:**
- `backend/src/routes/products.ts` - API endpoints
- `backend/src/services/imageProcessingService.ts` - Xử lý AI

**Frontend:**
- `frontend/src/pages/ProductAnalysisPage.tsx` - Giao diện chính
- `frontend/src/pages/ProductDetailPage.tsx` - Chi tiết phân tích
- `frontend/src/services/api.ts` - API calls

**Database:**
- `Product` model - Lưu trữ sản phẩm và kết quả phân tích

### API Endpoints
- `GET /api/products` - Danh sách sản phẩm
- `POST /api/products` - Tạo sản phẩm mới
- `POST /api/products/:id/analyze` - Phân tích sản phẩm
- `DELETE /api/products/:id` - Xóa sản phẩm

---

## 5. VIDEO GENERATION

### Mục tiêu
Tạo video từ hình ảnh tĩnh sử dụng AI.

### Tính năng chính
- Upload hình ảnh
- Nhập prompt mô tả chuyển động
- Tạo video với Hugging Face API
- Download video kết quả

### Files liên quan
**Backend:**
- `backend/src/routes/video.ts` - API endpoints

**Frontend:**
- `frontend/src/pages/VideoTestPage.tsx` - Giao diện chính
- `frontend/src/services/api.ts` - API calls

**Database:**
- `VideoProcess` model - Lưu trữ quá trình tạo video

### API Endpoints
- `POST /api/video/create` - Tạo video từ hình ảnh
- `GET /api/video/history` - Lịch sử tạo video

---

## 6. IMAGE PROCESSING

### Mục tiêu
Xử lý và tối ưu hóa hình ảnh sản phẩm.

### Tính năng chính
- Upload hình ảnh sản phẩm
- Xử lý với background tùy chọn
- Tối ưu hóa cho e-commerce
- Tạo hình ảnh chuyên nghiệp

### Files liên quan
**Backend:**
- `backend/src/routes/images.ts` - API endpoints
- `backend/src/services/imageProcessingService.ts` - Xử lý hình ảnh

**Frontend:**
- `frontend/src/pages/ProductImageToolsPage.tsx` - Giao diện chính

### API Endpoints
- `POST /api/images/process-files` - Upload files và xử lý
- `POST /api/images/process-urls` - Sử dụng URLs
- `POST /api/images/process-product-files` - Xử lý sản phẩm
- `POST /api/images/process-product-urls` - Xử lý sản phẩm từ URL

---

## 7. USER MANAGEMENT

### Mục tiêu
Quản lý người dùng, xác thực và phân quyền.

### Tính năng chính
- Đăng ký/đăng nhập
- Google OAuth
- Quản lý profile
- Hệ thống credits
- Xác thực email

### Files liên quan
**Backend:**
- `backend/src/routes/auth.ts` - API xác thực
- `backend/src/middleware/auth.ts` - Middleware xác thực
- `backend/src/middleware/passport.ts` - Google OAuth
- `backend/src/services/emailService.ts` - Gửi email

**Frontend:**
- `frontend/src/pages/LoginPage.tsx` - Đăng nhập
- `frontend/src/pages/RegisterPage.tsx` - Đăng ký
- `frontend/src/pages/ProfilePage.tsx` - Profile
- `frontend/src/contexts/AuthContext.tsx` - Context xác thực

**Database:**
- `User` model - Thông tin người dùng
- `Admin` model - Quản trị viên

### API Endpoints
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/profile` - Lấy profile
- `PUT /api/auth/profile` - Cập nhật profile
- `GET /api/auth/google` - Google OAuth
- `GET /api/auth/google/callback` - Google OAuth callback

---

## 8. ADMIN PANEL

### Mục tiêu
Quản lý hệ thống, người dùng và nội dung.

### Tính năng chính
- Dashboard thống kê
- Quản lý người dùng
- Xem lịch sử xử lý
- Quản lý credits
- Block/unblock users

### Files liên quan
**Backend:**
- `backend/src/routes/admin.ts` - API admin
- `backend/src/middleware/adminAuth.ts` - Xác thực admin

**Frontend:**
- `frontend/src/admin/AdminApp.tsx` - App admin
- `frontend/src/admin/pages/AdminDashboard.tsx` - Dashboard
- `frontend/src/admin/pages/AdminLogin.tsx` - Đăng nhập admin

**Database:**
- `Admin` model - Quản trị viên
- `AdminSession` model - Phiên admin

### API Endpoints
- `POST /api/admin/login` - Đăng nhập admin
- `GET /api/admin/users` - Danh sách users
- `PUT /api/admin/users/:id/credits` - Cập nhật credits
- `PUT /api/admin/users/:id/status` - Block/unblock user
- `GET /api/admin/dashboard` - Thống kê dashboard

---

## 9. DASHBOARD

### Mục tiêu
Tổng quan về hoạt động và thống kê của người dùng.

### Tính năng chính
- Hiển thị credits còn lại
- Thống kê xử lý hình ảnh
- Hoạt động gần đây
- Quick actions
- Tips và đề xuất

### Files liên quan
**Frontend:**
- `frontend/src/pages/DashboardPage.tsx` - Giao diện dashboard
- `frontend/src/services/dashboardService.ts` - API service

### API Endpoints
- `GET /api/images/dashboard-stats` - Thống kê dashboard

---

## 10. HISTORY & STATISTICS

### Mục tiêu
Theo dõi lịch sử xử lý và thống kê sử dụng.

### Tính năng chính
- Lịch sử xử lý hình ảnh
- Thống kê theo loại
- Tỷ lệ thành công
- Credits sử dụng

### Files liên quan
**Frontend:**
- `frontend/src/pages/HistoryPage.tsx` - Giao diện lịch sử

### API Endpoints
- `GET /api/images/history` - Lịch sử xử lý
- `GET /api/images/stats` - Thống kê

---

## Cấu trúc Database

### Models chính
1. **User** - Người dùng
2. **Admin** - Quản trị viên
3. **ImageProcess** - Quá trình xử lý hình ảnh
4. **Product** - Sản phẩm
5. **ProductImageGenerator** - Generator hình ảnh sản phẩm
6. **ProductAIFlow** - AI flow sản phẩm
7. **VideoProcess** - Quá trình tạo video
8. **SystemConfig** - Cấu hình hệ thống

### Relationships
- User có nhiều ImageProcess, Product, ProductImageGenerator, ProductAIFlow, VideoProcess
- Admin có nhiều AdminSession
- Tất cả models đều có timestamps (createdAt, updatedAt)

---

## AI Services Integration

### 1. Google Gemini
- **Model**: gemini-2.5-flash-image-preview
- **Sử dụng**: Virtual try-on, image processing
- **File**: `backend/src/services/imageProcessingService.ts`

### 2. OpenRouter
- **Models**: 
  - google/gemini-2.5-flash-image-preview
  - openai/gpt-4o-mini-search-preview
  - dall-e-2
- **Sử dụng**: Product analysis, image generation, AI flows
- **Files**: `backend/src/routes/products.ts`, `backend/src/routes/productImageGenerator.ts`, `backend/src/routes/productAIFlow.ts`

### 3. Hugging Face
- **Model**: fal-ai/ltxv-13b-098-distilled
- **Sử dụng**: Video generation
- **File**: `backend/src/routes/video.ts`

---

## Cấu trúc Frontend

### Pages chính
1. **DashboardPage** - Trang chủ
2. **VirtualTryOnPage** - Thử quần áo ảo
3. **ProductImageGeneratorPage** - Tạo prompt hình ảnh
4. **ProductAIFlowPage** - AI flow sản phẩm
5. **ProductAnalysisPage** - Phân tích sản phẩm
6. **VideoTestPage** - Tạo video
7. **HistoryPage** - Lịch sử
8. **ProfilePage** - Profile người dùng

### Components
- **Layout** - Layout chính
- **ImageUpload** - Upload hình ảnh
- **UI Components** - Button, Card, Input, etc.

### Services
- **api.ts** - API calls chung
- **dashboardService.ts** - Dashboard API
- **productImageGeneratorService.ts** - Product image generator API
- **productAIFlowService.ts** - Product AI flow API

---

## Cấu trúc Backend

### Routes
1. **auth.ts** - Xác thực
2. **images.ts** - Xử lý hình ảnh
3. **products.ts** - Sản phẩm
4. **productImageGenerator.ts** - Generator hình ảnh
5. **productAIFlow.ts** - AI flow
6. **video.ts** - Video
7. **admin.ts** - Admin

### Services
1. **imageProcessingService.ts** - Xử lý hình ảnh AI
2. **emailService.ts** - Gửi email

### Middleware
1. **auth.ts** - Xác thực người dùng
2. **adminAuth.ts** - Xác thực admin
3. **validation.ts** - Validation dữ liệu
4. **passport.ts** - Google OAuth

---

## Environment Variables

### Backend (.env)
```
# Database
DATABASE_URL="file:./dev.db"

# JWT
JWT_SECRET="your-jwt-secret"

# AI Services
GEMINI_API_KEY="your-gemini-key"
OPENROUTER_API_KEY="your-openrouter-key"
HF_TOKEN="your-huggingface-token"

# Email
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# URLs
FRONTEND_URL="http://localhost:3000"
SITE_URL="http://localhost:3000"
SITE_NAME="AI Image Processing"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

---

## Deployment

### Docker
- `docker-compose.yml` - Development
- `docker-compose.prod.yml` - Production
- `Dockerfile` - Backend container
- `nginx/` - Nginx configuration

### Scripts
- `deploy.sh` - Deploy script
- `deploy-multi-apps.sh` - Multi-app deployment
- `manage-multi-apps.sh` - Multi-app management

---

## Tính năng nổi bật

1. **Multi-modal AI**: Hỗ trợ cả text và image input
2. **Credit System**: Hệ thống tín dụng để kiểm soát sử dụng
3. **Real-time Processing**: Xử lý real-time với progress tracking
4. **Multi-language**: Hỗ trợ tiếng Việt và tiếng Anh
5. **Responsive Design**: Giao diện responsive cho mọi thiết bị
6. **Admin Panel**: Quản lý hệ thống toàn diện
7. **OAuth Integration**: Đăng nhập với Google
8. **File Upload**: Hỗ trợ upload file và URL
9. **Error Handling**: Xử lý lỗi toàn diện
10. **Security**: Bảo mật với JWT, rate limiting, validation

---

## Kết luận

Đây là một nền tảng AI image processing toàn diện với các tính năng:
- Virtual Try-On cho thời trang
- Product Image Generation cho e-commerce
- Product Analysis cho marketing
- Video Generation cho content
- Admin Panel cho quản lý

Hệ thống được xây dựng với kiến trúc modern, scalable và dễ bảo trì.
