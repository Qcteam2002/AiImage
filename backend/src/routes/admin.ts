import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../database/client';
import { adminAuth, AdminRequest } from '../middleware/adminAuth';
import { config } from '../config';

const router = Router();

// Get admin profile
router.get('/profile', adminAuth, async (req: AdminRequest, res: Response) => {
  try {
    if (!req.admin) {
      return res.status(401).json({ error: 'Admin not found' });
    }

    res.json({
      success: true,
      admin: {
        id: req.admin.id,
        email: req.admin.email,
        name: req.admin.name,
        role: req.admin.role
      }
    });
  } catch (error) {
    console.error('Get admin profile error:', error);
    res.status(500).json({ error: 'Failed to get admin profile' });
  }
});

// Admin login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const admin = await prisma.admin.findUnique({
      where: { email }
    });

    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!admin.isActive) {
      return res.status(401).json({ error: 'Account is deactivated' });
    }

    const isValidPassword = await bcrypt.compare(password, admin.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Create admin session
    const sessionToken = jwt.sign(
      { adminId: admin.id, sessionId: Date.now().toString() },
      config.jwt.secret,
      { expiresIn: '24h' }
    );

    const session = await prisma.adminSession.create({
      data: {
        adminId: admin.id,
        token: sessionToken,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      }
    });

    const token = jwt.sign(
      { 
        adminId: admin.id, 
        email: admin.email,
        role: admin.role,
        sessionId: session.id,
        type: 'admin'
      },
      config.jwt.secret,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Admin logout
router.post('/logout', adminAuth, async (req: AdminRequest, res: Response) => {
  try {
    if (req.admin?.sessionId) {
      await prisma.adminSession.delete({
        where: { id: req.admin.sessionId }
      });
    }

    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Admin logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

// Get all users with pagination
router.get('/users', adminAuth, async (req: AdminRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string || '';
    const skip = (page - 1) * limit;

    const whereClause = search ? {
      OR: [
        { email: { contains: search } },
        { name: { contains: search } }
      ]
    } : {};

    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          credits: true,
          isVerified: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              imageProcesses: true
            }
          }
        }
      }),
      prisma.user.count({ where: whereClause })
    ]);

    res.json({
      success: true,
      users,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user details
router.get('/users/:userId', adminAuth, async (req: AdminRequest, res: Response) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        imageProcesses: {
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        _count: {
          select: {
            imageProcesses: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({ error: 'Failed to fetch user details' });
  }
});

// Update user credits
router.put('/users/:userId/credits', adminAuth, async (req: AdminRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const { credits } = req.body;

    if (typeof credits !== 'number' || credits < 0) {
      return res.status(400).json({ error: 'Invalid credits value' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { credits }
    });

    res.json({
      success: true,
      message: 'User credits updated successfully'
    });
  } catch (error) {
    console.error('Update user credits error:', error);
    res.status(500).json({ error: 'Failed to update user credits' });
  }
});

// Block/Unblock user
router.put('/users/:userId/status', adminAuth, async (req: AdminRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { isActive }
    });

    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'blocked'} successfully`
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ error: 'Failed to update user status' });
  }
});

// Get image processes with pagination
router.get('/image-processes', adminAuth, async (req: AdminRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;
    const skip = (page - 1) * limit;

    const whereClause = status ? { status } : {};

    const [processes, totalCount] = await Promise.all([
      prisma.imageProcess.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true
            }
          }
        }
      }),
      prisma.imageProcess.count({ where: whereClause })
    ]);

    res.json({
      success: true,
      processes,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Get image processes error:', error);
    res.status(500).json({ error: 'Failed to fetch image processes' });
  }
});

// Get dashboard stats
router.get('/dashboard', adminAuth, async (req: AdminRequest, res: Response) => {
  try {
    const [
      totalUsers,
      activeUsers,
      totalProcesses,
      completedProcesses,
      failedProcesses,
      recentProcesses
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.imageProcess.count(),
      prisma.imageProcess.count({ where: { status: 'COMPLETED' } }),
      prisma.imageProcess.count({ where: { status: 'FAILED' } }),
      prisma.imageProcess.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              email: true,
              name: true
            }
          }
        }
      })
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        blockedUsers: totalUsers - activeUsers,
        totalProcesses,
        completedProcesses,
        failedProcesses,
        pendingProcesses: totalProcesses - completedProcesses - failedProcesses
      },
      recentProcesses
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// Change password
router.post('/change-password', adminAuth, async (req: AdminRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        success: false,
        error: 'Current password and new password are required' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        success: false,
        error: 'New password must be at least 6 characters long' 
      });
    }

    // Verify current password
    if (!req.admin) {
      return res.status(401).json({ 
        success: false,
        error: 'Admin authentication required' 
      });
    }

    const admin = await prisma.admin.findUnique({
      where: { id: req.admin.id }
    });

    if (!admin) {
      return res.status(404).json({ 
        success: false,
        error: 'Admin not found' 
      });
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, admin.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ 
        success: false,
        error: 'Current password is incorrect' 
      });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await prisma.admin.update({
      where: { id: admin.id },
      data: { password: hashedNewPassword }
    });

    console.log(`✅ Admin ${admin.email} changed password`);

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to change password' 
    });
  }
});

export default router;