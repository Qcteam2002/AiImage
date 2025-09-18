import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3002,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // OpenRouter API (for Gemini 2.5 Flash Image Preview)
  gemini: {
    apiKey: process.env.OPENROUTER_API_KEY || process.env.GEMINI_API_KEY || ''
  },
  
  // File Upload
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB
    uploadPath: process.env.UPLOAD_PATH || './uploads',
    allowedMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif'
    ]
  },
  
  // External APIs
  mainApiUrl: process.env.MAIN_API_URL || 'http://localhost:3001',
  
  // CORS
  allowedOrigins: [
    'http://localhost:3000', // Frontend
    'http://localhost:3001'  // Main API
  ]
};
