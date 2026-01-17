import { Router } from 'express';
import { param } from 'express-validator';
import { summaryController } from '../controllers/summary.controller';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validate';

const router = Router();

router.use(authenticate);

// Validation Rules
const groupIdValidation = param('groupId').isUUID().withMessage('Invalid group ID');

// Routes

// Get Group Summary
router.get(
    '/groups/:groupId/summary',
    [groupIdValidation, validate],
    summaryController.getSummary.bind(summaryController)
);

export default router;
