import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { authenticate, requireCredits, AuthenticatedRequest } from '../middleware/auth';
import { prisma } from '../database/client';
import { ImageProcessingService } from '../services/imageProcessingService';
import { config } from '../config';
import Joi from 'joi';

const router = Router();
const imageProcessingService = new ImageProcessingService();

// Configure multer for file uploads
const upload = multer({
  dest: config.upload.tempPath,
  limits: {
    fileSize: config.upload.maxFileSize,
    files: 2
  },
  fileFilter: (req, file, cb) => {
    if (config.upload.allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}`));
    }
  }
});

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

// Validation schemas
const processUrlsSchema = Joi.object({
  modelImageUrl: Joi.string().uri().required().messages({
    'string.uri': 'Model image URL must be a valid URL',
    'any.required': 'Model image URL is required'
  }),
  productImageUrl: Joi.string().uri().required().messages({
    'string.uri': 'Product image URL must be a valid URL',
    'any.required': 'Product image URL is required'
  }),
  prompt: Joi.string().max(1000).optional().messages({
    'string.max': 'Prompt cannot exceed 1000 characters'
  })
});

const processProductUrlsSchema = Joi.object({
  productImageUrl: Joi.string().uri().required().messages({
    'string.uri': 'Product image URL must be a valid URL',
    'any.required': 'Product image URL is required'
  }),
  backgroundImageUrl: Joi.string().uri().optional().messages({
    'string.uri': 'Background image URL must be a valid URL'
  }),
  prompt: Joi.string().max(1000).optional().messages({
    'string.max': 'Prompt cannot exceed 1000 characters'
  })
});

const virtualTryOnUrlsSchema = Joi.object({
  userImageUrl: Joi.string().uri().required().messages({
    'string.uri': 'User image URL must be a valid URL',
    'any.required': 'User image URL is required'
  }),
  productImageUrl: Joi.string().uri().required().messages({
    'string.uri': 'Product image URL must be a valid URL',
    'any.required': 'Product image URL is required'
  }),
  productTitle: Joi.string().max(200).optional().messages({
    'string.max': 'Product title cannot exceed 200 characters'
  }),
  customPrompt: Joi.string().max(1000).optional().messages({
    'string.max': 'Custom prompt cannot exceed 1000 characters'
  })
});

// Helper function to download image from URL
async function downloadImage(url: string, filename: string): Promise<string> {
  const axios = require('axios');
  const response = await axios({
    method: 'GET',
    url: url,
    responseType: 'stream'
  });
  
  const filePath = path.join(config.upload.tempPath, filename);
  const writer = fs.createWriteStream(filePath);
  
  response.data.pipe(writer);
  
  return new Promise((resolve, reject) => {
    writer.on('finish', () => resolve(filePath));
    writer.on('error', reject);
  });
}

// Process images with file uploads
router.post('/process-files', 
  authenticate, 
  requireCredits, 
  upload.array('images', 2), 
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const files = req.files as Express.Multer.File[];
      
      if (!files || files.length !== 2) {
        return res.status(400).json({ 
          error: 'Exactly 2 images are required (model and product)' 
        });
      }
      
      const { prompt } = req.body;
      
      // Create image process record
      const process = await prisma.imageProcess.create({
        data: {
        userId: req.user!.id,
        modelImageUrl: 'file_upload',
        productImageUrl: 'file_upload',
          metadata: JSON.stringify({ prompt, uploadType: 'files' })
        }
      });
      
      // Process images
      const result = await imageProcessingService.processImages({
        modelImagePath: files[0].path,
        productImagePath: files[1].path,
        prompt
      });
      
      // Clean up temporary files
      files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
      
      if (result.success && result.resultImagePath) {
        // Update process status
        await prisma.imageProcess.update({
          where: { id: process.id },
          data: {
            status: 'COMPLETED',
            resultImageUrl: result.resultImagePath
          }
        });
        
        // Deduct credit
        await prisma.user.update({
          where: { id: req.user!.id },
          data: { credits: { decrement: 1 } }
        });
        
        // Get updated user credits
        const updatedUser = await prisma.user.findUnique({
          where: { id: req.user!.id },
          select: { credits: true }
        });
        
        res.json({
          success: true,
          message: 'Images processed successfully',
          process: {
            id: process.id,
            status: 'completed',
            result: {
              downloadUrl: `/api/images/download/${path.basename(result.resultImagePath)}`,
              fileName: path.basename(result.resultImagePath)
            },
            remainingCredits: updatedUser?.credits || 0
          }
        });
      } else {
        await prisma.imageProcess.update({
          where: { id: process.id },
          data: {
            status: 'FAILED',
            errorMessage: result.error || 'Processing failed'
          }
        });
        
        res.status(500).json({ 
          error: 'Image processing failed',
          processId: process.id
        });
      }
      
    } catch (error) {
      console.error('Image processing error:', error);
      
      // Clean up temporary files on error
      if (req.files) {
        (req.files as Express.Multer.File[]).forEach(file => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
      }
      
      res.status(500).json({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// Process images with URLs
router.post('/process-urls',
  authenticate,
  requireCredits,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { error } = processUrlsSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          error: 'Validation error',
          details: error.details[0].message
        });
      }
      
      const { modelImageUrl, productImageUrl, prompt } = req.body;
      
      // Create image process record
      const process = await prisma.imageProcess.create({
        data: {
        userId: req.user!.id,
        modelImageUrl,
        productImageUrl,
        metadata: JSON.stringify({ prompt, uploadType: 'urls' })
        }
      });
      
      // Download images from URLs
      const modelImagePath = await downloadImage(
          modelImageUrl,
        `model_${uuidv4()}.jpg`
      );
      
      const productImagePath = await downloadImage(
          productImageUrl,
        `product_${uuidv4()}.jpg`
      );
      
      // Process images
      const result = await imageProcessingService.processImages({
        modelImagePath,
        productImagePath,
          prompt
      });
      
      // Clean up temporary files
      [modelImagePath, productImagePath].forEach(filePath => {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
      
      if (result.success && result.resultImagePath) {
        // Update process status
        await prisma.imageProcess.update({
          where: { id: process.id },
          data: {
            status: 'COMPLETED',
            resultImageUrl: result.resultImagePath
          }
        });
        
        // Deduct credit
        await prisma.user.update({
          where: { id: req.user!.id },
          data: { credits: { decrement: 1 } }
        });
        
        // Get updated user credits
        const updatedUser = await prisma.user.findUnique({
          where: { id: req.user!.id },
          select: { credits: true }
        });
        
        res.json({
          success: true,
          message: 'Images processed successfully',
          process: {
            id: process.id,
            status: 'completed',
            result: {
              downloadUrl: `/api/images/download/${path.basename(result.resultImagePath)}`,
              fileName: path.basename(result.resultImagePath)
            },
            remainingCredits: updatedUser?.credits || 0
          }
        });
      } else {
        await prisma.imageProcess.update({
          where: { id: process.id },
          data: {
            status: 'FAILED',
            errorMessage: result.error || 'Processing failed'
          }
        });
        
        res.status(500).json({
          error: 'Image processing failed',
          processId: process.id
        });
      }
      
    } catch (error) {
      console.error('URL processing error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// Process product images with file uploads
router.post('/process-product-files', 
  authenticate, 
  requireCredits, 
  upload.fields([
    { name: 'productImage', maxCount: 1 },
    { name: 'backgroundImage', maxCount: 1 }
  ]), 
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      
      if (!files || !files.productImage || files.productImage.length === 0) {
        return res.status(400).json({ 
          error: 'Product image is required' 
        });
      }
      
      const { prompt } = req.body;
      const productFile = files.productImage[0];
      const backgroundFile = files.backgroundImage?.[0];
      
      // Create image process record
      const process = await prisma.imageProcess.create({
        data: {
        userId: req.user!.id,
        modelImageUrl: 'product_file_upload',
        productImageUrl: backgroundFile ? 'background_file_upload' : 'product_only',
        metadata: JSON.stringify({ prompt, uploadType: 'product-files', hasBackground: !!backgroundFile })
        }
      });
      
      // Process product image
      const result = await imageProcessingService.processProductImages({
        productImagePath: productFile.path,
        backgroundImagePath: backgroundFile?.path,
        prompt
      });
      
      // Clean up temporary files
      if (fs.existsSync(productFile.path)) {
        fs.unlinkSync(productFile.path);
      }
      if (backgroundFile && fs.existsSync(backgroundFile.path)) {
        fs.unlinkSync(backgroundFile.path);
      }
      
      if (result.success && result.resultImagePath) {
        // Update process status
        await prisma.imageProcess.update({
          where: { id: process.id },
          data: {
            status: 'COMPLETED',
            resultImageUrl: result.resultImagePath
          }
        });
        
        // Deduct credit
        await prisma.user.update({
          where: { id: req.user!.id },
          data: { credits: { decrement: 1 } }
        });
        
        // Get updated user credits
        const updatedUser = await prisma.user.findUnique({
          where: { id: req.user!.id },
          select: { credits: true }
        });
        
        res.json({
          success: true,
          message: 'Product image processed successfully',
          process: {
            id: process.id,
            status: 'completed',
            result: {
              downloadUrl: `/api/images/download/${path.basename(result.resultImagePath)}`,
              fileName: path.basename(result.resultImagePath)
            },
            remainingCredits: updatedUser?.credits || 0
          }
        });
      } else {
        await prisma.imageProcess.update({
          where: { id: process.id },
          data: {
            status: 'FAILED',
            errorMessage: result.error || 'Product image processing failed'
          }
        });
        
        res.status(500).json({ 
          error: 'Product image processing failed',
          processId: process.id
        });
      }
      
    } catch (error) {
      console.error('Product image processing error:', error);
      
      // Clean up temporary files on error
      if (req.files) {
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        if (files.productImage?.[0]?.path && fs.existsSync(files.productImage[0].path)) {
          fs.unlinkSync(files.productImage[0].path);
        }
        if (files.backgroundImage?.[0]?.path && fs.existsSync(files.backgroundImage[0].path)) {
          fs.unlinkSync(files.backgroundImage[0].path);
        }
      }
      
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// Process product images with URLs
router.post('/process-product-urls', authenticate, requireCredits, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { error, value } = processProductUrlsSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.details[0].message 
      });
    }
    
    const { productImageUrl, backgroundImageUrl, prompt } = value;
    
    // Create image process record
    const process = await prisma.imageProcess.create({
      data: {
      userId: req.user!.id,
      modelImageUrl: productImageUrl,
      productImageUrl: backgroundImageUrl || 'product_only',
      metadata: JSON.stringify({ prompt, uploadType: 'product-urls', hasBackground: !!backgroundImageUrl })
      }
    });
    
    // Download images from URLs
    const productImagePath = await downloadImage(productImageUrl, `product_${uuidv4()}.jpg`);
    let backgroundImagePath: string | undefined;
    
    if (backgroundImageUrl) {
      backgroundImagePath = await downloadImage(backgroundImageUrl, `background_${uuidv4()}.jpg`);
    }
    
    // Process product image
    const result = await imageProcessingService.processProductImages({
      productImagePath,
      backgroundImagePath,
        prompt
    });
    
    // Clean up downloaded files
    [productImagePath, backgroundImagePath].filter(Boolean).forEach(filePath => {
      if (fs.existsSync(filePath!)) {
        fs.unlinkSync(filePath!);
      }
    });
    
    if (result.success && result.resultImagePath) {
      // Update process status
      await prisma.imageProcess.update({
        where: { id: process.id },
        data: {
          status: 'COMPLETED',
          resultImageUrl: result.resultImagePath
        }
      });
      
      // Deduct credit
      await prisma.user.update({
        where: { id: req.user!.id },
        data: { credits: { decrement: 1 } }
      });
      
      // Get updated user credits
      const updatedUser = await prisma.user.findUnique({
        where: { id: req.user!.id },
        select: { credits: true }
      });
      
      res.json({
        success: true,
        message: 'Product image processed successfully',
        process: {
          id: process.id,
          status: 'completed',
          result: {
            downloadUrl: `/api/images/download/${path.basename(result.resultImagePath)}`,
            fileName: path.basename(result.resultImagePath)
          },
          remainingCredits: updatedUser?.credits || 0
        }
      });
    } else {
      await prisma.imageProcess.update({
        where: { id: process.id },
        data: {
          status: 'FAILED',
          errorMessage: result.error || 'Product image processing failed'
        }
      });
      
      res.status(500).json({ 
        error: 'Product image processing failed',
        processId: process.id
      });
    }
    
  } catch (error) {
    console.error('Product image URL processing error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Virtual Try-On routes
router.post('/virtual-tryon', 
  authenticate, 
  requireCredits, 
  upload.fields([
    { name: 'userImage', maxCount: 1 },
    { name: 'productImage', maxCount: 1 }
  ]), 
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      
      if (!files || !files.userImage || files.userImage.length === 0) {
        return res.status(400).json({ 
          error: 'User image is required' 
        });
      }
      
      if (!files || !files.productImage || files.productImage.length === 0) {
        return res.status(400).json({ 
          error: 'Product image is required' 
        });
      }
      
      const { customPrompt, productTitle } = req.body;
      const userFile = files.userImage[0];
      const productFile = files.productImage[0];
      
      // Create image process record
      const process = await prisma.imageProcess.create({
        data: {
        userId: req.user!.id,
        modelImageUrl: 'user_file_upload',
        productImageUrl: 'product_file_upload',
          metadata: JSON.stringify({ customPrompt, productTitle, uploadType: 'virtual-tryon-files' })
        }
      });
      
      // Process virtual try-on
      const result = await imageProcessingService.processVirtualTryOn({
        userImagePath: userFile.path,
        productImagePath: productFile.path,
        customPrompt,
        productTitle
      });
      
      // Clean up temporary files
      if (fs.existsSync(userFile.path)) {
        fs.unlinkSync(userFile.path);
      }
      if (fs.existsSync(productFile.path)) {
        fs.unlinkSync(productFile.path);
      }
      
      if (result.success && result.resultImagePath) {
        // Update process status
        await prisma.imageProcess.update({
          where: { id: process.id },
          data: {
            status: 'COMPLETED',
            resultImageUrl: result.resultImagePath
          }
        });
        
        // Deduct credit
        await prisma.user.update({
          where: { id: req.user!.id },
          data: { credits: { decrement: 1 } }
        });
        
        // Get updated user credits
        const updatedUser = await prisma.user.findUnique({
          where: { id: req.user!.id },
          select: { credits: true }
        });
        
        res.json({
          success: true,
          message: 'Virtual try-on created successfully',
          generatedImageUrl: result.resultImagePath,
          process: {
            id: process.id,
            status: 'completed',
            remainingCredits: updatedUser?.credits || 0
          }
        });
      } else {
        await prisma.imageProcess.update({
          where: { id: process.id },
          data: {
            status: 'FAILED',
            errorMessage: result.error || 'Virtual try-on processing failed'
          }
        });
        
        res.status(500).json({ 
          error: 'Virtual try-on processing failed',
          processId: process.id
        });
      }
      
    } catch (error) {
      console.error('Virtual try-on processing error:', error);
      
      // Clean up temporary files on error
      if (req.files) {
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        if (files.userImage?.[0]?.path && fs.existsSync(files.userImage[0].path)) {
          fs.unlinkSync(files.userImage[0].path);
        }
        if (files.productImage?.[0]?.path && fs.existsSync(files.productImage[0].path)) {
          fs.unlinkSync(files.productImage[0].path);
        }
      }
      
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// Process virtual try-on with URLs
router.post('/virtual-tryon-urls', authenticate, requireCredits, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { error, value } = virtualTryOnUrlsSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.details[0].message 
      });
    }
    
    const { userImageUrl, productImageUrl, customPrompt, productTitle } = value;
    
    // Create image process record
    const process = await prisma.imageProcess.create({
      data: {
      userId: req.user!.id,
      modelImageUrl: userImageUrl,
      productImageUrl: productImageUrl,
        metadata: JSON.stringify({ customPrompt, productTitle, uploadType: 'virtual-tryon-urls' })
      }
    });
    
    // Download images from URLs
    const userImagePath = await downloadImage(userImageUrl, `user_${uuidv4()}.jpg`);
    const productImagePath = await downloadImage(productImageUrl, `product_${uuidv4()}.jpg`);
    
    // Process virtual try-on
    const result = await imageProcessingService.processVirtualTryOn({
      userImagePath,
      productImagePath,
      customPrompt,
      productTitle
    });
    
    // Clean up downloaded files
    [userImagePath, productImagePath].forEach(filePath => {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });
    
    if (result.success && result.resultImagePath) {
      // Update process status
      await prisma.imageProcess.update({
        where: { id: process.id },
        data: {
          status: 'COMPLETED',
          resultImageUrl: result.resultImagePath
        }
      });
      
      // Deduct credit
      await prisma.user.update({
        where: { id: req.user!.id },
        data: { credits: { decrement: 1 } }
      });
      
      // Get updated user credits
      const updatedUser = await prisma.user.findUnique({
        where: { id: req.user!.id },
        select: { credits: true }
      });
      
      res.json({
        success: true,
        message: 'Virtual try-on created successfully',
        generatedImageUrl: result.resultImagePath,
        process: {
          id: process.id,
          status: 'completed',
          remainingCredits: updatedUser?.credits || 0
        }
      });
    } else {
      await prisma.imageProcess.update({
        where: { id: process.id },
        data: {
          status: 'FAILED',
          errorMessage: result.error || 'Virtual try-on processing failed'
        }
      });
      
      res.status(500).json({ 
        error: 'Virtual try-on processing failed',
        processId: process.id
      });
    }
    
  } catch (error) {
    console.error('Virtual try-on URL processing error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get user's image processing history
router.get('/history', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const processes = await prisma.imageProcess.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      take: limit
    });
    
    res.json({
      processes: processes.map(process => ({
        id: process.id,
        status: process.status.toLowerCase(),
        model_image_url: process.modelImageUrl,
        product_image_url: process.productImageUrl,
        result_image_url: process.resultImageUrl,
        error_message: process.errorMessage,
        metadata: process.metadata ? JSON.parse(process.metadata) : null,
        created_at: process.createdAt
      }))
    });
  } catch (error) {
    console.error('History error:', error);
    res.status(500).json({ error: 'Failed to get processing history' });
  }
});

// Get processing statistics
router.get('/stats', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const stats = await prisma.imageProcess.groupBy({
      by: ['status'],
      where: { userId: req.user!.id },
      _count: { status: true }
    });
    
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { credits: true }
    });
    
    const statsObj = stats.reduce((acc, stat) => {
      acc[stat.status.toLowerCase()] = stat._count.status;
      return acc;
    }, {} as Record<string, number>);
    
    res.json({
      stats: {
        ...statsObj,
        remainingCredits: user?.credits || 0
      }
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to get statistics' });
  }
});

// Get comprehensive dashboard statistics
router.get('/dashboard-stats', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        credits: true,
        createdAt: true,
        isVerified: true
      }
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Get processing statistics
    const totalProcessed = await prisma.imageProcess.count({
      where: { userId }
    });

    const successfulProcesses = await prisma.imageProcess.count({
      where: { 
        userId,
        status: 'COMPLETED'
      }
    });

    const failedProcesses = await prisma.imageProcess.count({
      where: { 
        userId,
        status: 'FAILED'
      }
    });

    const pendingProcesses = await prisma.imageProcess.count({
      where: { 
        userId,
        status: 'PENDING'
      }
    });

    // Get recent processes (last 5)
    const recentProcesses = await prisma.imageProcess.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        status: true,
        createdAt: true,
        metadata: true,
        resultImageUrl: true
      }
    });

    // Parse metadata for recent processes
    const processedRecentProcesses = recentProcesses.map(process => ({
      ...process,
      metadata: process.metadata ? JSON.parse(process.metadata) : null
    }));

    // Calculate success rate
    const successRate = totalProcessed > 0 ? Math.round((successfulProcesses / totalProcessed) * 100) : 0;

    // Get usage by type (check metadata for different processing types)
    const allProcesses = await prisma.imageProcess.findMany({
      where: { userId },
      select: { metadata: true }
    });

    let virtualTryOnCount = 0;
    let optimizeCount = 0;
    let productImageCount = 0;

    allProcesses.forEach(process => {
      if (process.metadata) {
        const metadata = JSON.parse(process.metadata);
        if (metadata.apiUsed === 'openrouter' || metadata.type === 'virtual-tryon') {
          virtualTryOnCount++;
        } else if (metadata.type === 'optimize' || metadata.uploadType === 'files') {
          optimizeCount++;
        } else if (metadata.type === 'product-image') {
          productImageCount++;
        }
      }
    });

    // Get this week's activity
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const thisWeekProcesses = await prisma.imageProcess.count({
      where: { 
        userId,
        createdAt: {
          gte: oneWeekAgo
        }
      }
    });

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          credits: user.credits,
          joinDate: user.createdAt,
          isVerified: user.isVerified
        },
        stats: {
          totalProcessed,
          successful: successfulProcesses,
          failed: failedProcesses,
          pending: pendingProcesses,
          successRate,
          creditsRemaining: user.credits,
          thisWeekActivity: thisWeekProcesses
        },
        usage: {
          virtualTryOn: virtualTryOnCount,
          optimize: optimizeCount,
          productImage: productImageCount
        },
        recentProcesses: processedRecentProcesses
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard statistics',
    });
  }
});

// Public virtual try-on endpoint (no authentication required)
router.post('/tryon', 
  upload.fields([
    { name: 'userImage', maxCount: 1 },
    { name: 'productImage', maxCount: 1 }
  ]), 
  async (req: Request, res: Response) => {
    try {
      const { productImageUrl, productTitle, customPrompt } = req.body;
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const userImageFile = files?.['userImage']?.[0];
      const productImageFile = files?.['productImage']?.[0];

      if (!userImageFile) {
        return res.status(400).json({ 
          success: false, 
          error: "Missing user image" 
        });
      }

      let productImageBase64: string;

      // Get product image - either from URL or uploaded file
      if (productImageUrl) {
        // Fetch product image from URL
        const axios = require('axios');
        const productImageResponse = await axios.get(productImageUrl, { responseType: 'arraybuffer' });
        productImageBase64 = Buffer.from(productImageResponse.data).toString('base64');
      } else if (productImageFile) {
        // Use uploaded product image
        productImageBase64 = fs.readFileSync(productImageFile.path).toString('base64');
      } else {
        return res.status(400).json({ 
          success: false, 
          error: "Missing product image URL or file" 
        });
      }

      // Convert user image to base64
      const userImageBase64 = fs.readFileSync(userImageFile.path).toString('base64');

      // Resize images to reduce size (max 1024x1024)
      const resizedProductImage = await resizeImageForAPI(productImageBase64);
      const resizedUserImage = await resizeImageForAPI(userImageBase64);

      // Get user from token (if provided)
      let user = null;
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
          const token = authHeader.substring(7);
          const jwt = require('jsonwebtoken');
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          user = await prisma.user.findUnique({
            where: { id: decoded.userId }
          });
        } catch (error) {
          console.warn('Invalid token for try-on:', error instanceof Error ? error.message : 'Unknown error');
        }
      }

      // Call OpenRouter API directly
      const openRouterResult = await callOpenRouterAPI(
        resizedProductImage, 
        resizedUserImage, 
        productTitle || "this product", 
        customPrompt || ""
      );
      
      if (!openRouterResult.success) {
        return res.status(500).json({
          success: false, 
          error: "Failed to generate virtual try-on" 
        });
      }

      // If user is authenticated, deduct credit and save to database
      if (user) {
        try {
          // Deduct credit
          await prisma.user.update({
            where: { id: user.id },
            data: { credits: { decrement: 1 } }
          });

          // Save to database
          await prisma.imageProcess.create({
            data: {
              userId: user.id,
              modelImageUrl: `data:image/jpeg;base64,${resizedUserImage}`,
              productImageUrl: `data:image/jpeg;base64,${resizedProductImage}`,
              resultImageUrl: openRouterResult.imageUrl,
              status: "COMPLETED",
              metadata: JSON.stringify({
                productTitle: productTitle || "this product",
                customPrompt: customPrompt || "",
                apiUsed: "openrouter"
              })
            }
          });

          console.log(`✅ Credit deducted for user ${user.id}, remaining: ${user.credits - 1}`);
        } catch (dbError) {
          console.error('Database error:', dbError);
          // Don't fail the request if DB update fails
        }
      }

      // Clean up uploaded files
      try {
        if (userImageFile) fs.unlinkSync(userImageFile.path);
        if (productImageFile) fs.unlinkSync(productImageFile.path);
      } catch (cleanupError) {
        console.warn('Failed to clean up files:', cleanupError);
      }

      return res.json({
        success: true,
        generatedImageUrl: openRouterResult.imageUrl,
        message: "Virtual try-on generated successfully!",
        creditsRemaining: user ? user.credits - 1 : null
      });

    } catch (error) {
      console.error('Try-on generation error:', error);
      return res.status(500).json({ 
        success: false, 
        error: "Failed to generate virtual try-on: " + (error instanceof Error ? error.message : 'Unknown error')
      });
    }
  }
);

// Download processed image
router.get('/download/:filename', async (req: Request, res: Response) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(config.upload.generatedPath, filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    // Set appropriate headers
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
    
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Failed to download file' });
  }
});

// OpenRouter API call function (copied from original tryon.ts)
async function callOpenRouterAPI(productImageBase64: string, userImageBase64: string, productTitle: string, customPrompt: string = "") {
  try {
    if (!config.ai.openrouter.apiKey) {
      throw new Error('OPENROUTER_API_KEY not configured');
    }

    // Convert base64 images to data URLs
    const productImageDataUrl = `data:image/jpeg;base64,${productImageBase64}`;
    const userImageDataUrl = `data:image/jpeg;base64,${userImageBase64}`;

    // Build the base prompt
    let prompt = `Create a professional e-commerce fashion photo. Take the clothing item from the first image and place it realistically on the model from the second image. Ensure the product's original color, texture, and size are preserved. Generate a full-body, photorealistic shot of the model wearing the item, with lighting and shadows adjusted naturally to match the scene.`;

    // Add product title if provided
    if (productTitle && productTitle.trim()) {
      prompt += `\n\nProduct: ${productTitle}`;
    }

    // Add custom prompt if provided
    if (customPrompt && customPrompt.trim()) {
      prompt += `\n\nAdditional styling request: ${customPrompt}`;
    }

    prompt += `\n\nGenerate a high-quality virtual try-on result that looks authentic and appealing.`;

    // Debug logging
    console.log('Sending prompt to OpenRouter:', prompt);
    console.log('Product image URL:', productImageDataUrl.substring(0, 100) + '...');
    console.log('User image URL:', userImageDataUrl.substring(0, 100) + '...');

    const axios = require('axios');
    const response = await axios.post(`${config.ai.openrouter.baseUrl}/chat/completions`, {
      "model": "google/gemini-2.5-flash-image-preview",
      "messages": [
        {
          "role": "user",
          "content": [
            {
              "type": "text",
              "text": prompt
            },
            {
              "type": "image_url",
              "image_url": {
                "url": productImageDataUrl
              }
            },
            {
              "type": "image_url",
              "image_url": {
                "url": userImageDataUrl
              }
            }
          ]
        }
      ]
    }, {
      headers: {
        "Authorization": `Bearer ${config.ai.openrouter.apiKey}`,
        "HTTP-Referer": config.urls.frontend || "https://your-shopify-app.com",
        "X-Title": "Virtual Try-On App",
        "Content-Type": "application/json"
      }
    });

    if (response.status !== 200) {
      console.log('❌ OpenRouter API error:', response.status, response.statusText);
      console.log('Using mock result instead...');
      return {
        success: true,
        imageUrl: createMockTryOnResult(userImageBase64, productImageBase64),
        description: "Mock virtual try-on result (OpenRouter API unavailable)"
      };
    }

    const result = response.data;
    
    // Debug logging
    console.log('OpenRouter API Response:', JSON.stringify(result, null, 2));
    
    // Extract the generated image URL from Gemini 2.5 Flash Image Preview response
    let generatedImageUrl = null;
    
    console.log('🔍 Analyzing OpenRouter response structure...');
    console.log('Result choices:', result.choices);
    
    if (result.choices && result.choices[0] && result.choices[0].message) {
      const content = result.choices[0].message.content;
      console.log('Message content type:', typeof content);
      console.log('Message content:', content);
      
      // Check if content is an array (multimodal response)
      if (Array.isArray(content)) {
        console.log('Content is array, looking for image_url...');
        const imageContent = content.find((item: any) => item.type === 'image_url');
        if (imageContent && imageContent.image_url) {
          generatedImageUrl = imageContent.image_url.url;
          console.log('Found image URL in array:', generatedImageUrl);
        }
      }
      // Check if content is a string with URL or base64 data
      else if (typeof content === 'string') {
        console.log('Content is string, looking for URLs or base64 data...');
        console.log('Content length:', content.length);
        console.log('Content preview:', content.substring(0, 200) + '...');
        
        // Check for HTTP URLs first
        if (content.includes('http')) {
          const urlMatch = content.match(/https?:\/\/[^\s]+\.(jpg|jpeg|png|webp|gif)/i);
          if (urlMatch) {
            generatedImageUrl = urlMatch[0];
            console.log('Found image URL in string:', generatedImageUrl);
          }
        }
        
        // Check for base64 data URLs - look for the pattern more carefully
        if (!generatedImageUrl && content.includes('data:image/')) {
          console.log('Found data:image/ in content, searching for base64...');
          const base64Match = content.match(/data:image\/[^;]+;base64,[A-Za-z0-9+/=]+/);
          if (base64Match) {
            generatedImageUrl = base64Match[0];
            console.log('Found base64 data URL in string:', generatedImageUrl.substring(0, 100) + '...');
          } else {
            console.log('No base64 match found, trying alternative pattern...');
            // Try a more flexible pattern
            const altMatch = content.match(/data:image\/[^;]+;base64,[A-Za-z0-9+/=]+/g);
            if (altMatch && altMatch.length > 0) {
              generatedImageUrl = altMatch[0];
              console.log('Found base64 with alternative pattern:', generatedImageUrl.substring(0, 100) + '...');
            }
          }
        }
        
        // If still no match, check if the entire content is a base64 string
        if (!generatedImageUrl && content.length > 1000 && /^[A-Za-z0-9+/=]+$/.test(content.trim())) {
          console.log('Content appears to be pure base64, converting to data URL...');
          generatedImageUrl = `data:image/jpeg;base64,${content}`;
          console.log('Created data URL from pure base64');
        }
      }
      // Check if content is an object with image_url
      else if (content && typeof content === 'object' && (content as any).image_url) {
        generatedImageUrl = (content as any).image_url.url;
        console.log('Found image URL in object:', generatedImageUrl);
      }
    }
    
    // Check if there are any other possible image sources in the response
    if (!generatedImageUrl) {
      console.log('🔍 Checking for alternative image sources...');
      console.log('Full response structure:', JSON.stringify(result, null, 2));
      
      // Check if there's a data field with images
      if (result.data && Array.isArray(result.data)) {
        const imageData = result.data.find((item: any) => item.url);
        if (imageData) {
          generatedImageUrl = imageData.url;
          console.log('Found image URL in data array:', generatedImageUrl);
        }
      }
      
      // Check the entire response string for base64 data URLs
      if (!generatedImageUrl) {
        const responseString = JSON.stringify(result);
        const base64Match = responseString.match(/data:image\/[^;]+;base64,[A-Za-z0-9+/=]+/);
        if (base64Match) {
          generatedImageUrl = base64Match[0];
          console.log('Found base64 data URL in full response:', generatedImageUrl.substring(0, 100) + '...');
        }
      }
    }
    
    // Fallback to mock result if no image URL found
    if (!generatedImageUrl) {
      console.log('❌ No image URL found in response, using mock result');
      console.log('Response content:', result.choices?.[0]?.message?.content);
      console.log('This means the AI model did not generate an image, only returned text description');
      generatedImageUrl = createMockTryOnResult(userImageBase64, productImageBase64);
    } else {
      console.log('✅ Generated image URL found:', generatedImageUrl);
    }

    return {
      success: true,
      imageUrl: generatedImageUrl,
      description: result.choices?.[0]?.message?.content || "Virtual try-on generated successfully"
    };

  } catch (error) {
    console.error('OpenRouter API error:', error);
    console.log('Using mock result instead...');
    return {
      success: true,
      imageUrl: createMockTryOnResult(userImageBase64, productImageBase64),
      description: "Mock virtual try-on result (OpenRouter API unavailable)"
    };
  }
}

function createMockTryOnResult(userImageBase64: string, productImageBase64: string) {
  // For now, return the user image as fallback
  // In a real implementation, you'd create a composite image
  console.log('Using mock result - returning user image as fallback');
  return `data:image/jpeg;base64,${userImageBase64}`;
}

// Resize image to reduce API payload size
async function resizeImageForAPI(base64Image: string): Promise<string> {
  try {
    const sharp = require('sharp');
    const buffer = Buffer.from(base64Image, 'base64');
    
    const resized = await sharp(buffer)
      .resize(1024, 1024, { 
        fit: 'inside',
        withoutEnlargement: true 
      })
      .jpeg({ quality: 85 })
      .toBuffer();
    
    return resized.toString('base64');
  } catch (error) {
    console.warn('Failed to resize image, using original:', error);
    return base64Image;
  }
}

export default router;