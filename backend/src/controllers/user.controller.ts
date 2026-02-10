import { Request, Response } from 'express';
import prisma from '../config/database';
import { AppError } from '../middleware/error.middleware';

/**
 * GET /api/user/profile
 * Get the authenticated user's profile.
 */
export async function getProfile(req: Request, res: Response): Promise<void> {
  const user = req.user;

  if (!user) {
    throw new AppError('User not found.', 404);
  }

  res.status(200).json({
    success: true,
    data: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    },
  });
}

/**
 * PUT /api/user/profile
 * Update the authenticated user's profile.
 */
export async function updateProfile(
  req: Request,
  res: Response
): Promise<void> {
  const userId = req.user?.id;
  const { name, email } = req.body;

  if (!userId) {
    throw new AppError('User not found.', 404);
  }

  // If updating email, check for duplicates
  if (email) {
    const existingUser = await prisma.user.findFirst({
      where: {
        email: email.toLowerCase(),
        NOT: { id: userId },
      },
    });

    if (existingUser) {
      throw new AppError('An account with this email already exists.', 409);
    }
  }

  // Build update object (only include provided fields)
  const updateData: Record<string, string> = {};
  if (name !== undefined) updateData.name = name;
  if (email !== undefined) updateData.email = email.toLowerCase();

  if (Object.keys(updateData).length === 0) {
    throw new AppError('No fields to update.', 400);
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: updatedUser,
    },
  });
}
