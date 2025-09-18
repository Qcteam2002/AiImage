import db from '../config/database';

export interface ImageProcess {
  id: string;
  user_id: string;
  model_image_url: string;
  product_image_url: string;
  result_image_url?: string;
  status: 'processing' | 'completed' | 'failed';
  error_message?: string;
  metadata?: any;
  created_at: Date;
  updated_at: Date;
}

export interface CreateImageProcessData {
  userId: string;
  modelImageUrl: string;
  productImageUrl: string;
  metadata?: any;
}

export class ImageProcessModel {
  static async create(data: CreateImageProcessData): Promise<ImageProcess> {
    const { userId, modelImageUrl, productImageUrl, metadata } = data;
    
    const [process] = await db('image_processes')
      .insert({
        user_id: userId,
        model_image_url: modelImageUrl,
        product_image_url: productImageUrl,
        metadata,
        status: 'processing'
      })
      .returning('*');
    
    return process;
  }
  
  static async findById(id: string): Promise<ImageProcess | null> {
    const process = await db('image_processes')
      .where({ id })
      .first();
    
    return process || null;
  }
  
  static async findByUserId(userId: string, limit = 20): Promise<ImageProcess[]> {
    const processes = await db('image_processes')
      .where({ user_id: userId })
      .orderBy('created_at', 'desc')
      .limit(limit);
    
    return processes;
  }
  
  static async updateStatus(
    id: string, 
    status: 'processing' | 'completed' | 'failed',
    resultImageUrl?: string,
    errorMessage?: string
  ): Promise<boolean> {
    const updateData: any = { status };
    
    if (resultImageUrl) {
      updateData.result_image_url = resultImageUrl;
    }
    
    if (errorMessage) {
      updateData.error_message = errorMessage;
    }
    
    const result = await db('image_processes')
      .where({ id })
      .update(updateData);
    
    return result > 0;
  }
  
  static async markCompleted(id: string, resultImageUrl: string): Promise<boolean> {
    return this.updateStatus(id, 'completed', resultImageUrl);
  }
  
  static async markFailed(id: string, errorMessage: string): Promise<boolean> {
    return this.updateStatus(id, 'failed', undefined, errorMessage);
  }
  
  static async getStats(userId: string): Promise<{
    totalProcessed: number;
    successful: number;
    failed: number;
  }> {
    const stats = await db('image_processes')
      .select('status')
      .count('* as count')
      .where({ user_id: userId })
      .groupBy('status');
    
    let totalProcessed = 0;
    let successful = 0;
    let failed = 0;
    
    stats.forEach((stat: any) => {
      const count = parseInt(stat.count);
      totalProcessed += count;
      
      if (stat.status === 'completed') {
        successful += count;
      } else if (stat.status === 'failed') {
        failed += count;
      }
    });
    
    return { totalProcessed, successful, failed };
  }
}
