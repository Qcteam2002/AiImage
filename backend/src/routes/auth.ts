import { Router, Request, Response } from 'express';
import { prisma } from '../database/client';
import { JWTUtil } from '../utils/jwt';
import { EmailService } from '../services/emailService';
import { validateRequest, registerSchema, loginSchema } from '../middleware/validation';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import bcrypt from 'bcryptjs';

const router = Router();
const emailService = new EmailService();

// Register
router.post('/register', validateRequest(registerSchema), async (req: Request, res: Response) => {
  try {
    const { email, password, first_name, last_name } = req.body;
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });
    
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }
    
    // Create user
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name: first_name && last_name ? `${first_name} ${last_name}` : first_name || last_name,
        credits: 10, // Default 10 credits for new users
        isActive: true,
        isVerified: true  // Tạm thời tự động verify
      }
    });
    
    // Skip email verification for now
    console.log('User registered successfully:', email);
    
    res.status(201).json({
      message: 'User registered successfully. You can now login.',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        credits: user.credits
      }
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', validateRequest(loginSchema), async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ error: 'Account is deactivated' });
    }
    
    // Generate JWT token
    const token = JWTUtil.generateToken({ 
      userId: user.id, 
      email: user.email 
    });
    
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        credits: user.credits,
        isVerified: user.isVerified
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Verify email
router.post('/verify-email', async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: 'Verification token is required' });
    }
    
    // Verify token
    const decoded = JWTUtil.verifyToken(token);
    if (!decoded || decoded.type !== 'email_verification') {
      return res.status(400).json({ error: 'Invalid verification token' });
    }
    
    // Update user verification status
    const user = await prisma.user.update({
      where: { id: decoded.userId },
      data: { isVerified: true }
    });
    
    res.json({
      message: 'Email verified successfully',
      user: {
        id: user.id,
        email: user.email,
        isVerified: user.isVerified
      }
    });
    
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ error: 'Email verification failed' });
  }
});

// Get current user profile
router.get('/profile', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        name: true,
        credits: true,
        isVerified: true,
        createdAt: true
      }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ user });
    
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// Update profile
router.put('/profile', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name } = req.body;
    
    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: { name },
      select: {
        id: true,
        email: true,
        name: true,
        credits: true,
        isVerified: true
      }
    });
    
    res.json({
      message: 'Profile updated successfully',
      user
    });
    
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Profile update failed' });
  }
});

export default router;