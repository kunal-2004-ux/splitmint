import { Response, NextFunction } from 'express';
import { balanceService } from '../services/balance.service';
import { AuthRequest } from '../middlewares/auth';

export class BalanceController {
    async getBalances(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.userId!;
            const { groupId } = req.params;

            const balances = await balanceService.getGroupBalances(userId, groupId);

            res.status(200).json({
                success: true,
                data: balances,
            });
        } catch (error) {
            next(error);
        }
    }
}

export const balanceController = new BalanceController();
