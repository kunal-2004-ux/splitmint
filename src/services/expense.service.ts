import { expenseRepository, CreateExpenseSplitData } from '../repositories/expense.repository';
import { participantRepository } from '../repositories/participant.repository';
import { assertGroupOwnership } from './helpers/ownership';
import { ValidationError, NotFoundError } from '../utils/errors';
import { SplitMode } from '@prisma/client';

interface CustomSplit {
    participantId: string;
    shareAmount: number;
}

interface PercentageSplit {
    participantId: string;
    percentage: number;
}

export class ExpenseService {
    /**
     * Calculate equal splits among participants.
     * Assigns rounding remainder to payer.
     */
    private calculateEqualSplits(
        amount: number,
        participantIds: string[],
        payerId: string
    ): CreateExpenseSplitData[] {
        const participantCount = participantIds.length;
        const baseShare = Math.floor(amount / participantCount);
        const remainder = amount - baseShare * participantCount;

        return participantIds.map((participantId) => ({
            participantId,
            shareAmount: participantId === payerId ? baseShare + remainder : baseShare,
        }));
    }

    /**
     * Validate and return custom splits.
     * Ensures total equals expense amount.
     */
    private calculateCustomSplits(amount: number, customSplits: CustomSplit[]): CreateExpenseSplitData[] {
        const total = customSplits.reduce((sum, split) => sum + split.shareAmount, 0);

        if (total !== amount) {
            throw new ValidationError(
                `Split amounts must sum to expense amount. Expected: ${amount}, Got: ${total}`
            );
        }

        return customSplits.map((split) => ({
            participantId: split.participantId,
            shareAmount: split.shareAmount,
        }));
    }

    /**
     * Convert percentages to amounts.
     * Validates percentages sum to exactly 100.
     * Assigns rounding remainder to payer.
     */
    private calculatePercentageSplits(
        amount: number,
        percentageSplits: PercentageSplit[],
        payerId: string
    ): CreateExpenseSplitData[] {
        const totalPercentage = percentageSplits.reduce((sum, split) => sum + split.percentage, 0);

        if (totalPercentage !== 100) {
            throw new ValidationError(
                `Percentages must sum to exactly 100. Got: ${totalPercentage}`
            );
        }

        let calculatedTotal = 0;
        const splits = percentageSplits.map((split) => {
            const shareAmount = Math.floor((split.percentage / 100) * amount);
            calculatedTotal += shareAmount;
            return {
                participantId: split.participantId,
                shareAmount,
            };
        });

        const remainder = amount - calculatedTotal;

        return splits.map((split) => ({
            participantId: split.participantId,
            shareAmount: split.participantId === payerId ? split.shareAmount + remainder : split.shareAmount,
        }));
    }

    /**
     * Validate that all participants belong to the specified group.
     */
    private async validateParticipantsBelongToGroup(
        participantIds: string[],
        groupId: string
    ): Promise<void> {
        const groupParticipants = await participantRepository.findByGroupId(groupId);
        const groupParticipantIds = new Set(groupParticipants.map((p) => p.id));

        const invalidParticipants = participantIds.filter((id) => !groupParticipantIds.has(id));

        if (invalidParticipants.length > 0) {
            throw new NotFoundError(
                `The following participants are not in this group: ${invalidParticipants.join(', ')}`
            );
        }
    }

    async createExpense(
        userId: string,
        groupId: string,
        data: {
            payerId: string;
            amount: number;
            description: string;
            date: Date;
            splitMode: SplitMode;
            splits: string[] | CustomSplit[] | PercentageSplit[];
        }
    ) {
        await assertGroupOwnership(userId, groupId);

        if (data.amount <= 0) {
            throw new ValidationError('Amount must be positive');
        }

        if (!data.description || data.description.trim().length === 0) {
            throw new ValidationError('Description is required');
        }

        if (data.description.length > 200) {
            throw new ValidationError('Description must not exceed 200 characters');
        }

        const allParticipantIds = new Set<string>();
        allParticipantIds.add(data.payerId);

        if (data.splitMode === SplitMode.EQUAL) {
            (data.splits as string[]).forEach((id) => allParticipantIds.add(id));
        } else if (data.splitMode === SplitMode.CUSTOM) {
            (data.splits as CustomSplit[]).forEach((split) => allParticipantIds.add(split.participantId));
        } else if (data.splitMode === SplitMode.PERCENTAGE) {
            (data.splits as PercentageSplit[]).forEach((split) =>
                allParticipantIds.add(split.participantId)
            );
        }

        await this.validateParticipantsBelongToGroup(Array.from(allParticipantIds), groupId);

        let calculatedSplits: CreateExpenseSplitData[];

        if (data.splitMode === SplitMode.EQUAL) {
            calculatedSplits = this.calculateEqualSplits(
                data.amount,
                data.splits as string[],
                data.payerId
            );
        } else if (data.splitMode === SplitMode.CUSTOM) {
            calculatedSplits = this.calculateCustomSplits(data.amount, data.splits as CustomSplit[]);
        } else if (data.splitMode === SplitMode.PERCENTAGE) {
            calculatedSplits = this.calculatePercentageSplits(
                data.amount,
                data.splits as PercentageSplit[],
                data.payerId
            );
        } else {
            throw new ValidationError('Invalid split mode');
        }

        return expenseRepository.create(
            {
                groupId,
                payerId: data.payerId,
                amount: data.amount,
                description: data.description.trim(),
                date: data.date,
                splitMode: data.splitMode,
            },
            calculatedSplits
        );
    }

    async getGroupExpenses(userId: string, groupId: string) {
        await assertGroupOwnership(userId, groupId);
        return expenseRepository.findByGroupId(groupId);
    }

    async updateExpense(
        userId: string,
        expenseId: string,
        data: {
            payerId?: string;
            amount?: number;
            description?: string;
            date?: Date;
            splitMode?: SplitMode;
            splits?: string[] | CustomSplit[] | PercentageSplit[];
        }
    ) {
        const expense = await expenseRepository.findById(expenseId);
        if (!expense) {
            throw new NotFoundError('Expense not found');
        }

        await assertGroupOwnership(userId, expense.groupId);

        if (data.amount !== undefined && data.amount <= 0) {
            throw new ValidationError('Amount must be positive');
        }

        if (data.description !== undefined) {
            if (data.description.trim().length === 0) {
                throw new ValidationError('Description cannot be empty');
            }
            if (data.description.length > 200) {
                throw new ValidationError('Description must not exceed 200 characters');
            }
        }

        const finalPayerId = data.payerId ?? expense.payerId;
        const finalAmount = data.amount ?? expense.amount;
        const finalSplitMode = data.splitMode ?? expense.splitMode;

        let calculatedSplits: CreateExpenseSplitData[] | undefined;

        if (data.splits) {
            const allParticipantIds = new Set<string>();
            allParticipantIds.add(finalPayerId);

            if (finalSplitMode === SplitMode.EQUAL) {
                (data.splits as string[]).forEach((id) => allParticipantIds.add(id));
            } else if (finalSplitMode === SplitMode.CUSTOM) {
                (data.splits as CustomSplit[]).forEach((split) =>
                    allParticipantIds.add(split.participantId)
                );
            } else if (finalSplitMode === SplitMode.PERCENTAGE) {
                (data.splits as PercentageSplit[]).forEach((split) =>
                    allParticipantIds.add(split.participantId)
                );
            }

            await this.validateParticipantsBelongToGroup(Array.from(allParticipantIds), expense.groupId);

            if (finalSplitMode === SplitMode.EQUAL) {
                calculatedSplits = this.calculateEqualSplits(
                    finalAmount,
                    data.splits as string[],
                    finalPayerId
                );
            } else if (finalSplitMode === SplitMode.CUSTOM) {
                calculatedSplits = this.calculateCustomSplits(finalAmount, data.splits as CustomSplit[]);
            } else if (finalSplitMode === SplitMode.PERCENTAGE) {
                calculatedSplits = this.calculatePercentageSplits(
                    finalAmount,
                    data.splits as PercentageSplit[],
                    finalPayerId
                );
            }
        }

        return expenseRepository.update(
            expenseId,
            {
                payerId: data.payerId,
                amount: data.amount,
                description: data.description?.trim(),
                date: data.date,
                splitMode: data.splitMode,
            },
            calculatedSplits
        );
    }

    async deleteExpense(userId: string, expenseId: string) {
        const expense = await expenseRepository.findById(expenseId);
        if (!expense) {
            throw new NotFoundError('Expense not found');
        }

        await assertGroupOwnership(userId, expense.groupId);

        await expenseRepository.delete(expenseId);
        return true;
    }
}

export const expenseService = new ExpenseService();
