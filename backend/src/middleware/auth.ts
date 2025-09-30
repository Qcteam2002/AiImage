import { Request, Response, NextFunction } from 'express';
import { JWTUtil } from '../utils/jwt';
import { prisma } from '../database/client';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    credits: number;
  };
}

// Type guard to check if request is authenticated
export const isAuthenticatedRequest = (req: Request): req is AuthenticatedRequest => {
  return 'user' in req;
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access token required' });
    }
    
    const token = authHeader.substring(7);
    const payload = JWTUtil.verifyToken(token);
    
    if (!payload) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    
    const user = await prisma.user.findUnique({
      where: { id: payload.userId }
    });
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    if (!user.isVerified) {
      return res.status(401).json({ error: 'Email not verified' });
    }
    
    // Cast req to AuthenticatedRequest and add user property
    (req as AuthenticatedRequest).user = {
      id: user.id,
      email: user.email,
      credits: user.credits
    };
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

export const requireCredits = (req: Request, res: Response, next: NextFunction) => {
  const authenticatedReq = req as AuthenticatedRequest;
  if (!authenticatedReq.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  if (authenticatedReq.user.credits <= 0) {
    return res.status(403).json({ error: 'Insufficient credits' });
  }
  
  next();
};
