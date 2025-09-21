import dotenv from 'dotenv';

dotenv.config();

// Environment validation
const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'GEMINI_API_KEY'
];

// Check for required environment variables
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ Missing required environment variable: ${envVar}`);
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
}

export const config = {
  // Server
  port: parseInt(process.env.PORT || '3001'),
  nodeEnv: process.env.NODE_ENV || 'development',
  host: process.env.HOST || '0.0.0.0',
  
  // Database
  database: {
    url: process.env.DATABASE_URL!,
    maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '10'),
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
  },
  
  // Redis
  redis: {
    url: process.env.REDIS_URL || `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || '6379'}`,
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0')
  },
  
  // JWT
  jwt: {
    secret: process.env.JWT_SECRET!,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d'
  } as const,
  
  // Email
  email: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || '',
    password: process.env.SMTP_PASSWORD || '',
    from: process.env.SMTP_FROM || 'noreply@aiimage.com'
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
    ],
    tempPath: process.env.TEMP_PATH || './uploads/temp',
    generatedPath: process.env.GENERATED_PATH || './uploads/generated'
  },
  
  // AI Services
  ai: {
    gemini: {
      apiKey: process.env.GEMINI_API_KEY!,
      model: process.env.GEMINI_MODEL || 'google/gemini-2.5-flash-image-preview'
    },
    openrouter: {
      apiKey: process.env.OPENROUTER_API_KEY,
      baseUrl: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1'
    }
  },
  
  // CORS
  cors: {
    origins: process.env.CORS_ORIGINS?.split(',') || [
      'http://localhost:3000',
      'http://localhost:3001'
    ],
    credentials: true
  },
  
  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX || '100'),
    message: 'Too many requests from this IP, please try again later.'
  },
  
  // Security
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12'),
    sessionSecret: process.env.SESSION_SECRET || process.env.JWT_SECRET!,
    cookieSecure: process.env.NODE_ENV === 'production',
    cookieSameSite: process.env.COOKIE_SAME_SITE as 'strict' | 'lax' | 'none' || 'lax'
  },
  
  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'combined'
  },
  
  // External URLs
  urls: {
    frontend: process.env.FRONTEND_URL || 'http://localhost:3000',
    api: process.env.API_URL || `http://localhost:${process.env.PORT || '3001'}`,
    siteUrl: process.env.SITE_URL || 'https://your-domain.com',
    siteName: process.env.SITE_NAME || 'AI Image Processing'
  }
};

// Validation helper
export const validateConfig = () => {
  const errors: string[] = [];
  
  if (!config.database.url) {
    errors.push('DATABASE_URL is required');
  }
  
  if (!config.jwt.secret) {
    errors.push('JWT_SECRET is required');
  }
  
  if (!config.ai.gemini.apiKey) {
    errors.push('GEMINI_API_KEY is required');
  }
  
  if (errors.length > 0) {
    throw new Error(`Configuration errors:\n${errors.join('\n')}`);
  }
  
  return true;
};

// Export config validation
export default config;
