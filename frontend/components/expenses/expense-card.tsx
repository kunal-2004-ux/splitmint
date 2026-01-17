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
    });

    return (
        <Card className="group hover:shadow-md hover:border-primary/20 transition-all duration-200 border-border/40 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-4 sm:p-5 flex items-center justify-between gap-4">
                {/* Left: Icon & Description */}
                <div className="flex items-start gap-4 flex-1">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-primary/20 transition-colors">
                        <span className="text-primary font-bold text-lg">
                            {expense.description.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <div className="space-y-1">
                        <h3 className="font-medium text-base text-foreground group-hover:text-primary transition-colors line-clamp-1">
                            {expense.description}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>Paid by {payerName}</span>
                            <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                            <div className="flex items-center gap-1">
                                <CalendarDays className="h-3 w-3" />
                                <span>{formattedDate}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Amount & Splits */}
                <div className="flex flex-col items-end gap-1">
                    <span className="text-lg sm:text-xl font-bold font-mono tracking-tight text-foreground">
                        {formatCurrency(expense.amount)}
                    </span>
                    <Badge variant="outline" className="text-[10px] px-1.5 h-5 bg-background/50 text-muted-foreground border-border/50">
                        {expense.splits.length} people
                    </Badge>
                </div>
            </CardContent>
        </Card>
    );
}
