import { Router } from 'express';
import { body, param } from 'express-validator';
import { mintSenseController } from '../controllers/mintSense.controller';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validate';

const router = Router();

router.use(authenticate);

// Validation Rules
const groupIdValidation = body('groupId').isUUID().withMessage('Invalid group ID');

const textValidation = body('text')
    .trim()
    .notEmpty()
    .withMessage('Text is required')
    .isLength({ max: 500 })
    .withMessage('Text must not exceed 500 characters');

// Routes

// Generate Expense Draft from Natural Language
router.post(
    '/ai/expense-draft',
    [groupIdValidation, textValidation, validate],
    mintSenseController.generateExpenseDraft.bind(mintSenseController)
);

// Generate AI Group Summary
router.get(
    '/ai/groups/:groupId/summary',
    [param('groupId').isUUID().withMessage('Invalid group ID'), validate],
    mintSenseController.generateGroupSummary.bind(mintSenseController)
);

export default router;
