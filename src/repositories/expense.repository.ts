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

    async delete(id: string) {
        return prisma.expense.delete({
            where: { id },
        });
    }
}

export const expenseRepository = new ExpenseRepository();
