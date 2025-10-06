# AIComercer - Tài liệu Tổng hợp

## 📋 Tổng quan

**AIComercer** (tên cũ: AI Image) là một nền tảng AI toàn diện giúp người dùng tạo và xử lý hình ảnh sản phẩm cho e-commerce, marketing và content creation. Ứng dụng sử dụng các công nghệ AI tiên tiến như Google Gemini, OpenRouter, và Hugging Face để cung cấp các tính năng xử lý hình ảnh thông minh.

### 🎯 Mục tiêu chính
- **Virtual Try-On**: Thử quần áo ảo với AI
- **Product Analysis**: Phân tích sản phẩm và thị trường
- **Image Generation**: Tạo hình ảnh sản phẩm từ prompts
- **Content Creation**: Tạo nội dung marketing cho sản phẩm
- **Video Generation**: Tạo video từ hình ảnh tĩnh

---

## 🏗️ Kiến trúc Hệ thống

### Cấu trúc thư mục
```
📁 AIComercer/
├── 📁 backend/                    # Backend API (Node.js + TypeScript)
│   ├── 📁 src/
│   │   ├── 📁 config/             # Environment configs
│   │   ├── 📁 database/           # Prisma client
│   │   ├── 📁 services/           # Business logic
│   │   ├── 📁 routes/             # API endpoints
│   │   ├── 📁 middleware/         # Auth, validation
│   │   └── server.ts              # Main server
│   ├── 📁 prisma/                 # Database schema
│   ├── 📁 uploads/                # File storage
│   └── package.json
├── 📁 frontend/                   # React frontend
│   ├── 📁 src/
│   │   ├── 📁 pages/              # Page components
│   │   ├── 📁 components/         # Reusable components
│   │   ├── 📁 services/           # API services
│   │   ├── 📁 contexts/           # React contexts
│   │   ├── 📁 i18n/               # Internationalization
│   │   └── App.tsx
│   └── package.json
├── 📁 nginx/                      # Nginx configuration
├── 📁 env-templates/              # Environment templates
└── docker-compose.yml
```

### Tech Stack

**Backend:**
- Node.js + TypeScript + Express
- Prisma ORM với SQLite
- JWT Authentication
- Google OAuth
- Multer cho file upload
- Sharp cho image processing

**Frontend:**
- React 18 + TypeScript
- Vite build tool
- TailwindCSS + Shopify Polaris
- React Router v6
- React Query cho state management
- React i18next cho đa ngôn ngữ

**AI Services:**
- Google Gemini 2.5 Flash
- OpenRouter (GPT-4, DALL-E 2)
- Hugging Face (Video generation)

---

## 🚀 Tính năng Chính

### 1. **Virtual Try-On** (Thử đồ ảo)
**Mục tiêu**: Cho phép người dùng thử quần áo ảo bằng cách kết hợp hình ảnh người mẫu và sản phẩm.

**Files liên quan:**
- **Backend**: `backend/src/routes/images.ts` (endpoints virtual-tryon)
- **Frontend**: `frontend/src/pages/VirtualTryOnPage.tsx`
- **Component**: `frontend/src/components/ImageUpload.tsx`

**API Endpoints:**
- `POST /api/images/virtual-tryon` - Upload files
- `POST /api/images/virtual-tryon-urls` - Sử dụng URLs
- `POST /api/images/tryon` - Public endpoint (không cần auth)

**Flow:**
1. User upload ảnh người mẫu + ảnh sản phẩm
2. AI xử lý với Google Gemini
3. Tạo ảnh thử đồ thực tế
4. Trả về kết quả base64

### 2. **Product Analysis Aff** (Phân tích sản phẩm)
**Mục tiêu**: Phân tích sản phẩm để tìm target market, painpoints và tạo content marketing.

**Files liên quan:**
- **Backend**: `backend/src/routes/productAffFlow.ts`
- **Frontend**: `frontend/src/pages/ProductAnalysisAffPage.tsx`
- **Detail**: `frontend/src/pages/ProductAnalysisAffDetailPage.tsx`
- **Components**: `frontend/src/components/ProductAnalysis/`

**API Endpoints:**
- `GET /api/product-aff` - Danh sách products
- `POST /api/product-aff` - Tạo product mới
- `POST /api/product-aff/:id/analyze` - Phân tích sản phẩm
- `POST /api/product-aff/:id/generate-images` - Tạo ảnh cho segments

**Flow:**
1. User upload ảnh sản phẩm + mô tả
2. AI phân tích target market (US/VN)
3. Tạo 3-5 customer segments
4. Tạo painpoints và solutions
5. Generate ảnh cho từng segment

### 3. **Product Image Generator** (Tạo ảnh sản phẩm)
**Mục tiêu**: Tạo prompt và hình ảnh sản phẩm dựa trên painpoint.

**Files liên quan:**
- **Backend**: `backend/src/routes/productImageGenerator.ts`
- **Frontend**: `frontend/src/pages/ProductImageGeneratorPage.tsx`
- **Detail**: `frontend/src/pages/ProductImageGeneratorDetailPage.tsx`

**API Endpoints:**
- `GET /api/product-image-generators` - Danh sách generators
- `POST /api/product-image-generators` - Tạo generator mới
- `POST /api/product-image-generators/:id/generate` - Tạo prompts
- `POST /api/product-image-generators/:id/generate-image` - Tạo ảnh

### 4. **Product AI Flow** (AI Flow sản phẩm)
**Mục tiêu**: Tạo 5 hình ảnh sản phẩm cho 5 painpoint khác nhau.

**Files liên quan:**
- **Backend**: `backend/src/routes/productAIFlow.ts`
- **Frontend**: `frontend/src/pages/ProductAIFlowPage.tsx`
- **Detail**: `frontend/src/pages/ProductAIFlowDetailPage.tsx`

**API Endpoints:**
- `GET /api/product-ai-flows` - Danh sách AI flows
- `POST /api/product-ai-flows` - Tạo AI flow mới
- `POST /api/product-ai-flows/:id/generate` - Tạo 5 ảnh

### 5. **Video Generation** (Tạo video)
**Mục tiêu**: Tạo video từ hình ảnh tĩnh sử dụng AI.

**Files liên quan:**
- **Backend**: `backend/src/routes/video.ts`
- **Frontend**: `frontend/src/pages/VideoTestPage.tsx`

**API Endpoints:**
- `POST /api/video/create` - Tạo video từ ảnh
- `GET /api/video/history` - Lịch sử tạo video

---

## 🗄️ Database Schema

### Models chính

**User** - Người dùng
```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  name      String?
  credits   Int      @default(10)
  isActive  Boolean  @default(true)
  isVerified Boolean @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Relations
  imageProcesses ImageProcess[]
  products      Product[]
  productAffs   ProductAff[]
  productAIFlows ProductAIFlow[]
  productImageGenerators ProductImageGenerator[]
  videoProcesses VideoProcess[]
}
```

**ProductAff** - Phân tích sản phẩm
```prisma
model ProductAff {
  id            String   @id @default(cuid())
  target_market String
  image1        String
  image2        String?
  title         String?
  description   String?
  language      String   @default("vi")
  segmentation_number Int @default(3)
  status        String   @default("waiting")
  analysis_result String?
  analyzed_at   DateTime?
  created_at    DateTime @default(now())
  updated_at    DateTime @updatedAt
  userId        String
  user          User     @relation(fields: [userId], references: [id])
}
```

**ProductAIFlow** - AI Flow sản phẩm
```prisma
model ProductAIFlow {
  id            String   @id @default(cuid())
  target_market String
  image1        String
  image2        String?
  title         String?
  description   String?
  status        String   @default("waiting")
  analysis_result String?
  image_url     String?
  ai_result     String?
  error_message String?
  generated_at  DateTime?
  analyzed_at   DateTime?
  created_at    DateTime @default(now())
  updated_at    DateTime @updatedAt
  user_id       String
  user          User     @relation(fields: [user_id], references: [id])
}
```

---

## 🌐 API Endpoints Chi tiết

### Authentication
- `POST /api/auth/register` - Đăng ký tài khoản
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/profile` - Lấy thông tin profile
- `PUT /api/auth/profile` - Cập nhật profile
- `GET /api/auth/google` - Google OAuth
- `GET /api/auth/google/callback` - Google OAuth callback

### Virtual Try-On
- `POST /api/images/virtual-tryon` - Upload files và tạo virtual try-on
- `POST /api/images/virtual-tryon-urls` - Sử dụng URLs
- `POST /api/images/tryon` - Public endpoint (không cần auth)
- `GET /api/images/history` - Lịch sử xử lý
- `GET /api/images/stats` - Thống kê

### Product Analysis Aff
- `GET /api/product-aff` - Danh sách products
- `GET /api/product-aff/:id` - Chi tiết product
- `POST /api/product-aff` - Tạo product mới
- `POST /api/product-aff/:id/analyze` - Phân tích sản phẩm
- `POST /api/product-aff/:id/generate-images` - Tạo ảnh cho segments
- `DELETE /api/product-aff/:id` - Xóa product

### Product Image Generator
- `GET /api/product-image-generators` - Danh sách generators
- `GET /api/product-image-generators/:id` - Chi tiết generator
- `POST /api/product-image-generators` - Tạo generator mới
- `POST /api/product-image-generators/:id/generate` - Tạo prompts
- `POST /api/product-image-generators/:id/generate-image` - Tạo ảnh
- `DELETE /api/product-image-generators/:id` - Xóa generator

### Product AI Flow
- `GET /api/product-ai-flows` - Danh sách AI flows
- `GET /api/product-ai-flows/:id` - Chi tiết AI flow
- `POST /api/product-ai-flows` - Tạo AI flow mới
- `POST /api/product-ai-flows/upload` - Upload file và tạo AI flow
- `POST /api/product-ai-flows/:id/generate` - Tạo 5 ảnh
- `DELETE /api/product-ai-flows/:id` - Xóa AI flow

### Video Generation
- `POST /api/video/create` - Tạo video từ ảnh
- `GET /api/video/history` - Lịch sử tạo video

### Admin
- `POST /api/admin/login` - Đăng nhập admin
- `GET /api/admin/dashboard` - Dashboard admin
- `GET /api/admin/users` - Quản lý users
- `PUT /api/admin/users/:id/credits` - Cập nhật credits
- `PUT /api/admin/users/:id/status` - Block/unblock user

---

## 🎨 Frontend Structure

### Pages chính
1. **DashboardPage** - Trang chủ với thống kê
2. **VirtualTryOnPage** - Thử quần áo ảo
3. **ProductAnalysisAffPage** - Phân tích sản phẩm (chính)
4. **ProductAnalysisAffDetailPage** - Chi tiết phân tích
5. **ProductImageGeneratorPage** - Tạo prompt hình ảnh
6. **ProductAIFlowPage** - AI flow sản phẩm
7. **VideoTestPage** - Tạo video
8. **HistoryPage** - Lịch sử
9. **ProfilePage** - Profile người dùng

### Components quan trọng
- **Layout** - Layout chính với sidebar navigation
- **ImageUpload** - Component upload hình ảnh
- **ProductAnalysis/** - Components cho phân tích sản phẩm
- **ui/** - UI components (Button, Card, Input, etc.)

### Navigation Menu (Hiện tại)
```typescript
const navigation = [
  { name: t('nav.home'), href: '/dashboard', icon: Home },
  { name: t('nav.virtualTryOn'), href: '/virtual-tryon', icon: Image },
  { name: t('productAnalysis'), href: '/product-analysis-aff', icon: Coins },
  { name: t('nav.profile'), href: '/profile', icon: User },
];
```

### Menu ẩn (Commented out)
```typescript
// { name: t('nav.productImageTools'), href: '/product-image-tools', icon: Package },
// { name: 'Phân tích sản phẩm', href: '/product-analysis', icon: BarChart3 },
// { name: 'Product Image Generator', href: '/product-image-generator', icon: Sparkles },
// { name: 'Product AI Flow', href: '/product-ai-flow', icon: Zap },
// { name: 'Video Test', href: '/video-test', icon: Video },
// { name: t('nav.history'), href: '/history', icon: History },
```

**Files liên quan menu ẩn:**
- **Product Image Tools**: `frontend/src/pages/ProductImageToolsPage.tsx`
- **Product Analysis (cũ)**: `frontend/src/pages/ProductAnalysisPage.tsx`
- **Product Image Generator**: `frontend/src/pages/ProductImageGeneratorPage.tsx`
- **Product AI Flow**: `frontend/src/pages/ProductAIFlowPage.tsx`
- **Video Test**: `frontend/src/pages/VideoTestPage.tsx`
- **History**: `frontend/src/pages/HistoryPage.tsx`

---

## 🌍 Internationalization (i18n)

### Cấu trúc Translation
- **File config**: `frontend/src/i18n/index.ts`
- **Locales**: 
  - `frontend/src/i18n/locales/vi.json` - Tiếng Việt
  - `frontend/src/i18n/locales/en.json` - English

### Cách sử dụng Translation
```typescript
import { useTranslation } from 'react-i18next';

const { t, i18n } = useTranslation();

// Sử dụng
t('nav.home') // "Trang chủ" hoặc "Home"
t('common.loading') // "Đang tải..." hoặc "Loading..."

// Đổi ngôn ngữ
i18n.changeLanguage('vi'); // Chuyển sang tiếng Việt
i18n.changeLanguage('en'); // Chuyển sang English
```

### Cấu trúc Translation Keys
```json
{
  "common": {
    "loading": "Đang tải...",
    "error": "Lỗi",
    "success": "Thành công",
    "creditsRemaining": "tín dụng còn lại"
  },
  "nav": {
    "home": "Trang chủ",
    "virtualTryOn": "Thử đồ ảo",
    "profile": "Hồ sơ"
  },
  "auth": {
    "login": {
      "title": "Đăng nhập vào tài khoản",
      "email": "Địa chỉ Email"
    }
  }
}
```

### Language Toggle
- **Component**: Button trong Layout sidebar
- **Function**: `toggleLanguage()` trong `Layout.tsx`
- **Storage**: Lưu preference trong `localStorage`

---

## 🔧 Environment Variables

### Backend (.env)
```bash
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
```bash
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

---

## 🚀 Deployment

### Docker Setup
- **Development**: `docker-compose.yml`
- **Production**: `docker-compose.prod.yml`
- **Nginx**: `nginx/` configuration

### Deploy Scripts
- `deploy.sh` - Deploy script chính
- `deploy-multi-apps.sh` - Multi-app deployment
- `manage-multi-apps.sh` - Multi-app management
- `emergency-deploy.sh` - Emergency deployment

### Production Commands
```bash
# Build và deploy
./deploy.sh

# Multi-app deployment
./deploy-multi-apps.sh

# Emergency deploy
./emergency-deploy.sh
```

---

## 🔐 Security Features

- **JWT Authentication** - Token-based auth
- **Password Hashing** - bcrypt
- **Rate Limiting** - Express rate limit
- **CORS Protection** - Cross-origin protection
- **Input Validation** - Joi validation
- **File Type Validation** - Multer file filtering
- **SQL Injection Protection** - Prisma ORM

---

## 📊 AI Services Integration

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

## 🎯 Tính năng Nổi bật

1. **Multi-modal AI** - Hỗ trợ cả text và image input
2. **Credit System** - Hệ thống tín dụng kiểm soát sử dụng
3. **Real-time Processing** - Xử lý real-time với progress tracking
4. **Multi-language** - Hỗ trợ tiếng Việt và tiếng Anh
5. **Responsive Design** - Giao diện responsive cho mọi thiết bị
6. **Admin Panel** - Quản lý hệ thống toàn diện
7. **OAuth Integration** - Đăng nhập với Google
8. **File Upload** - Hỗ trợ upload file và URL
9. **Error Handling** - Xử lý lỗi toàn diện
10. **Security** - Bảo mật với JWT, rate limiting, validation

---

## 📈 Monitoring & Logs

### Health Check
```bash
curl http://localhost:3001/health
```

### Logs
```bash
# Docker logs
docker-compose logs -f backend

# Application logs
tail -f backend/logs/app.log
```

### Database
```bash
# Prisma Studio
cd backend && npx prisma studio

# Database shell
docker-compose exec postgres psql -U admin -d aiimage
```

---

## 🚨 Troubleshooting

### Common Issues

1. **Database connection failed**
   - Check DATABASE_URL
   - Ensure SQLite file exists
   - Check file permissions

2. **Prisma client not generated**
   - Run `npx prisma generate`
   - Check Prisma schema syntax

3. **File upload errors**
   - Check upload directory permissions
   - Verify MAX_FILE_SIZE setting
   - Check disk space

4. **AI service errors**
   - Verify API keys
   - Check API quotas
   - Review service logs

### Debug Mode
```bash
# Enable debug logging
export LOG_LEVEL=debug
npm run dev
```

---

## 🔄 Development Workflow

### Backend Development
```bash
cd backend
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
```

### Frontend Development
```bash
cd frontend
npm install
npm run dev
```

### Database Management
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database
npx prisma db seed

# Open Prisma Studio
npx prisma studio
```

---

## 📝 Kết luận

AIComercer là một nền tảng AI image processing toàn diện với các tính năng:

- **Virtual Try-On** cho thời trang
- **Product Analysis** cho marketing và e-commerce
- **Image Generation** cho content creation
- **Video Generation** cho multimedia content
- **Admin Panel** cho quản lý hệ thống

Hệ thống được xây dựng với kiến trúc modern, scalable và dễ bảo trì, sử dụng các công nghệ AI tiên tiến để cung cấp trải nghiệm người dùng tốt nhất.

### Các tính năng chính đang hoạt động:
1. ✅ Virtual Try-On
2. ✅ Product Analysis Aff (chính)
3. ✅ User Authentication & Management
4. ✅ Multi-language Support
5. ✅ Admin Panel

### Các tính năng ẩn (có thể kích hoạt):
1. 🔒 Product Image Tools
2. 🔒 Product Image Generator
3. 🔒 Product AI Flow
4. 🔒 Video Generation
5. 🔒 History Tracking

Hệ thống sẵn sàng cho production với đầy đủ tính năng bảo mật, monitoring và deployment automation.
