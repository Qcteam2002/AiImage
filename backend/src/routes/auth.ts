import { Router, Request, Response } from 'express';
import { UserModel } from '../models/User';
import { JWTUtil } from '../utils/jwt';
import { EmailService } from '../services/emailService';
import { validateRequest, registerSchema, loginSchema } from '../middleware/validation';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';

const router = Router();
const emailService = new EmailService();

// Register
router.post('/register', validateRequest(registerSchema), async (req: Request, res: Response) => {
  try {
    const { email, password, first_name, last_name } = req.body;
    
    // Check if user already exists
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }
    
    // Create user
    const user = await UserModel.create({ email, password, first_name, last_name });
    
    // TODO: Send verification email (temporarily disabled for testing)
    // const emailSent = await emailService.sendVerificationEmail(email, user.verification_token!);
    
    // Temporarily auto-verify for testing
    await UserModel.verifyEmail(user.verification_token!);
    const verifiedUser = await UserModel.findByEmail(email);
    
    res.status(201).json({
      message: 'User registered successfully and auto-verified for testing.',
      emailSent: false,
      user: {
        id: verifiedUser!.id,
        email: verifiedUser!.email,
        first_name: verifiedUser!.first_name,
        last_name: verifiedUser!.last_name,
        is_verified: verifiedUser!.is_verified
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// Login
router.post('/login', validateRequest(loginSchema), async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await UserModel.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Verify password
    const isValidPassword = await UserModel.verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Check if email is verified
    if (!user.is_verified) {
      return res.status(401).json({ 
        error: 'Please verify your email before logging in',
        code: 'EMAIL_NOT_VERIFIED'
      });
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
        first_name: user.first_name,
        last_name: user.last_name,
        credits: user.credits,
        is_verified: user.is_verified
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// Verify email
router.get('/verify-email/:token', async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    
    const isVerified = await UserModel.verifyEmail(token);
    
    if (!isVerified) {
      return res.status(400).json({ error: 'Invalid or expired verification token' });
    }
    
    // Send welcome email
    const user = await UserModel.findByEmail(req.query.email as string || '');
    if (user) {
      await emailService.sendWelcomeEmail(user.email, user.first_name);
    }
    
    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ error: 'Failed to verify email' });
  }
});

// Get current user profile
router.get('/profile', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await UserModel.findById(req.user!.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        credits: user.credits,
        is_verified: user.is_verified,
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// Refresh token
router.post('/refresh', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const token = JWTUtil.generateToken({
      userId: req.user!.id,
      email: req.user!.email
    });
    
    res.json({ token });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ error: 'Failed to refresh token' });
  }
});

export default router;
