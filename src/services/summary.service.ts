import { expenseRepository } from '../repositories/expense.repository';
import { assertGroupOwnership } from './helpers/ownership';

export class SummaryService {
    /**
     * Get group summary with user-specific metrics
     * Note: Since we don't have a direct user→participant link,
     * user-specific metrics (yourTotalPaid, yourTotalOwed, netBalance) return 0
     */
    async getGroupSummary(userId: string, groupId: string) {
        // Validate ownership
        await assertGroupOwnership(userId, groupId);

        // Fetch summary data
        const expenses = await expenseRepository.getSummaryData(groupId);

        // Calculate total spent
        const totalSpent = expenses.reduce((sum: number, expense) => sum + expense.amount, 0);

        // User-specific metrics
        // Since we don't have a user→participant mapping in the current schema,
        // we return 0 for these metrics
        // In a real system, you would:
        // 1. Find the participant belonging to this user
        // 2. Calculate totalPaid where participant is payer
        // 3. Calculate totalOwed from splits for that participant
        const yourTotalPaid = 0;
        const yourTotalOwed = 0;
        const netBalance = yourTotalPaid - yourTotalOwed;

        return {
            totalSpent,
            yourTotalPaid,
            yourTotalOwed,
            netBalance,
        };
    }
}

export const summaryService = new SummaryService();
