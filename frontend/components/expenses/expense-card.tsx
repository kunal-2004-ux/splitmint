'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { CalendarDays, User } from 'lucide-react';

interface ExpenseSplit {
    participantId: string;
    shareAmount: number;
}

export interface Expense {
    id: string;
    description: string;
    amount: number;
    date: string;
    payerId: string;
    // Optional if backend doesn't return names inline (we might need to map IDs to names)
    payerName?: string;
    splits: ExpenseSplit[];
}

interface ExpenseCardProps {
    expense: Expense;
    // Map of participantId -> Name
    participantMap: Record<string, string>;
}

export function ExpenseCard({ expense, participantMap }: ExpenseCardProps) {
    const payerName = participantMap[expense.payerId] || 'Unknown';
    const dateObj = new Date(expense.date);
    const formattedDate = dateObj.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });

    return (
        <Card className="hover:bg-muted/30 transition-colors border-border/40">
            <CardContent className="p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{expense.description}</h3>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>Paid by <span className="font-medium text-foreground">{payerName}</span></span>
                        </div>
                        <div className="flex items-center gap-1">
                            <CalendarDays className="h-3 w-3" />
                            <span>{formattedDate}</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-2 min-w-[120px]">
                    <span className="text-xl font-bold font-mono">
                        {formatCurrency(expense.amount)}
                    </span>
                    <Badge variant="secondary" className="text-xs font-normal">
                        {expense.splits.length} participants
                    </Badge>
                </div>
            </CardContent>
        </Card>
    );
}
