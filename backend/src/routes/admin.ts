import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/database';
import { adminAuth, AdminRequest } from '../middleware/adminAuth';

const router = Router();

// Admin login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const admin = await db('admin_users')
      .where({ username, is_active: true })
      .first();

    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, admin.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { adminId: admin.id, username: admin.username },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Change admin password
router.post('/change-password', adminAuth, async (req: AdminRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }

    const admin = await db('admin_users')
      .where({ id: req.admin!.id })
      .first();

    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    const isValidPassword = await bcrypt.compare(currentPassword, admin.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    await db('admin_users')
      .where({ id: req.admin!.id })
      .update({
        password_hash: newPasswordHash,
        updated_at: new Date()
      });

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all users with usage statistics
router.get('/users', adminAuth, async (req: AdminRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    // Get users with their usage statistics
    const users = await db('users')
      .select(
        'users.*',
        db.raw('COALESCE(usage_stats.total_credits_used, 0) as total_credits_used'),
        db.raw('COALESCE(usage_stats.optimization_count, 0) as optimization_count'),
        db.raw('COALESCE(usage_stats.tryon_count, 0) as tryon_count'),
        db.raw('COALESCE(usage_stats.product_count, 0) as product_count'),
        db.raw('usage_stats.last_activity')
      )
      .leftJoin(
        db.raw(`(
          SELECT 
            user_id,
            SUM(credits_used) as total_credits_used,
            SUM(CASE WHEN action_type = 'image_optimization' THEN credits_used ELSE 0 END) as optimization_count,
            SUM(CASE WHEN action_type = 'virtual_tryon' THEN credits_used ELSE 0 END) as tryon_count,
            SUM(CASE WHEN action_type = 'product_processing' THEN credits_used ELSE 0 END) as product_count,
            MAX(created_at) as last_activity
          FROM user_usage_logs 
          GROUP BY user_id
        ) as usage_stats`),
        'users.id',
        'usage_stats.user_id'
      )
      .orderBy('users.created_at', 'desc')
      .limit(limit)
      .offset(offset);

    // Get total count
    const totalCount = await db('users').count('* as count').first();
    const total = parseInt(totalCount?.count as string) || 0;

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Block/Unblock user
router.post('/users/:userId/block', adminAuth, async (req: AdminRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const { isBlocked, reason } = req.body;

    const user = await db('users').where({ id: userId }).first();
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await db('users')
      .where({ id: userId })
      .update({
        is_blocked: isBlocked,
        blocked_at: isBlocked ? new Date() : null,
        block_reason: isBlocked ? reason : null
      });

    res.json({
      success: true,
      message: `User ${isBlocked ? 'blocked' : 'unblocked'} successfully`
    });
  } catch (error) {
    console.error('Block user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add quota to user
router.post('/users/:userId/quota', adminAuth, async (req: AdminRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const { credits } = req.body;

    if (!credits || credits <= 0) {
      return res.status(400).json({ error: 'Credits must be a positive number' });
    }

    const user = await db('users').where({ id: userId }).first();
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await db('users')
      .where({ id: userId })
      .increment('credits', credits);

    res.json({
      success: true,
      message: `Added ${credits} credits to user successfully`
    });
  } catch (error) {
    console.error('Add quota error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user usage details
router.get('/users/:userId/usage', adminAuth, async (req: AdminRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const user = await db('users').where({ id: userId }).first();
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const usageLogs = await db('user_usage_logs')
      .where({ user_id: userId })
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);

    const totalCount = await db('user_usage_logs')
      .where({ user_id: userId })
      .count('* as count')
      .first();

    const total = parseInt(totalCount?.count as string) || 0;

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          credits: user.credits,
          is_blocked: user.is_blocked,
          created_at: user.created_at
        },
        usageLogs,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get user usage error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get dashboard statistics
router.get('/dashboard', adminAuth, async (req: AdminRequest, res: Response) => {
  try {
    const totalUsers = await db('users').count('* as count').first();
    const activeUsers = await db('users').where({ is_blocked: false }).count('* as count').first();
    const blockedUsers = await db('users').where({ is_blocked: true }).count('* as count').first();
    
    const totalCreditsUsed = await db('user_usage_logs')
      .sum('credits_used as total')
      .first();

    const recentActivity = await db('user_usage_logs')
      .join('users', 'user_usage_logs.user_id', 'users.id')
      .select(
        'user_usage_logs.*',
        'users.email as user_email'
      )
      .orderBy('user_usage_logs.created_at', 'desc')
      .limit(10);

    const usageByType = await db('user_usage_logs')
      .select('action_type')
      .sum('credits_used as total_credits')
      .count('* as count')
      .groupBy('action_type');

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers: parseInt(totalUsers?.count as string) || 0,
          activeUsers: parseInt(activeUsers?.count as string) || 0,
          blockedUsers: parseInt(blockedUsers?.count as string) || 0,
          totalCreditsUsed: parseInt(totalCreditsUsed?.total as string) || 0
        },
        recentActivity,
        usageByType
      }
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
