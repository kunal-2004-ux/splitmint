import { Response, NextFunction } from 'express';
import { expenseService } from '../services/expense.service';
import { AuthRequest } from '../middlewares/auth';

export class ExpenseController {
    async create(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.userId!;
            const { groupId } = req.params;
            const { payerId, amount, description, date, splitMode, splits } = req.body;

            const expense = await expenseService.createExpense(userId, groupId, {
                payerId,
                amount,
                description,
                date: new Date(date),
                splitMode,
                splits,
            });

            res.status(201).json({
                success: true,
                data: { expense },
            });
        } catch (error) {
            next(error);
        }
    }

    async list(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.userId!;
            const { groupId } = req.params;
            const { from, to, participantId, minAmount, maxAmount, q } = req.query;

            // If any filters provided, use filtered query
            if (from || to || participantId || minAmount || maxAmount || q) {
                const expenses = await expenseService.getFilteredExpenses(userId, groupId, {
                    from: from as string,
                    to: to as string,
                    participantId: participantId as string,
                    minAmount: minAmount as string,
                    maxAmount: maxAmount as string,
                    q: q as string,
                });

                res.status(200).json({
                    success: true,
                    data: {
                        expenses,
                        filters: { from, to, participantId, minAmount, maxAmount, q },
                    },
                });
            } else {
                // No filters, use standard query
                const expenses = await expenseService.getGroupExpenses(userId, groupId);

                res.status(200).json({
                    success: true,
                    data: { expenses },
                });
            }
        } catch (error) {
            next(error);
        }
    }

    async update(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.userId!;
            const { id } = req.params;
            const { payerId, amount, description, date, splitMode, splits } = req.body;

            const expense = await expenseService.updateExpense(userId, id, {
                payerId,
                amount,
                description,
                date: date ? new Date(date) : undefined,
                splitMode,
                splits,
            });

            res.status(200).json({
                success: true,
                data: { expense },
            });
        } catch (error) {
            next(error);
        }
    }

    async delete(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.userId!;
            const { id } = req.params;

            await expenseService.deleteExpense(userId, id);

            res.status(200).json({
                success: true,
                message: 'Expense deleted successfully',
            });
        } catch (error) {
            next(error);
        }
    }
}

export const expenseController = new ExpenseController();
