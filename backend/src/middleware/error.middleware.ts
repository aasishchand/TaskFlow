import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { logger } from '../utils/logger.util';

/**
 * Custom application error class with HTTP status code.
 */
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global error handler middleware.
 * Catches all errors and returns a consistent JSON response.
 */
export function errorMiddleware(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Log the error
  logger.error('Unhandled error:', err);

  // Default values
  let statusCode = 500;
  let message = 'Internal server error';

  // Handle known AppErrors
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  }

  // Handle Prisma known request errors (e.g., unique constraint, foreign key)
  else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002': {
        // Unique constraint violation
        statusCode = 409;
        const target = (err.meta?.target as string[]) || [];
        message = target.length
          ? `A record with that ${target.join(', ')} already exists.`
          : 'Duplicate value error.';
        break;
      }
      case 'P2025':
        // Record not found
        statusCode = 404;
        message = 'Record not found.';
        break;
      case 'P2003':
        // Foreign key constraint failure
        statusCode = 400;
        message = 'Related record not found.';
        break;
      default:
        statusCode = 400;
        message = 'Database request error.';
    }
  }

  // Handle Prisma validation errors
  else if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    message = 'Invalid data provided.';
  }

  // Send response
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err?.stack,
    }),
  });
}

/**
 * 404 handler for undefined routes.
 */
export function notFoundMiddleware(
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}
