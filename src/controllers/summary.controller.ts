import { Response, NextFunction } from 'express';
import { summaryService } from '../services/summary.service';
import { AuthRequest } from '../middlewares/auth';

export class SummaryController {
    async getSummary(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.userId!;
            const { groupId } = req.params;

            const summary = await summaryService.getGroupSummary(userId, groupId);

            res.status(200).json({
                success: true,
                data: summary,
            });
        } catch (error) {
            next(error);
        }
    }
}

export const summaryController = new SummaryController();
