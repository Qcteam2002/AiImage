# AI Image Processing - Unified Architecture

## 🏗️ Kiến trúc mới

Dự án đã được refactor để có kiến trúc thống nhất, dễ deploy và maintain hơn.

### 📁 Cấu trúc thư mục

```
📁 backend/                    # Backend thống nhất
├── 📁 src/
│   ├── 📁 config/             # Environment configs
│   ├── 📁 database/           # Prisma client
│   ├── 📁 services/           # Business logic
│   │   ├── imageProcessingService.ts
│   │   ├── geminiService.ts
│   │   └── emailService.ts
│   ├── 📁 routes/             # API routes
│   │   ├── auth.ts
│   │   ├── images.ts          # Tất cả image APIs
│   │   └── admin.ts
│   ├── 📁 middleware/         # Auth, validation
│   └── server.ts              # Main server
├── 📁 prisma/                 # Database schema
├── 📁 uploads/                # File storage
├── Dockerfile
└── package.json

📁 frontend/                   # React frontend
├── 📁 src/
└── package.json

📁 env-templates/              # Environment templates
├── backend.env
└── frontend.env
```

## 🚀 Cải tiến chính

### 1. **Backend thống nhất**
- ✅ Tích hợp tất cả APIs vào 1 service
- ✅ Loại bỏ image-processing-api riêng biệt
- ✅ Dễ deploy và scale

### 2. **Prisma ORM**
- ✅ Thay thế Knex bằng Prisma
- ✅ Type-safe database operations
- ✅ Auto-generated client
- ✅ Migration system tốt hơn

### 3. **Environment Configuration**
- ✅ Config linh hoạt qua environment variables
- ✅ Validation config khi khởi động
- ✅ Templates cho development/production

### 4. **Docker & Deployment**
- ✅ Docker Compose với health checks
- ✅ Graceful shutdown
- ✅ Production-ready Dockerfile
- ✅ Deployment script tự động

## 🛠️ Cài đặt và chạy

### Development

```bash
# 1. Copy environment template
cp env-templates/backend.env .env

# 2. Edit .env với config của bạn
nano .env

# 3. Install dependencies
cd backend
npm install

# 4. Setup database
npx prisma migrate dev
npx prisma db seed

# 5. Start development server
npm run dev
```

### Production với Docker

```bash
# 1. Setup environment
cp env-templates/backend.env .env
# Edit .env với production config

# 2. Deploy với script
./deploy.sh
```

### Manual Docker deployment

```bash
# Build và start services
docker-compose up -d

# Check logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/verify-email` - Xác thực email

### Image Processing
- `POST /api/images/process-files` - Xử lý ảnh từ file upload
- `POST /api/images/process-urls` - Xử lý ảnh từ URLs
- `POST /api/images/process-product-files` - Xử lý ảnh sản phẩm
- `POST /api/images/process-product-urls` - Xử lý ảnh sản phẩm từ URLs
- `POST /api/images/virtual-tryon` - Virtual try-on từ files
- `POST /api/images/virtual-tryon-urls` - Virtual try-on từ URLs
- `GET /api/images/history` - Lịch sử xử lý
- `GET /api/images/stats` - Thống kê
- `GET /api/images/download/:filename` - Download ảnh

### Admin
- `POST /api/admin/login` - Admin login
- `GET /api/admin/dashboard` - Admin dashboard
- `GET /api/admin/users` - Quản lý users
- `GET /api/admin/processes` - Quản lý processes

## 🔧 Environment Variables

### Required
```bash
DATABASE_URL=postgresql://user:pass@host:port/db
JWT_SECRET=your-secret-key
GEMINI_API_KEY=your-gemini-key
```

### Optional
```bash
# Server
PORT=3001
HOST=0.0.0.0
NODE_ENV=production

# Database
DB_MAX_CONNECTIONS=10
DB_SSL=false

# Redis
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=
REDIS_DB=0

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email
SMTP_PASSWORD=your-password

# AI Services
OPENROUTER_API_KEY=your-openrouter-key
GEMINI_MODEL=gemini-2.5-flash-image-preview

# CORS
CORS_ORIGINS=http://localhost:3000,https://yourdomain.com

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

## 🗄️ Database Schema

### Users
- `id` - UUID primary key
- `email` - Unique email
- `password` - Hashed password
- `credits` - Available credits
- `isActive` - Account status
- `isVerified` - Email verification status

### ImageProcesses
- `id` - UUID primary key
- `userId` - Foreign key to users
- `modelImageUrl` - Model image URL/path
- `productImageUrl` - Product image URL/path
- `resultImageUrl` - Generated result URL/path
- `status` - PENDING/PROCESSING/COMPLETED/FAILED
- `metadata` - JSON metadata
- `createdAt` - Timestamp

### Admins
- `id` - UUID primary key
- `email` - Admin email
- `password` - Hashed password
- `role` - SUPER_ADMIN/ADMIN/MODERATOR
- `isActive` - Admin status

## 🔄 Migration từ kiến trúc cũ

1. **Backup database hiện tại**
2. **Update environment variables**
3. **Run migration script**
4. **Test APIs**
5. **Update frontend URLs nếu cần**

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

## 🚨 Troubleshooting

### Common Issues

1. **Database connection failed**
   - Check DATABASE_URL
   - Ensure PostgreSQL is running
   - Check network connectivity

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

## 🔐 Security

- ✅ JWT authentication
- ✅ Password hashing với bcrypt
- ✅ Rate limiting
- ✅ CORS protection
- ✅ Input validation
- ✅ File type validation
- ✅ SQL injection protection (Prisma)

## 📝 Next Steps

1. **Performance optimization**
2. **Caching với Redis**
3. **Background job processing**
4. **API documentation với Swagger**
5. **Monitoring với Prometheus**
6. **CI/CD pipeline**
