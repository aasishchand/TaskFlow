import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.util';
import prisma from '../config/database';
import { logger } from '../utils/logger.util';

/**
 * JWT Authentication Middleware.
 * Extracts the token from the Authorization header,
 * verifies it, and attaches the user to req.user.
 */
export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
      return;
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Access denied. Invalid token format.',
      });
      return;
    }

    // Verify the token
    const decoded = verifyAccessToken(token);

    // Find the user in PostgreSQL
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Access denied. User not found.',
      });
      return;
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error: any) {
    logger.error('Auth middleware error:', error);

    if (error.name === 'TokenExpiredError') {
      res.status(401).json({
        success: false,
        message: 'Token expired. Please refresh your token.',
        code: 'TOKEN_EXPIRED',
      });
      return;
    }

    if (error.name === 'JsonWebTokenError') {
      res.status(401).json({
        success: false,
        message: 'Invalid token.',
        code: 'INVALID_TOKEN',
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Authentication error.',
    });
  }
}
