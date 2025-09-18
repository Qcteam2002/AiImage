import { sign, verify, decode, SignOptions } from 'jsonwebtoken';
import { config } from '../config';

export interface JWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export class JWTUtil {
  static generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
    const secret = config.jwt.secret;
    const expiresIn = config.jwt.expiresIn;
    
    if (!secret) {
      throw new Error('JWT secret is required');
    }
    
    return sign(payload, secret, { 
      expiresIn 
    } as SignOptions);
  }
  
  static verifyToken(token: string): JWTPayload | null {
    try {
      const secret = config.jwt.secret;
      if (!secret) {
        throw new Error('JWT secret is required');
      }
      return verify(token, secret) as JWTPayload;
    } catch (error) {
      return null;
    }
  }
  
  static decodeToken(token: string): JWTPayload | null {
    try {
      return decode(token) as JWTPayload;
    } catch (error) {
      return null;
    }
  }
}
