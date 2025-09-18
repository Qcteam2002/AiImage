import { Router, Request, Response } from 'express';
import axios from 'axios';
import FormData from 'form-data';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { authenticate, requireCredits, AuthenticatedRequest } from '../middleware/auth';
import { UserModel } from '../models/User';
import { ImageProcessModel } from '../models/ImageProcess';
import { UsageLogger } from '../services/usageLogger';
import { config } from '../config';
import Joi from 'joi';

const router = Router();

// Configure multer for temporary file uploads
const upload = multer({
  dest: path.join(config.imageProcessing.uploadPath, 'temp'),
  limits: {
    fileSize: config.imageProcessing.maxFileSize,
    files: 2
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}`));
    }
  }
});

// Ensure upload directory exists
if (!fs.existsSync(path.join(config.imageProcessing.uploadPath, 'temp'))) {
  fs.mkdirSync(path.join(config.imageProcessing.uploadPath, 'temp'), { recursive: true });
}

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

// Validation schema for product image processing
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
      const process = await ImageProcessModel.create({
        userId: req.user!.id,
        modelImageUrl: 'file_upload',
        productImageUrl: 'file_upload',
        metadata: { prompt, uploadType: 'files' }
      });
      
      // Prepare form data for image processing API
      const formData = new FormData();
      formData.append('userId', req.user!.id);
      
      if (prompt) {
        formData.append('prompt', prompt);
      }
      
      // Append image files
      files.forEach((file, index) => {
        formData.append('images', fs.createReadStream(file.path), {
          filename: file.originalname,
          contentType: file.mimetype
        });
      });
      
      // Send request to image processing API
      const response = await axios.post(
        `${config.imageProcessing.apiUrl}/api/process-images`,
        formData,
        {
          headers: {
            ...formData.getHeaders()
          },
          timeout: 120000 // 2 minutes timeout
        }
      );
      
      // Clean up temporary files
      files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
      
      if (response.data.success) {
        // Update process status
        await ImageProcessModel.markCompleted(
          process.id, 
          response.data.result.downloadUrl
        );
        
        // Deduct credit
        await UserModel.decrementCredits(req.user!.id);
        
        // Get updated user credits
        const updatedUser = await UserModel.findById(req.user!.id);
        
        res.json({
          success: true,
          message: 'Images processed successfully',
          process: {
            id: process.id,
            status: 'completed',
            result: response.data.result,
            remainingCredits: updatedUser?.credits || 0
          }
        });
      } else {
        await ImageProcessModel.markFailed(process.id, 'Processing failed');
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
      
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNREFUSED') {
          return res.status(503).json({ 
            error: 'Image processing service is temporarily unavailable' 
          });
        }
        
        return res.status(500).json({ 
          error: 'Image processing failed',
          message: error.response?.data?.message || error.message
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
      const process = await ImageProcessModel.create({
        userId: req.user!.id,
        modelImageUrl,
        productImageUrl,
        metadata: { prompt, uploadType: 'urls' }
      });
      
      // Send request to image processing API
      const response = await axios.post(
        `${config.imageProcessing.apiUrl}/api/process-urls`,
        {
          userId: req.user!.id,
          modelImageUrl,
          productImageUrl,
          prompt
        },
        {
          timeout: 120000 // 2 minutes timeout
        }
      );
      
      if (response.data.success) {
        // Update process status
        await ImageProcessModel.markCompleted(
          process.id,
          response.data.result.downloadUrl
        );
        
        // Deduct credit
        await UserModel.decrementCredits(req.user!.id);
        
        // Get updated user credits
        const updatedUser = await UserModel.findById(req.user!.id);
        
        res.json({
          success: true,
          message: 'Images processed successfully',
          process: {
            id: process.id,
            status: 'completed',
            result: response.data.result,
            remainingCredits: updatedUser?.credits || 0
          }
        });
      } else {
        await ImageProcessModel.markFailed(process.id, 'Processing failed');
        res.status(500).json({
          error: 'Image processing failed',
          processId: process.id
        });
      }
      
    } catch (error) {
      console.error('URL processing error:', error);
      
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNREFUSED') {
          return res.status(503).json({
            error: 'Image processing service is temporarily unavailable'
          });
        }
        
        return res.status(500).json({
          error: 'Image processing failed',
          message: error.response?.data?.message || error.message
        });
      }
      
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// Get user's image processing history
router.get('/history', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const processes = await ImageProcessModel.findByUserId(req.user!.id, limit);
    
    res.json({
      processes: processes.map(process => ({
        id: process.id,
        status: process.status,
        model_image_url: process.model_image_url,
        product_image_url: process.product_image_url,
        result_image_url: process.result_image_url,
        error_message: process.error_message,
        metadata: process.metadata,
        created_at: process.created_at
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
    const stats = await ImageProcessModel.getStats(req.user!.id);
    const user = await UserModel.findById(req.user!.id);
    
    res.json({
      stats: {
        ...stats,
        remainingCredits: user?.credits || 0
      }
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to get statistics' });
  }
});

// Process product image with file uploads
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
      const process = await ImageProcessModel.create({
        userId: req.user!.id,
        modelImageUrl: 'product_file_upload',
        productImageUrl: backgroundFile ? 'background_file_upload' : 'product_only',
        metadata: { prompt, uploadType: 'product-files', hasBackground: !!backgroundFile }
      });
      
      // Prepare form data for image processing API
      const formData = new FormData();
      formData.append('userId', req.user!.id);
      
      if (prompt) {
        formData.append('prompt', prompt);
      }
      
      // Append product image
      formData.append('productImage', fs.createReadStream(productFile.path), {
        filename: productFile.originalname,
        contentType: productFile.mimetype
      });
      
      // Append background image if provided
      if (backgroundFile) {
        formData.append('backgroundImage', fs.createReadStream(backgroundFile.path), {
          filename: backgroundFile.originalname,
          contentType: backgroundFile.mimetype
        });
      }
      
      // Send request to image processing API
      const response = await axios.post(
        `${config.imageProcessing.apiUrl}/api/process-product-images`,
        formData,
        {
          headers: {
            ...formData.getHeaders()
          },
          timeout: 120000 // 2 minutes timeout
        }
      );
      
      // Clean up temporary files
      if (fs.existsSync(productFile.path)) {
        fs.unlinkSync(productFile.path);
      }
      if (backgroundFile && fs.existsSync(backgroundFile.path)) {
        fs.unlinkSync(backgroundFile.path);
      }
      
      if (response.data.success) {
        // Update process status
        await ImageProcessModel.markCompleted(
          process.id, 
          response.data.result.downloadUrl
        );
        
        // Deduct credit
        await UserModel.decrementCredits(req.user!.id);
        
        // Get updated user credits
        const updatedUser = await UserModel.findById(req.user!.id);
        
        res.json({
          success: true,
          message: 'Product image processed successfully',
          process: {
            id: process.id,
            status: 'completed',
            result: response.data.result,
            remainingCredits: updatedUser?.credits || 0
          }
        });
      } else {
        await ImageProcessModel.markFailed(process.id, 'Product image processing failed');
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
      
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNREFUSED') {
          return res.status(503).json({
            error: 'Image processing service is temporarily unavailable'
          });
        }
        
        return res.status(500).json({
          error: 'Product image processing failed',
          message: error.response?.data?.message || error.message
        });
      }
      
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// Process product image with URLs
router.post('/process-product-urls', authenticate, requireCredits, async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Validate request body
    const { error, value } = processProductUrlsSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.details[0].message 
      });
    }
    
    const { productImageUrl, backgroundImageUrl, prompt } = value;
    
    // Create image process record
    const process = await ImageProcessModel.create({
      userId: req.user!.id,
      modelImageUrl: productImageUrl,
      productImageUrl: backgroundImageUrl || 'product_only',
      metadata: { prompt, uploadType: 'product-urls', hasBackground: !!backgroundImageUrl }
    });
    
    // Send request to image processing API
    const response = await axios.post(
      `${config.imageProcessing.apiUrl}/api/process-product-urls`,
      {
        userId: req.user!.id,
        productImageUrl,
        backgroundImageUrl,
        prompt
      },
      { timeout: 120000 }
    );
    
    if (response.data.success) {
      // Update process status
      await ImageProcessModel.markCompleted(
        process.id, 
        response.data.result.downloadUrl
      );
      
      // Deduct credit
      await UserModel.decrementCredits(req.user!.id);
      
      // Get updated user credits
      const updatedUser = await UserModel.findById(req.user!.id);
      
      res.json({
        success: true,
        message: 'Product image processed successfully',
        process: {
          id: process.id,
          status: 'completed',
          result: response.data.result,
          remainingCredits: updatedUser?.credits || 0
        }
      });
    } else {
      await ImageProcessModel.markFailed(process.id, 'Product image processing failed');
      res.status(500).json({ 
        error: 'Product image processing failed',
        processId: process.id
      });
    }
    
  } catch (error) {
    console.error('Product image URL processing error:', error);
    
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNREFUSED') {
        return res.status(503).json({
          error: 'Image processing service is temporarily unavailable'
        });
      }
      
      return res.status(500).json({
        error: 'Product image processing failed',
        message: error.response?.data?.message || error.message
      });
    }
    
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Download processed image (proxy to processing API) - PUBLIC ACCESS
router.get('/download/:filename', async (req: Request, res: Response) => {
  try {
    const { filename } = req.params;
    
    // Stream the file from processing API
    const response = await axios.get(
      `${config.imageProcessing.apiUrl}/api/download/${filename}`,
      { responseType: 'stream' }
    );
    
    // Set headers from processing API response
    res.setHeader('Content-Type', response.headers['content-type'] || 'image/png');
    res.setHeader('Content-Disposition', response.headers['content-disposition'] || `attachment; filename="${filename}"`);
    
    // Pipe the stream
    response.data.pipe(res);
    
  } catch (error) {
    console.error('Download error:', error);
    
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    res.status(500).json({ error: 'Failed to download file' });
  }
});

// Virtual Try-On routes
// Process virtual try-on with file uploads
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
      
      const { customPrompt } = req.body;
      const userFile = files.userImage[0];
      const productFile = files.productImage[0];
      
      // Create image process record
      const process = await ImageProcessModel.create({
        userId: req.user!.id,
        modelImageUrl: 'user_file_upload',
        productImageUrl: 'product_file_upload',
        metadata: { customPrompt, uploadType: 'virtual-tryon-files' }
      });
      
      // Prepare form data for image processing API
      const formData = new FormData();
      formData.append('userId', req.user!.id);
      
      if (customPrompt) {
        formData.append('customPrompt', customPrompt);
      }
      
      // Append user image
      formData.append('userImage', fs.createReadStream(userFile.path), {
        filename: userFile.originalname,
        contentType: userFile.mimetype
      });
      
      // Append product image
      formData.append('productImage', fs.createReadStream(productFile.path), {
        filename: productFile.originalname,
        contentType: productFile.mimetype
      });
      
      // Send request to image processing API
      const response = await axios.post(
        `${config.imageProcessing.apiUrl}/api/virtual-tryon`,
        formData,
        {
          headers: {
            ...formData.getHeaders()
          },
          timeout: 120000 // 2 minutes timeout
        }
      );
      
      // Clean up temporary files
      if (fs.existsSync(userFile.path)) {
        fs.unlinkSync(userFile.path);
      }
      if (fs.existsSync(productFile.path)) {
        fs.unlinkSync(productFile.path);
      }
      
      if (response.data.success) {
        // Update process status
        await ImageProcessModel.markCompleted(
          process.id, 
          response.data.generatedImageUrl || 'virtual_tryon_completed'
        );
        
        // Deduct credit
        await UserModel.decrementCredits(req.user!.id);
        
        // Get updated user credits
        const updatedUser = await UserModel.findById(req.user!.id);
        
        res.json({
          success: true,
          message: 'Virtual try-on created successfully',
          generatedImageUrl: response.data.generatedImageUrl,
          process: {
            id: process.id,
            status: 'completed',
            remainingCredits: updatedUser?.credits || 0
          }
        });
      } else {
        await ImageProcessModel.markFailed(process.id, 'Virtual try-on processing failed');
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
      
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNREFUSED') {
          return res.status(503).json({
            error: 'Image processing service is temporarily unavailable'
          });
        }
        
        return res.status(500).json({
          error: 'Virtual try-on processing failed',
          message: error.response?.data?.message || error.message
        });
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
    // Validate request body
    const virtualTryOnUrlsSchema = Joi.object({
      userImageUrl: Joi.string().uri().required().messages({
        'string.uri': 'User image URL must be a valid URL',
        'any.required': 'User image URL is required'
      }),
      productImageUrl: Joi.string().uri().required().messages({
        'string.uri': 'Product image URL must be a valid URL',
        'any.required': 'Product image URL is required'
      }),
      customPrompt: Joi.string().max(1000).optional().messages({
        'string.max': 'Custom prompt cannot exceed 1000 characters'
      })
    });
    
    const { error, value } = virtualTryOnUrlsSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.details[0].message 
      });
    }
    
    const { userImageUrl, productImageUrl, customPrompt } = value;
    
    // Create image process record
    const process = await ImageProcessModel.create({
      userId: req.user!.id,
      modelImageUrl: userImageUrl,
      productImageUrl: productImageUrl,
      metadata: { customPrompt, uploadType: 'virtual-tryon-urls' }
    });
    
    // Send request to image processing API
    const response = await axios.post(
      `${config.imageProcessing.apiUrl}/api/virtual-tryon-urls`,
      {
        userId: req.user!.id,
        userImageUrl,
        productImageUrl,
        customPrompt
      },
      { timeout: 120000 }
    );
    
    if (response.data.success) {
      // Update process status
      await ImageProcessModel.markCompleted(
        process.id, 
        response.data.generatedImageUrl || 'virtual_tryon_completed'
      );
      
      // Deduct credit
      await UserModel.decrementCredits(req.user!.id);
      
      // Get updated user credits
      const updatedUser = await UserModel.findById(req.user!.id);
      
      res.json({
        success: true,
        message: 'Virtual try-on created successfully',
        generatedImageUrl: response.data.generatedImageUrl,
        process: {
          id: process.id,
          status: 'completed',
          remainingCredits: updatedUser?.credits || 0
        }
      });
    } else {
      await ImageProcessModel.markFailed(process.id, 'Virtual try-on processing failed');
      res.status(500).json({ 
        error: 'Virtual try-on processing failed',
        processId: process.id
      });
    }
    
  } catch (error) {
    console.error('Virtual try-on URL processing error:', error);
    
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNREFUSED') {
        return res.status(503).json({
          error: 'Image processing service is temporarily unavailable'
        });
      }
      
      return res.status(500).json({
        error: 'Virtual try-on processing failed',
        message: error.response?.data?.message || error.message
      });
    }
    
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
