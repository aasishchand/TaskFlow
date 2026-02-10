import { Request, Response } from 'express';
import prisma from '../config/database';
import { AppError } from '../middleware/error.middleware';
import { TaskStatus, TaskPriority, Prisma } from '@prisma/client';

// Map user-facing string values to Prisma enums
const statusMap: Record<string, TaskStatus> = {
  pending: TaskStatus.PENDING,
  'in-progress': TaskStatus.IN_PROGRESS,
  completed: TaskStatus.COMPLETED,
};

const priorityMap: Record<string, TaskPriority> = {
  low: TaskPriority.LOW,
  medium: TaskPriority.MEDIUM,
  high: TaskPriority.HIGH,
};

// Reverse maps for API response
const statusReverseMap: Record<TaskStatus, string> = {
  [TaskStatus.PENDING]: 'pending',
  [TaskStatus.IN_PROGRESS]: 'in-progress',
  [TaskStatus.COMPLETED]: 'completed',
};

const priorityReverseMap: Record<TaskPriority, string> = {
  [TaskPriority.LOW]: 'low',
  [TaskPriority.MEDIUM]: 'medium',
  [TaskPriority.HIGH]: 'high',
};

/** Transform a Prisma task to API-friendly format */
function formatTask(task: any) {
  return {
    ...task,
    status: statusReverseMap[task.status as TaskStatus] || task.status,
    priority: priorityReverseMap[task.priority as TaskPriority] || task.priority,
  };
}

/**
 * POST /api/tasks
 * Create a new task for the authenticated user.
 */
export async function createTask(req: Request, res: Response): Promise<void> {
  const userId = req.user?.id;
  const { title, description, status, priority } = req.body;

  if (!userId) {
    throw new AppError('User not found.', 401);
  }

  const task = await prisma.task.create({
    data: {
      title,
      description: description || '',
      status: status ? statusMap[status] || TaskStatus.PENDING : TaskStatus.PENDING,
      priority: priority ? priorityMap[priority] || TaskPriority.MEDIUM : TaskPriority.MEDIUM,
      userId,
    },
  });

  res.status(201).json({
    success: true,
    message: 'Task created successfully',
    data: { task: formatTask(task) },
  });
}

/**
 * GET /api/tasks
 * Get paginated tasks for the authenticated user with optional filters.
 */
export async function getTasks(req: Request, res: Response): Promise<void> {
  const userId = req.user?.id;

  if (!userId) {
    throw new AppError('User not found.', 401);
  }

  // Parse query parameters (cast to string since Express 5 can return string[])
  const status = String(req.query.status || '') || undefined;
  const priority = String(req.query.priority || '') || undefined;
  const search = String(req.query.search || '') || undefined;
  const pageStr = String(req.query.page || '1');
  const limitStr = String(req.query.limit || '10');
  const sort = String(req.query.sort || '') || undefined;

  const page = Math.max(1, parseInt(pageStr, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(limitStr, 10) || 10));
  const skip = (page - 1) * limit;

  // Build Prisma where clause
  const where: Prisma.TaskWhereInput = { userId };

  if (status && statusMap[status]) {
    where.status = statusMap[status];
  }

  if (priority && priorityMap[priority]) {
    where.priority = priorityMap[priority];
  }

  // Text search (case-insensitive)
  if (search && search.trim()) {
    where.OR = [
      { title: { contains: search.trim(), mode: 'insensitive' } },
      { description: { contains: search.trim(), mode: 'insensitive' } },
    ];
  }

  // Determine sort order
  let orderBy: Prisma.TaskOrderByWithRelationInput = { createdAt: 'desc' };
  if (sort) {
    const sortField = sort.startsWith('-') ? sort.slice(1) : sort;
    const sortDir: 'asc' | 'desc' = sort.startsWith('-') ? 'desc' : 'asc';
    if (['createdAt', 'updatedAt', 'title', 'status', 'priority'].includes(sortField)) {
      orderBy = { [sortField]: sortDir };
    }
  }

  // Execute query with pagination
  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where,
      orderBy,
      skip,
      take: limit,
    }),
    prisma.task.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  res.status(200).json({
    success: true,
    data: {
      tasks: tasks.map(formatTask),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    },
  });
}

/**
 * GET /api/tasks/:id
 * Get a single task by ID (must belong to the user).
 */
export async function getTaskById(req: Request, res: Response): Promise<void> {
  const userId = req.user?.id;
  const id = String(req.params.id);

  const task = await prisma.task.findFirst({
    where: { id, userId },
  });

  if (!task) {
    throw new AppError('Task not found.', 404);
  }

  res.status(200).json({
    success: true,
    data: { task: formatTask(task) },
  });
}

/**
 * PUT /api/tasks/:id
 * Update a task (must belong to the user).
 */
export async function updateTask(req: Request, res: Response): Promise<void> {
  const userId = req.user?.id;
  const id = String(req.params.id);
  const { title, description, status, priority } = req.body;

  // First verify the task belongs to the user
  const existingTask = await prisma.task.findFirst({
    where: { id, userId },
  });

  if (!existingTask) {
    throw new AppError('Task not found or you do not have permission.', 404);
  }

  // Build update object
  const updateData: Prisma.TaskUpdateInput = {};
  if (title !== undefined) updateData.title = title;
  if (description !== undefined) updateData.description = description;
  if (status !== undefined && statusMap[status]) updateData.status = statusMap[status];
  if (priority !== undefined && priorityMap[priority]) updateData.priority = priorityMap[priority];

  if (Object.keys(updateData).length === 0) {
    throw new AppError('No fields to update.', 400);
  }

  const task = await prisma.task.update({
    where: { id },
    data: updateData,
  });

  res.status(200).json({
    success: true,
    message: 'Task updated successfully',
    data: { task: formatTask(task) },
  });
}

/**
 * DELETE /api/tasks/:id
 * Delete a task (must belong to the user).
 */
export async function deleteTask(req: Request, res: Response): Promise<void> {
  const userId = req.user?.id;
  const id = String(req.params.id);

  // Verify ownership
  const existingTask = await prisma.task.findFirst({
    where: { id, userId },
  });

  if (!existingTask) {
    throw new AppError('Task not found or you do not have permission.', 404);
  }

  await prisma.task.delete({ where: { id } });

  res.status(200).json({
    success: true,
    message: 'Task deleted successfully',
  });
}
