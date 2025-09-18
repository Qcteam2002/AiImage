import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import db from '../config/database';

export interface AdminRequest extends Request {
  admin?: {
    id: string;
    username: string;
    email: string;
  };
}

export const adminAuth = async (req: AdminRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    
    // Check if admin user exists and is active
    const admin = await db('admin_users')
      .where({ id: decoded.adminId, is_active: true })
      .first();

    if (!admin) {
      return res.status(401).json({ error: 'Invalid token or admin not found.' });
    }

    req.admin = {
      id: admin.id,
      username: admin.username,
      email: admin.email
    };

    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token.' });
  }
};
