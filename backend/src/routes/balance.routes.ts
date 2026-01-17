import { Router } from 'express';
import { param } from 'express-validator';
import { balanceController } from '../controllers/balance.controller';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validate';

const router = Router();

router.use(authenticate);

// Validation Rules
const groupIdValidation = param('groupId').isUUID().withMessage('Invalid group ID');

// Routes

// Get Group Balances
router.get(
    '/groups/:groupId/balances',
    [groupIdValidation, validate],
    balanceController.getBalances.bind(balanceController)
);

export default router;
