import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';
import { config, validateConfig } from './config';
import { prisma } from './database/client';
import authRoutes from './routes/auth';
import imageRoutes from './routes/images';
import adminRoutes from './routes/admin';

// Validate configuration
try {
  validateConfig();
} catch (error) {
  console.error('❌ Configuration validation failed:', error);
  process.exit(1);
}

const app = express();

// Ensure upload directories exist
const uploadDirs = [
  config.upload.uploadPath,
  config.upload.tempPath,
  config.upload.generatedPath
];

uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors({
  origin: config.cors.origins,
  credentials: config.cors.credentials
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: config.rateLimit.message
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check
app.get('/health', async (req, res) => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      environment: config.nodeEnv,
      services: {
        database: 'connected',
        ai: config.ai.gemini.apiKey ? 'configured' : 'not configured'
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      environment: config.nodeEnv,
      error: 'Database connection failed'
    });
  }
});

// Static file serving for generated images
app.use('/generated', express.static(config.upload.generatedPath));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/admin', adminRoutes);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  
  // Handle multer errors
  if (err.message.includes('Unsupported file type')) {
    return res.status(400).json({ error: err.message });
  }
  
  if (err.message.includes('File too large')) {
    return res.status(400).json({ error: 'File size exceeds limit' });
  }
  
  res.status(500).json({ 
    error: config.nodeEnv === 'production' ? 'Internal server error' : err.message 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = config.port;
const HOST = config.host;

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 SIGINT received, shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

app.listen(PORT, HOST, () => {
  console.log(`🚀 AI Image Processing API running on ${HOST}:${PORT}`);
  console.log(`📱 Environment: ${config.nodeEnv}`);
  console.log(`🌐 CORS Origins: ${config.cors.origins.join(', ')}`);
  console.log(`📁 Upload Path: ${config.upload.uploadPath}`);
  console.log(`🤖 AI Services: ${config.ai.gemini.apiKey ? '✅ Configured' : '❌ Not configured'}`);
});
