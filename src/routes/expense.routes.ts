import { Router } from 'express';
import { body, param } from 'express-validator';
import { expenseController } from '../controllers/expense.controller';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validate';

const router = Router();

router.use(authenticate);

// Validation Rules
const groupIdValidation = param('groupId').isUUID().withMessage('Invalid group ID');

const expenseIdValidation = param('id').isUUID().withMessage('Invalid expense ID');

const amountValidation = body('amount')
    .isInt({ min: 1 })
    .withMessage('Amount must be a positive integer');

const descriptionValidation = body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 200 })
    .withMessage('Description must not exceed 200 characters');

const dateValidation = body('date').isISO8601().withMessage('Date must be a valid ISO 8601 date');

const splitModeValidation = body('splitMode')
    .isIn(['EQUAL', 'CUSTOM', 'PERCENTAGE'])
    .withMessage('Split mode must be EQUAL, CUSTOM, or PERCENTAGE');

const payerIdValidation = body('payerId').isUUID().withMessage('Invalid payer ID');

// Split validation based on mode
const splitsValidation = body('splits')
    .isArray({ min: 1 })
    .withMessage('Splits must be a non-empty array')
    .custom((splits, { req }) => {
        const splitMode = req.body.splitMode;

        if (splitMode === 'EQUAL') {
            if (!splits.every((id: any) => typeof id === 'string')) {
                throw new Error('For EQUAL mode, splits must be an array of participant IDs');
            }
        } else if (splitMode === 'CUSTOM') {
            if (
                !splits.every(
                    (split: any) =>
                        typeof split === 'object' &&
                        typeof split.participantId === 'string' &&
                        typeof split.shareAmount === 'number' &&
                        split.shareAmount > 0
                )
            ) {
                throw new Error(
                    'For CUSTOM mode, splits must be an array of {participantId, shareAmount}'
                );
            }
        } else if (splitMode === 'PERCENTAGE') {
            if (
                !splits.every(
                    (split: any) =>
                        typeof split === 'object' &&
                        typeof split.participantId === 'string' &&
                        typeof split.percentage === 'number' &&
                        split.percentage > 0
                )
            ) {
                throw new Error(
                    'For PERCENTAGE mode, splits must be an array of {participantId, percentage}'
                );
            }
        }

        return true;
    });

// Routes

// Create Expense
router.post(
    '/groups/:groupId/expenses',
    [
        groupIdValidation,
        payerIdValidation,
        amountValidation,
        descriptionValidation,
        dateValidation,
        splitModeValidation,
        splitsValidation,
        validate,
    ],
    expenseController.create.bind(expenseController)
);

// List Expenses for Group
router.get(
    '/groups/:groupId/expenses',
    [groupIdValidation, validate],
    expenseController.list.bind(expenseController)
);

// Update Expense
router.put(
    '/expenses/:id',
    [
        expenseIdValidation,
        body('payerId').optional().isUUID().withMessage('Invalid payer ID'),
        body('amount').optional().isInt({ min: 1 }).withMessage('Amount must be a positive integer'),
        body('description')
            .optional()
            .trim()
            .notEmpty()
            .withMessage('Description cannot be empty')
            .isLength({ max: 200 })
            .withMessage('Description must not exceed 200 characters'),
        body('date').optional().isISO8601().withMessage('Date must be a valid ISO 8601 date'),
        body('splitMode')
            .optional()
            .isIn(['EQUAL', 'CUSTOM', 'PERCENTAGE'])
            .withMessage('Split mode must be EQUAL, CUSTOM, or PERCENTAGE'),
        body('splits').optional().isArray().withMessage('Splits must be an array'),
        validate,
    ],
    expenseController.update.bind(expenseController)
);

// Delete Expense
router.delete(
    '/expenses/:id',
    [expenseIdValidation, validate],
    expenseController.delete.bind(expenseController)
);

export default router;
