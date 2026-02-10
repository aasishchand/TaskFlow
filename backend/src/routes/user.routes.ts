import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.middleware';
import { authMiddleware } from '../middleware/auth.middleware';
import { asyncHandler } from '../utils/asyncHandler.util';
import * as userController from '../controllers/user.controller';

const router = Router();

// All user routes are protected
router.use(authMiddleware);

// Validation rules for profile update
const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be 2-50 characters'),
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
];

// Routes
router.get('/profile', asyncHandler(userController.getProfile));

router.put(
  '/profile',
  validate(updateProfileValidation),
  asyncHandler(userController.updateProfile)
);

export default router;
