import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { GeminiService } from '../services/geminiService';
import { config } from '../config';
import Joi from 'joi';
import axios from 'axios';

const router = Router();
const geminiService = new GeminiService();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(config.upload.uploadPath, 'temp');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}_${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
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

// Validation schemas
const processImagesSchema = Joi.object({
  userId: Joi.string().uuid().required(),
  prompt: Joi.string().max(1000).optional()
});

const processUrlsSchema = Joi.object({
  userId: Joi.string().uuid().required(),
  modelImageUrl: Joi.string().uri().required(),
  productImageUrl: Joi.string().uri().required(),
  prompt: Joi.string().max(1000).optional()
});

// Validation schemas for product image processing
const processProductImagesSchema = Joi.object({
  userId: Joi.string().uuid().required(),
  prompt: Joi.string().max(1000).optional()
});

const processProductUrlsSchema = Joi.object({
  userId: Joi.string().uuid().required(),
  productImageUrl: Joi.string().uri().required(),
  backgroundImageUrl: Joi.string().uri().optional(),
  prompt: Joi.string().max(1000).optional()
});

// Helper function to download image from URL
async function downloadImage(url: string, filename: string): Promise<string> {
  const response = await axios({
    method: 'GET',
    url: url,
    responseType: 'stream'
  });
  
  const filePath = path.join(config.upload.uploadPath, 'temp', filename);
  const writer = fs.createWriteStream(filePath);
  
  response.data.pipe(writer);
  
  return new Promise((resolve, reject) => {
    writer.on('finish', () => resolve(filePath));
    writer.on('error', reject);
  });
}

// Process images with file uploads
router.post('/process-images', upload.array('images', 2), async (req: Request, res: Response) => {
  try {
    const { error } = processImagesSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        error: 'Validation error', 
        details: error.details[0].message 
      });
    }
    
    const files = req.files as Express.Multer.File[];
    if (!files || files.length !== 2) {
      return res.status(400).json({ error: 'Exactly 2 images are required' });
    }
    
    const { userId, prompt } = req.body;
    
    // Validate files exist and are images
    const [modelImage, productImage] = files;
    
    if (!GeminiService.validateImageFile(modelImage.path) || 
        !GeminiService.validateImageFile(productImage.path)) {
      // Clean up uploaded files
      files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
      return res.status(400).json({ error: 'Invalid image files' });
    }
    
    // Process images with Gemini
    const result = await geminiService.processImages({
      modelImagePath: modelImage.path,
      productImagePath: productImage.path,
      prompt
    });
    
    // Clean up temporary files
    files.forEach(file => {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    });
    
    if (!result.success) {
      return res.status(500).json({ 
        error: 'Image processing failed', 
        message: result.error 
      });
    }
    
    // Return the result with download URL
    const fileName = path.basename(result.resultImagePath!);
    const downloadUrl = `/api/download/${fileName}`;
    
    res.json({
      success: true,
      message: 'Images processed successfully',
      result: {
        downloadUrl,
        fileName
      }
    });
    
  } catch (error) {
    console.error('Image processing error:', error);
    
    // Clean up any uploaded files on error
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
});

// Process images with URLs
router.post('/process-urls', async (req: Request, res: Response) => {
  try {
    const { error } = processUrlsSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        error: 'Validation error', 
        details: error.details[0].message 
      });
    }
    
    const { userId, modelImageUrl, productImageUrl, prompt } = req.body;
    
    // Download images from URLs
    const modelImagePath = await downloadImage(
      modelImageUrl, 
      `model_${uuidv4()}.jpg`
    );
    
    const productImagePath = await downloadImage(
      productImageUrl, 
      `product_${uuidv4()}.jpg`
    );
    
    // Process images with Gemini
    const result = await geminiService.processImages({
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
    
    if (!result.success) {
      return res.status(500).json({ 
        error: 'Image processing failed', 
        message: result.error 
      });
    }
    
    // Return the result with download URL
    const fileName = path.basename(result.resultImagePath!);
    const downloadUrl = `/api/download/${fileName}`;
    
    res.json({
      success: true,
      message: 'Images processed successfully',
      result: {
        downloadUrl,
        fileName
      }
    });
    
  } catch (error) {
    console.error('URL processing error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Download processed image
router.get('/download/:filename', (req: Request, res: Response) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(config.upload.uploadPath, 'generated', filename);
    
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

// Process product images with file uploads
router.post('/process-product-images', 
  upload.fields([
    { name: 'productImage', maxCount: 1 },
    { name: 'backgroundImage', maxCount: 1 }
  ]), 
  async (req: Request, res: Response) => {
  try {
    console.log('🎨 Processing product images with files...');
    
    // Validate request body
    const { error, value } = processProductImagesSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details[0].message
      });
    }

    const { userId, prompt } = value;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    
    if (!files || !files.productImage || files.productImage.length === 0) {
      return res.status(400).json({ error: 'Product image is required' });
    }

    const productImagePath = files.productImage[0].path;
    const backgroundImagePath = files.backgroundImage?.[0]?.path;
    
    console.log('📸 Product image:', productImagePath);
    if (backgroundImagePath) {
      console.log('🖼️ Background image:', backgroundImagePath);
    }

    // Process the product image with Gemini
    const result = await geminiService.processProductImages({
      productImagePath,
      backgroundImagePath,
      prompt
    });

    // Clean up uploaded files
    try {
      if (fs.existsSync(productImagePath)) {
        fs.unlinkSync(productImagePath);
      }
      if (backgroundImagePath && fs.existsSync(backgroundImagePath)) {
        fs.unlinkSync(backgroundImagePath);
      }
    } catch (cleanupError) {
      console.warn('⚠️ File cleanup warning:', cleanupError);
    }

    if (!result.success) {
      return res.status(500).json({ 
        error: 'Product image processing failed', 
        message: result.error 
      });
    }
    
    // Return the result with download URL
    const fileName = path.basename(result.resultImagePath!);
    const downloadUrl = `/api/download/${fileName}`;
    
    res.json({
      success: true,
      message: 'Product image processed successfully',
      result: {
        downloadUrl,
        fileName
      }
    });
    
  } catch (error) {
    console.error('Product image file processing error:', error);
    
    // Clean up files on error
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      if (files?.productImage?.[0]?.path) {
        fs.unlinkSync(files.productImage[0].path);
      }
      if (files?.backgroundImage?.[0]?.path) {
        fs.unlinkSync(files.backgroundImage[0].path);
      }
    } catch (cleanupError) {
      console.warn('⚠️ Error cleanup warning:', cleanupError);
    }
    
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Process product images with URLs
router.post('/process-product-urls', async (req: Request, res: Response) => {
  try {
    console.log('🎨 Processing product images with URLs...');
    
    // Validate request body
    const { error, value } = processProductUrlsSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details[0].message
      });
    }

    const { userId, productImageUrl, backgroundImageUrl, prompt } = value;
    
    console.log('📸 Product image URL:', productImageUrl);
    if (backgroundImageUrl) {
      console.log('🖼️ Background image URL:', backgroundImageUrl);
    }

    // Download images from URLs
    const productImagePath = await downloadImage(productImageUrl, `product_${uuidv4()}.jpg`);
    let backgroundImagePath: string | undefined;
    
    if (backgroundImageUrl) {
      backgroundImagePath = await downloadImage(backgroundImageUrl, `background_${uuidv4()}.jpg`);
    }

    try {
      // Process the product image with Gemini
      const result = await geminiService.processProductImages({
        productImagePath,
        backgroundImagePath,
        prompt
      });

      // Clean up downloaded files
      try {
        if (fs.existsSync(productImagePath)) {
          fs.unlinkSync(productImagePath);
        }
        if (backgroundImagePath && fs.existsSync(backgroundImagePath)) {
          fs.unlinkSync(backgroundImagePath);
        }
      } catch (cleanupError) {
        console.warn('⚠️ File cleanup warning:', cleanupError);
      }

      if (!result.success) {
        return res.status(500).json({ 
          error: 'Product image processing failed', 
          message: result.error 
        });
      }
      
      // Return the result with download URL
      const fileName = path.basename(result.resultImagePath!);
      const downloadUrl = `/api/download/${fileName}`;
      
      res.json({
        success: true,
        message: 'Product image processed successfully',
        result: {
          downloadUrl,
          fileName
        }
      });
      
    } catch (processError) {
      // Clean up downloaded files on processing error
      try {
        if (fs.existsSync(productImagePath)) {
          fs.unlinkSync(productImagePath);
        }
        if (backgroundImagePath && fs.existsSync(backgroundImagePath)) {
          fs.unlinkSync(backgroundImagePath);
        }
      } catch (cleanupError) {
        console.warn('⚠️ Error cleanup warning:', cleanupError);
      }
      throw processError;
    }
    
  } catch (error) {
    console.error('Product image URL processing error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get processing status (for potential async processing)
router.get('/status/:processId', (req: Request, res: Response) => {
  // This endpoint can be used for checking processing status
  // if we implement async processing in the future
  res.json({ 
    message: 'Status endpoint - not implemented yet',
    processId: req.params.processId 
  });
});

// Virtual Try-On endpoints
// Process virtual try-on with file uploads
router.post('/virtual-tryon', upload.fields([
  { name: 'userImage', maxCount: 1 },
  { name: 'productImage', maxCount: 1 }
]), async (req: Request, res: Response) => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    
    if (!files || !files.userImage || files.userImage.length === 0) {
      return res.status(400).json({ 
        success: false,
        error: 'User image is required' 
      });
    }
    
    if (!files || !files.productImage || files.productImage.length === 0) {
      return res.status(400).json({ 
        success: false,
        error: 'Product image is required' 
      });
    }
    
    const { customPrompt } = req.body;
    const userFile = files.userImage[0];
    const productFile = files.productImage[0];
    
    console.log('🎭 Processing virtual try-on with files...');
    console.log('👤 User image:', userFile.path);
    console.log('👔 Product image:', productFile.path);
    
    // Process with Gemini service
    const result = await geminiService.processVirtualTryOn({
      userImagePath: userFile.path,
      productImagePath: productFile.path,
      customPrompt: customPrompt || ''
    });
    
    // Clean up temporary files
    if (fs.existsSync(userFile.path)) {
      fs.unlinkSync(userFile.path);
    }
    if (fs.existsSync(productFile.path)) {
      fs.unlinkSync(productFile.path);
    }
    
    if (result.success && result.resultImagePath) {
      // Convert to base64 for response
      const imageBuffer = fs.readFileSync(result.resultImagePath);
      const base64Image = imageBuffer.toString('base64');
      const mimeType = 'image/png'; // Assuming PNG output
      const dataUrl = `data:${mimeType};base64,${base64Image}`;
      
      // Clean up generated file
      if (fs.existsSync(result.resultImagePath)) {
        fs.unlinkSync(result.resultImagePath);
      }
      
      res.json({
        success: true,
        message: 'Virtual try-on created successfully',
        generatedImageUrl: dataUrl
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error || 'Virtual try-on processing failed'
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
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Process virtual try-on with URLs
router.post('/virtual-tryon-urls', async (req: Request, res: Response) => {
  try {
    const { userImageUrl, productImageUrl, customPrompt } = req.body;
    
    if (!userImageUrl || !productImageUrl) {
      return res.status(400).json({
        success: false,
        error: 'Both user image URL and product image URL are required'
      });
    }
    
    console.log('🎭 Processing virtual try-on with URLs...');
    console.log('👤 User image URL:', userImageUrl);
    console.log('👔 Product image URL:', productImageUrl);
    
    // Download images from URLs
    const userImageResponse = await axios.get(userImageUrl, { responseType: 'arraybuffer' });
    const productImageResponse = await axios.get(productImageUrl, { responseType: 'arraybuffer' });
    
    // Save to temporary files
    const userImagePath = path.join(config.upload.uploadPath, 'temp', `user_${uuidv4()}.jpg`);
    const productImagePath = path.join(config.upload.uploadPath, 'temp', `product_${uuidv4()}.jpg`);
    
    // Ensure temp directory exists
    const tempDir = path.dirname(userImagePath);
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    fs.writeFileSync(userImagePath, userImageResponse.data);
    fs.writeFileSync(productImagePath, productImageResponse.data);
    
    // Process with Gemini service
    const result = await geminiService.processVirtualTryOn({
      userImagePath,
      productImagePath,
      customPrompt: customPrompt || ''
    });
    
    // Clean up temporary files
    if (fs.existsSync(userImagePath)) {
      fs.unlinkSync(userImagePath);
    }
    if (fs.existsSync(productImagePath)) {
      fs.unlinkSync(productImagePath);
    }
    
    if (result.success && result.resultImagePath) {
      // Convert to base64 for response
      const imageBuffer = fs.readFileSync(result.resultImagePath);
      const base64Image = imageBuffer.toString('base64');
      const mimeType = 'image/png'; // Assuming PNG output
      const dataUrl = `data:${mimeType};base64,${base64Image}`;
      
      // Clean up generated file
      if (fs.existsSync(result.resultImagePath)) {
        fs.unlinkSync(result.resultImagePath);
      }
      
      res.json({
        success: true,
        message: 'Virtual try-on created successfully',
        generatedImageUrl: dataUrl
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error || 'Virtual try-on processing failed'
      });
    }
    
  } catch (error) {
    console.error('Virtual try-on URL processing error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
