import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';

export interface TokenPayload extends JwtPayload {
  userId: string;
}

/**
 * Generate an access token (short-lived: 15 minutes).
 */
export function generateAccessToken(userId: string): string {
  const options: SignOptions = {
    expiresIn: '15m',
  };
  return jwt.sign({ userId } as TokenPayload, env.JWT_ACCESS_SECRET, options);
}

/**
 * Generate a refresh token (long-lived: 7 days).
 */
export function generateRefreshToken(userId: string): string {
  const options: SignOptions = {
    expiresIn: '7d',
  };
  return jwt.sign({ userId } as TokenPayload, env.JWT_REFRESH_SECRET, options);
}

/**
 * Verify an access token and return the decoded payload.
 */
export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as TokenPayload;
}

/**
 * Verify a refresh token and return the decoded payload.
 */
export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as TokenPayload;
}
