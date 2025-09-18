import db from '../config/database';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export interface User {
  id: string;
  email: string;
  password_hash: string;
  first_name?: string;
  last_name?: string;
  credits: number;
  is_verified: boolean;
  verification_token?: string;
  email_verified_at?: Date;
  is_blocked: boolean;
  blocked_at?: Date;
  block_reason?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserData {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

export class UserModel {
  static async create(userData: CreateUserData): Promise<User> {
    const { email, password, first_name, last_name } = userData;
    
    const hashedPassword = await bcrypt.hash(password, 12);
    const verificationToken = uuidv4();
    
    const [user] = await db('users')
      .insert({
        email: email.toLowerCase(),
        password_hash: hashedPassword,
        first_name,
        last_name,
        credits: 5, // Default 5 credits for new users
        verification_token: verificationToken
      })
      .returning('*');
    
    return user;
  }
  
  static async findByEmail(email: string): Promise<User | null> {
    const user = await db('users')
      .where({ email: email.toLowerCase() })
      .first();
    
    return user || null;
  }
  
  static async findById(id: string): Promise<User | null> {
    const user = await db('users')
      .where({ id })
      .first();
    
    return user || null;
  }
  
  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }
  
  static async verifyEmail(verificationToken: string): Promise<boolean> {
    const result = await db('users')
      .where({ verification_token: verificationToken })
      .update({
        is_verified: true,
        email_verified_at: new Date(),
        verification_token: null
      });
    
    return result > 0;
  }
  
  static async updateCredits(userId: string, credits: number): Promise<boolean> {
    const result = await db('users')
      .where({ id: userId })
      .update({ credits });
    
    return result > 0;
  }
  
  static async decrementCredits(userId: string): Promise<{ success: boolean; newCredits?: number }> {
    const user = await this.findById(userId);
    
    if (!user || user.credits <= 0) {
      return { success: false };
    }
    
    const newCredits = user.credits - 1;
    await this.updateCredits(userId, newCredits);
    
    return { success: true, newCredits };
  }
}
