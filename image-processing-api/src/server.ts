import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import fs from 'fs';
import { config } from './config';
import processRoutes from './routes/process';
import tryonRoutes from './routes/tryon';

const app = express();

// Ensure upload directories exist
const uploadDirs = [
  config.upload.uploadPath,
  path.join(config.upload.uploadPath, 'temp'),
  path.join(config.upload.uploadPath, 'generated')
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
  origin: config.allowedOrigins,
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'Image Processing API',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
    geminiConfigured: !!config.gemini.apiKey
  });
});

// Routes
app.use('/api', processRoutes);
app.use('/api/tryon', tryonRoutes);

// Static file serving for generated images
app.use('/generated', express.static(path.join(config.upload.uploadPath, 'generated')));

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

app.listen(PORT, () => {
  console.log(`🎨 Image Processing API running on port ${PORT}`);
  console.log(`📱 Environment: ${config.nodeEnv}`);
  console.log(`📁 Upload path: ${config.upload.uploadPath}`);
  console.log(`🤖 Gemini AI: ${config.gemini.apiKey ? '✅ Configured' : '❌ Not configured'}`);
});
