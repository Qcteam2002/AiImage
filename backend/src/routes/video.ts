import { Router, Request, Response } from 'express';
import multer from 'multer';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { requireCredits } from '../middleware/auth';
import { prisma } from '../database/client';
import fs from 'fs';
import path from 'path';
import { config } from '../config';

const router = Router();

// Configure multer for image upload
const upload = multer({
  dest: config.upload.tempPath,
  limits: {
    fileSize: config.upload.maxFileSize,
  },
  fileFilter: (req, file, cb) => {
    if (config.upload.allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type. Only images are allowed.'));
    }
  },
});

// Create video from image
router.post('/create', authenticate, requireCredits, upload.single('image'),   async (req: Request, res: Response) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
    const { prompt } = req.body;
    const imageFile = req.file;

    if (!imageFile) {
      return res.status(400).json({ 
        success: false, 
        error: 'Image file is required' 
      });
    }

    if (!prompt || prompt.trim().length < 10) {
      return res.status(400).json({ 
        success: false, 
        error: 'Prompt is required and must be at least 10 characters' 
      });
    }

    // Check if user has enough credits
    if (req.user!.credits < 1) {
      return res.status(403).json({ 
        success: false, 
        error: 'Insufficient credits. Video creation requires 1 credit.' 
      });
    }

    // Read image file and convert to base64
    const imageBuffer = fs.readFileSync(imageFile.path);
    const base64Image = imageBuffer.toString('base64');
    const mimeType = imageFile.mimetype;

    // Call Hugging Face API
    const hfResponse = await fetch(
      'https://router.huggingface.co/fal-ai/fal-ai/ltxv-13b-098-distilled/image-to-video?_subdomain=queue',
      {
        headers: {
          'Authorization': `Bearer ${process.env.HF_TOKEN}`,
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({
          image_url: `data:${mimeType};base64,${base64Image}`,
          prompt: prompt.trim(),
        })
      }
    );

    if (!hfResponse.ok) {
      const errorText = await hfResponse.text();
      console.error('Hugging Face API error:', errorText);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to create video. Please try again.' 
      });
    }

    const hfResult = await hfResponse.json() as any;
    
    if (!hfResult.video || !hfResult.video.url) {
      console.error('Hugging Face API response:', hfResult);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to create video. Invalid response from AI service.' 
      });
    }

    // Save video to generated folder
    const videoFileName = `video_${Date.now()}_${Math.random().toString(36).substring(7)}.mp4`;
    const videoPath = path.join(config.upload.generatedPath, videoFileName);
    
    // Download video from Hugging Face
    const videoResponse = await fetch(hfResult.video.url);
    if (!videoResponse.ok) {
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to download video from AI service.' 
      });
    }

    const videoBuffer = await videoResponse.arrayBuffer();
    fs.writeFileSync(videoPath, Buffer.from(videoBuffer));

    // Deduct credits
    await prisma.user.update({
      where: { id: authenticatedReq.user!.id },
      data: { credits: { decrement: 1 } }
    });

    // Clean up temp file
    fs.unlinkSync(imageFile.path);

    // Return success response
    res.json({
      success: true,
      message: 'Video created successfully!',
      videoUrl: `/generated/${videoFileName}`,
      remainingCredits: req.user!.credits - 1
    });

  } catch (error) {
    console.error('Video creation error:', error);
    
    // Clean up temp file if it exists
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.error('Failed to clean up temp file:', cleanupError);
      }
    }

    res.status(500).json({ 
      success: false, 
      error: 'Failed to create video. Please try again.' 
    });
  }
});

// Get video processing history
router.get('/history', authenticate,   async (req: Request, res: Response) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
    const videos = await prisma.videoProcess.findMany({
      where: { user_id: authenticatedReq.user!.id },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    res.json({ videos });
  } catch (error) {
    console.error('Video history error:', error);
    res.status(500).json({ error: 'Failed to get video history' });
  }
});

export default router;
