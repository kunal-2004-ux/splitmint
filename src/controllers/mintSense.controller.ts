import { Response, NextFunction } from 'express';
import { mintSenseService } from '../services/mintSense.service';
import { AuthRequest } from '../middlewares/auth';

export class MintSenseController {
    async generateExpenseDraft(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.userId!;
            const { groupId, text } = req.body;

            const result = await mintSenseService.generateExpenseDraft(userId, groupId, text);

            res.status(200).json({
                success: true,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    async generateGroupSummary(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.userId!;
            const { groupId } = req.params;

            const result = await mintSenseService.generateGroupSummary(userId, groupId);

            res.status(200).json({
                success: true,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }
}

export const mintSenseController = new MintSenseController();
