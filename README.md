# AI Image - Fashion Photography Optimizer

A modern web application that uses Google Gemini AI to transform fashion photography by combining model images with product images to create professional fashion photography.

## 🌟 Features

- **User Authentication**: Email registration, login, and verification system
- **Credit System**: Each new user gets 5 free credits
- **AI Image Processing**: Combine model and product images using Google Gemini AI
- **Multi-upload Options**: Upload files or provide URLs
- **Multi-language Support**: English and Vietnamese
- **Modern UI**: Clean, neutral design with responsive layout
- **Image History**: Track and download previous processed images
- **API Architecture**: Separate image processing API for scalability

## 🏗️ Architecture

```
├── backend/                 # Main API server (Node.js + TypeScript)
├── image-processing-api/    # Dedicated image processing service
├── frontend/               # React frontend application
└── docker-compose.yml      # Database setup
```

### Tech Stack

**Backend:**
- Node.js + TypeScript + Express
- PostgreSQL (with Docker)
- Redis for caching
- JWT authentication
- Knex.js for database migrations
- Nodemailer for email verification

**Image Processing API:**
- Google Gemini AI integration
- Sharp for image optimization
- Multer for file uploads
- Express + TypeScript

**Frontend:**
- React 18 + TypeScript
- Vite for build tooling
- TailwindCSS for styling
- React Router for navigation
- React Hook Form for forms
- React Query for API state management
- React i18next for internationalization

## 📋 Prerequisites

- Node.js 18+ 
- Docker & Docker Compose
- Google Gemini API Key

## 🚀 Quick Start

### 1. Clone and Setup

```bash
git clone <repository-url>
cd AIImage
```

### 2. Start Database

```bash
docker-compose up -d
```

### 3. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Edit .env file with your configuration:
# - Database credentials
# - JWT secret key
# - Email SMTP settings
# - Gemini API key

# Run database migrations
npm run migrate

# Start development server
npm run dev
```

The backend API will be available at `http://localhost:3001`

### 4. Image Processing API Setup

```bash
cd image-processing-api

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Edit .env file with your Gemini API key:
# GEMINI_API_KEY=your-gemini-api-key-here

# Start development server
npm run dev
```

The image processing API will be available at `http://localhost:3002`

### 5. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:3000`

## 🔑 Environment Variables

### Backend (.env)
```env
# Server
PORT=3001
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=admin
DB_PASSWORD=admin123
DB_NAME=aiimage

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Email (Gmail SMTP example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@aiimage.com

# Image Processing API
IMAGE_PROCESSING_API_URL=http://localhost:3002

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### Image Processing API (.env)
```env
PORT=3002
NODE_ENV=development

# Google Gemini AI
GEMINI_API_KEY=your-gemini-api-key-here

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3001/api
```

## 📱 Usage

1. **Register**: Create a new account with email verification
2. **Login**: Sign in to your verified account
3. **Upload Images**: 
   - Choose between file upload or URL input
   - Upload a model image and product image
   - Add custom prompts (optional)
4. **Process**: Click "Optimize Images" to generate AI-processed result
5. **Download**: Download your processed image
6. **Track**: View processing history and download previous results

## 🗃️ Database Schema

### Users Table
- `id` (UUID, Primary Key)
- `email` (Unique)
- `password_hash`
- `first_name`, `last_name`
- `credits` (Default: 5)
- `is_verified` (Boolean)
- `verification_token`
- `email_verified_at`
- `created_at`, `updated_at`

### Image Processes Table
- `id` (UUID, Primary Key)  
- `user_id` (Foreign Key to Users)
- `model_image_url`
- `product_image_url`
- `result_image_url`
- `status` (processing, completed, failed)
- `error_message`
- `metadata` (JSON)
- `created_at`, `updated_at`

## 🔧 Development

### Backend Development
```bash
cd backend
npm run dev          # Start with auto-reload
npm run build        # Build for production
npm run migrate      # Run database migrations
```

### Image Processing API Development
```bash
cd image-processing-api
npm run dev          # Start with auto-reload
npm run build        # Build for production
```

### Frontend Development
```bash
cd frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

## 🔐 Security Features

- Password hashing with bcrypt
- JWT token authentication
- Email verification system
- Rate limiting
- CORS protection
- Input validation
- File type and size restrictions

## 🌍 Internationalization

The app supports English and Vietnamese languages. Users can switch languages from the UI, and the selection is persisted in localStorage.

## 📦 Production Deployment

1. **Build all services:**
```bash
# Backend
cd backend && npm run build

# Image Processing API  
cd image-processing-api && npm run build

# Frontend
cd frontend && npm run build
```

2. **Set up production database**
3. **Configure production environment variables**
4. **Deploy using your preferred method** (Docker, PM2, etc.)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📚 Documentation

Comprehensive documentation is available in the `/docs` directory:

- **[Complete Documentation Index](./docs/README.md)** - Start here
- **[API Documentation](./docs/api/README.md)** - All API references
- **[Deployment Guide](./docs/deployment/README.md)** - ⚠️ Read before deploying
- **[Developer Guides](./docs/guides/README.md)** - Quick start & troubleshooting
- **[Feature Documentation](./docs/features/README.md)** - Feature-specific guides

### Quick Links
- [Quick Start Guide](./docs/guides/quick-start.md)
- [⚠️ Deployment Warning](./docs/deployment/DEPLOY_WARNING.md) - MUST READ
- [Product Analysis Guide](./docs/guides/product-analysis.md)
- [API Integration Fixes](./docs/guides/api-integration-fixes.md)

## 📄 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Common Issues

**Database Connection Issues:**
- Ensure Docker is running
- Check database credentials in .env
- Verify ports are not in use

**Image Processing Fails:**
- Verify Gemini API key is correct
- Check image file formats and sizes
- Ensure both APIs are running

**Email Verification Not Working:**
- Check SMTP credentials
- Verify email service allows less secure apps (Gmail)
- Check spam folder

### Support

For support, please create an issue in the repository or contact the development team.
