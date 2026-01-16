import { expenseRepository } from '../repositories/expense.repository';
import { participantRepository } from '../repositories/participant.repository';
import { assertGroupOwnership } from './helpers/ownership';

interface ParticipantBalance {
    participantId: string;
    name: string;
    totalPaid: number;
    totalOwed: number;
    netBalance: number;
}

interface Settlement {
    fromParticipantId: string;
    fromName: string;
    toParticipantId: string;
    toName: string;
    amount: number;
}

interface BalanceEntry {
    participantId: string;
    name: string;
    balance: number;
}

export class BalanceService {
    /**
     * Step 1: Aggregate balances for all participants
     * Calculates totalPaid, totalOwed, and netBalance for each participant
     */
    private calculateParticipantBalances(
        expenses: Array<{
            payerId: string;
            amount: number;
            splits: Array<{ participantId: string; shareAmount: number }>;
        }>,
        participants: Array<{ id: string; name: string }>
    ): Map<string, ParticipantBalance> {
        const balanceMap = new Map<string, ParticipantBalance>();

        // Initialize all participants with zero balances
        participants.forEach((participant) => {
            balanceMap.set(participant.id, {
                participantId: participant.id,
                name: participant.name,
                totalPaid: 0,
                totalOwed: 0,
                netBalance: 0,
            });
        });

        // Aggregate from expenses
        expenses.forEach((expense) => {
            // Add to payer's totalPaid
            const payerBalance = balanceMap.get(expense.payerId);
            if (payerBalance) {
                payerBalance.totalPaid += expense.amount;
            }

            // Add to each participant's totalOwed
            expense.splits.forEach((split) => {
                const participantBalance = balanceMap.get(split.participantId);
                if (participantBalance) {
                    participantBalance.totalOwed += split.shareAmount;
                }
            });
        });

        // Calculate net balances with absolute safety for floating zero
        balanceMap.forEach((balance) => {
            balance.netBalance = balance.totalPaid - balance.totalOwed;
            // Defensive: treat very small balances as zero
            if (Math.abs(balance.netBalance) < 1) {
                balance.netBalance = 0;
            }
        });

        return balanceMap;
    }

    /**
     * Step 2: Partition into creditors and debtors
     * Creditors have positive balance (others owe them)
     * Debtors have negative balance (they owe others)
     */
    private partitionCreditsAndDebts(
        balanceMap: Map<string, ParticipantBalance>
    ): { creditors: BalanceEntry[]; debtors: BalanceEntry[] } {
        const creditors: BalanceEntry[] = [];
        const debtors: BalanceEntry[] = [];

        balanceMap.forEach((balance) => {
            if (balance.netBalance > 0) {
                creditors.push({
                    participantId: balance.participantId,
                    name: balance.name,
                    balance: balance.netBalance,
                });
            } else if (balance.netBalance < 0) {
                debtors.push({
                    participantId: balance.participantId,
                    name: balance.name,
                    balance: balance.netBalance,
                });
            }
        });

        // Deterministic ordering for consistent output
        creditors.sort((a, b) => b.balance - a.balance); // Descending by balance
        debtors.sort((a, b) => a.balance - b.balance); // Ascending (most negative first)

        return { creditors, debtors };
    }

    /**
     * Step 3: Greedy settlement algorithm
     * Produces minimal number of transactions to settle all debts
     */
    private calculateMinimalSettlements(
        creditors: BalanceEntry[],
        debtors: BalanceEntry[]
    ): Settlement[] {
        const settlements: Settlement[] = [];

        // Create working copies to avoid mutating input
        const creditorsQueue = [...creditors];
        const debtorsQueue = [...debtors];

        while (creditorsQueue.length > 0 && debtorsQueue.length > 0) {
            const creditor = creditorsQueue[0];
            const debtor = debtorsQueue[0];

            // Transfer minimum of credit and absolute debt
            const transferAmount = Math.min(creditor.balance, Math.abs(debtor.balance));

            settlements.push({
                fromParticipantId: debtor.participantId,
                fromName: debtor.name,
                toParticipantId: creditor.participantId,
                toName: creditor.name,
                amount: transferAmount,
            });

            // Adjust balances
            creditor.balance -= transferAmount;
            debtor.balance += transferAmount;

            // Apply absolute safety for floating zero
            if (Math.abs(creditor.balance) < 1) {
                creditor.balance = 0;
            }
            if (Math.abs(debtor.balance) < 1) {
                debtor.balance = 0;
            }

            // Remove settled participants
            if (creditor.balance === 0) {
                creditorsQueue.shift();
            }
            if (debtor.balance === 0) {
                debtorsQueue.shift();
            }
        }

        return settlements;
    }

    /**
     * Main service method: Get group balances with settlements
     */
    async getGroupBalances(userId: string, groupId: string) {
        // Validate ownership
        await assertGroupOwnership(userId, groupId);

        // Fetch all participants in the group
        const participants = await participantRepository.findByGroupId(groupId);

        // Fetch balance data (optimized single query)
        const expenses = await expenseRepository.getBalanceData(groupId);

        // Step 1: Calculate balances
        const balanceMap = this.calculateParticipantBalances(expenses, participants);

        // Step 2: Partition into creditors and debtors
        const { creditors, debtors } = this.partitionCreditsAndDebts(balanceMap);

        // Step 3: Calculate minimal settlements
        const settlements = this.calculateMinimalSettlements(creditors, debtors);

        // Calculate summary
        const totalSpent = expenses.reduce((sum: number, expense) => sum + expense.amount, 0);

        // Find user's participant to calculate youOwe and owedToYou
        // Note: User may not have a participant in the group, so default to 0
        let youOwe = 0;
        let owedToYou = 0;

        // Check if any participant belongs to this user (by checking settlements)
        // Since we don't have a direct user-participant link, we'll calculate from settlements
        // For now, we'll set these to 0 as we don't have user-participant mapping
        // In a real system, you'd have a userId field on Participant model

        return {
            summary: {
                totalSpent,
                youOwe,
                owedToYou,
            },
            balances: Array.from(balanceMap.values()).map((balance) => ({
                participantId: balance.participantId,
                name: balance.name,
                totalPaid: balance.totalPaid,
                totalOwed: balance.totalOwed,
                netBalance: balance.netBalance,
            })),
            settlements,
        };
    }
}

export const balanceService = new BalanceService();
