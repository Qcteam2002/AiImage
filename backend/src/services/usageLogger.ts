import db from '../config/database';

export interface UsageLogData {
  userId: string;
  actionType: 'image_optimization' | 'virtual_tryon' | 'product_processing';
  creditsUsed: number;
  metadata?: Record<string, any>;
}

export class UsageLogger {
  static async logUsage(data: UsageLogData): Promise<void> {
    try {
      await db('user_usage_logs').insert({
        user_id: data.userId,
        action_type: data.actionType,
        credits_used: data.creditsUsed,
        metadata: data.metadata || {}
      });
    } catch (error) {
      console.error('Failed to log usage:', error);
      // Don't throw error to avoid breaking the main flow
    }
  }

  static async getUserUsageStats(userId: string) {
    const stats = await db('user_usage_logs')
      .where({ user_id: userId })
      .select(
        db.raw('SUM(credits_used) as total_credits_used'),
        db.raw('COUNT(*) as total_actions'),
        db.raw('SUM(CASE WHEN action_type = ? THEN credits_used ELSE 0 END) as optimization_credits', ['image_optimization']),
        db.raw('SUM(CASE WHEN action_type = ? THEN credits_used ELSE 0 END) as tryon_credits', ['virtual_tryon']),
        db.raw('SUM(CASE WHEN action_type = ? THEN credits_used ELSE 0 END) as product_credits', ['product_processing']),
        db.raw('MAX(created_at) as last_activity')
      )
      .first();

    return stats;
  }
}
