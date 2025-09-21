import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../database/client';
import { config } from '../config';

export interface AdminRequest extends Request {
  admin?: {
    id: string;
    email: string;
    name: string;
    role: string;
    sessionId?: string;
  };
}

export const adminAuth = async (req: AdminRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, config.jwt.secret) as any;
    
    // Check if admin user exists and is active
    const admin = await prisma.admin.findUnique({
      where: { 
        id: decoded.adminId,
        isActive: true
      }
    });

    if (!admin) {
      return res.status(401).json({ error: 'Invalid token or admin not found.' });
    }

    req.admin = {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      sessionId: decoded.sessionId
    };

    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token.' });
  }
};
