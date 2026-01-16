import prisma from '../config/database';
import { SplitMode } from '@prisma/client';

export interface CreateExpenseData {
    groupId: string;
    payerId: string;
    amount: number;
    description: string;
    date: Date;
    splitMode: SplitMode;
}

export interface CreateExpenseSplitData {
    participantId: string;
    shareAmount: number;
}

export interface UpdateExpenseData {
    payerId?: string;
    amount?: number;
    description?: string;
    date?: Date;
    splitMode?: SplitMode;
}

export class ExpenseRepository {
    async create(expenseData: CreateExpenseData, splits: CreateExpenseSplitData[]) {
        return prisma.$transaction(async (tx) => {
            const expense = await tx.expense.create({
                data: {
                    ...expenseData,
                    splits: {
                        create: splits,
                    },
                },
                select: {
                    id: true,
                    groupId: true,
                    payerId: true,
                    amount: true,
                    description: true,
                    date: true,
                    splitMode: true,
                    createdAt: true,
                    payer: {
                        select: {
                            id: true,
                            name: true,
                            color: true,
                        },
                    },
                    splits: {
                        select: {
                            id: true,
                            participantId: true,
                            shareAmount: true,
                            participant: {
                                select: {
                                    id: true,
                                    name: true,
                                    color: true,
                                },
                            },
                        },
                    },
                },
            });

            return expense;
        });
    }

    async findByGroupId(groupId: string) {
        return prisma.expense.findMany({
            where: { groupId },
            orderBy: { date: 'desc' },
            select: {
                id: true,
                groupId: true,
                payerId: true,
                amount: true,
                description: true,
                date: true,
                splitMode: true,
                createdAt: true,
                payer: {
                    select: {
                        id: true,
                        name: true,
                        color: true,
                    },
                },
                splits: {
                    select: {
                        id: true,
                        participantId: true,
                        shareAmount: true,
                        participant: {
                            select: {
                                id: true,
                                name: true,
                                color: true,
                            },
                        },
                    },
                },
            },
        });
    }

    async findById(id: string) {
        return prisma.expense.findUnique({
            where: { id },
            select: {
                id: true,
                groupId: true,
                payerId: true,
                amount: true,
                description: true,
                date: true,
                splitMode: true,
                createdAt: true,
                payer: {
                    select: {
                        id: true,
                        name: true,
                        color: true,
                    },
                },
                splits: {
                    select: {
                        id: true,
                        participantId: true,
                        shareAmount: true,
                        participant: {
                            select: {
                                id: true,
                                name: true,
                                color: true,
                            },
                        },
                    },
                },
            },
        });
    }

    async update(id: string, expenseData: UpdateExpenseData, splits?: CreateExpenseSplitData[]) {
        return prisma.$transaction(async (tx) => {
            if (splits) {
                await tx.expenseSplit.deleteMany({
                    where: { expenseId: id },
                });
            }

            const expense = await tx.expense.update({
                where: { id },
                data: {
                    ...expenseData,
                    ...(splits && {
                        splits: {
                            create: splits,
                        },
                    }),
                },
                select: {
                    id: true,
                    groupId: true,
                    payerId: true,
                    amount: true,
                    description: true,
                    date: true,
                    splitMode: true,
                    createdAt: true,
                    payer: {
                        select: {
                            id: true,
                            name: true,
                            color: true,
                        },
                    },
                    splits: {
                        select: {
                            id: true,
                            participantId: true,
                            shareAmount: true,
                            participant: {
                                select: {
                                    id: true,
                                    name: true,
                                    color: true,
                                },
                            },
                        },
                    },
                },
            });

            return expense;
        });
    }

    async getBalanceData(groupId: string) {
        return prisma.expense.findMany({
            where: { groupId },
            select: {
                payerId: true,
                amount: true,
                splits: {
                    select: {
                        participantId: true,
                        shareAmount: true,
                    },
                },
            },
        });
    }

    async getSummaryData(groupId: string) {
        return prisma.expense.findMany({
            where: { groupId },
            select: {
                amount: true,
                payerId: true,
                splits: {
                    select: {
                        participantId: true,
                        shareAmount: true,
                    },
                },
            },
        });
    }

    async findByGroupIdFiltered(
        groupId: string,
        filters: {
            from?: Date;
            to?: Date;
            participantId?: string;
            minAmount?: number;
            maxAmount?: number;
            q?: string;
        }
    ) {
        // Build where clause dynamically
        const where: any = { groupId };

        // Date range filtering (inclusive)
        if (filters.from || filters.to) {
            where.date = {};
            if (filters.from) {
                where.date.gte = filters.from; // Inclusive start
            }
            if (filters.to) {
                // Inclusive end (end of day)
                const endOfDay = new Date(filters.to);
                endOfDay.setHours(23, 59, 59, 999);
                where.date.lte = endOfDay;
            }
        }

        // Participant filtering: payerId === participantId OR participantId in splits
        if (filters.participantId) {
            where.OR = [
                { payerId: filters.participantId },
                {
                    splits: {
                        some: {
                            participantId: filters.participantId,
                        },
                    },
                },
            ];
        }

        // Amount range filtering
        if (filters.minAmount !== undefined || filters.maxAmount !== undefined) {
            where.amount = {};
            if (filters.minAmount !== undefined) {
                where.amount.gte = filters.minAmount;
            }
            if (filters.maxAmount !== undefined) {
                where.amount.lte = filters.maxAmount;
            }
        }

        // Text search on description (case-insensitive)
        if (filters.q) {
            where.description = {
                contains: filters.q,
                mode: 'insensitive',
            };
        }

        return prisma.expense.findMany({
            where,
            orderBy: { date: 'desc' },
            select: {
                id: true,
                groupId: true,
                payerId: true,
                amount: true,
                description: true,
                date: true,
                splitMode: true,
                createdAt: true,
                payer: {
                    select: {
                        id: true,
                        name: true,
                        color: true,
                    },
                },
                splits: {
                    select: {
                        id: true,
                        participantId: true,
                        shareAmount: true,
                        participant: {
                            select: {
                                id: true,
                                name: true,
                                color: true,
                            },
                        },
                    },
                },
            },
        });
    }

    async delete(id: string) {
        return prisma.expense.delete({
            where: { id },
        });
    }
}

export const expenseRepository = new ExpenseRepository();
