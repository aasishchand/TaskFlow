import { Router } from 'express';
import { body, param } from 'express-validator';
import { validate } from '../middleware/validate.middleware';
import { authMiddleware } from '../middleware/auth.middleware';
import { asyncHandler } from '../utils/asyncHandler.util';
import * as taskController from '../controllers/task.controller';

const router = Router();

// All task routes are protected
router.use(authMiddleware);

// Validation rules
const createTaskValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('status')
    .optional()
    .isIn(['pending', 'in-progress', 'completed'])
    .withMessage('Status must be pending, in-progress, or completed'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be low, medium, or high'),
];

const updateTaskValidation = [
  param('id').isUUID().withMessage('Invalid task ID'),
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty')
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('status')
    .optional()
    .isIn(['pending', 'in-progress', 'completed'])
    .withMessage('Status must be pending, in-progress, or completed'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be low, medium, or high'),
];

const taskIdValidation = [
  param('id').isUUID().withMessage('Invalid task ID'),
];

// Routes
router.post(
  '/',
  validate(createTaskValidation),
  asyncHandler(taskController.createTask)
);

router.get('/', asyncHandler(taskController.getTasks));

router.get(
  '/:id',
  validate(taskIdValidation),
  asyncHandler(taskController.getTaskById)
);

router.put(
  '/:id',
  validate(updateTaskValidation),
  asyncHandler(taskController.updateTask)
);

router.delete(
  '/:id',
  validate(taskIdValidation),
  asyncHandler(taskController.deleteTask)
);

export default router;
