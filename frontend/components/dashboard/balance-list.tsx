'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency, cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';

interface Balance {
    participantId: string;
    name: string;
    netBalance: number;
}

interface BalanceListProps {
    balances: Balance[];
    isLoading: boolean;
}

export function BalanceList({ balances, isLoading }: BalanceListProps) {
    if (isLoading) {
        return (
            <Card className="border-border/40 h-full">
                <CardHeader>
                    <CardTitle>Group Balances</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-muted/50 animate-pulse" />
                                <div className="h-4 w-20 bg-muted/50 animate-pulse rounded" />
                            </div>
                            <div className="h-4 w-12 bg-muted/50 animate-pulse rounded" />
                        </div>
                    ))}
                </CardContent>
            </Card>
        );
    }

    if (balances.length === 0) {
        return (
            <Card className="border-border/40 h-full">
                <CardHeader>
                    <CardTitle>Group Balances</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="h-12 w-12 rounded-full bg-muted/20 flex items-center justify-center mb-4">
                        <Plus className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">No expenses recorded yet.</p>
                    <Button variant="outline" size="sm">Add Expense</Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-border/40 h-full">
            <CardHeader>
                <CardTitle>Group Balances</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {balances.map((balance, index) => (
                        <motion.div
                            key={balance.participantId}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex items-center justify-between group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                                    {balance.name.charAt(0).toUpperCase()}
                                </div>
                                <span className="font-medium">{balance.name}</span>
                            </div>
                            <span className={cn(
                                "font-medium tabular-nums",
                                balance.netBalance > 0 && "text-emerald-500",
                                balance.netBalance < 0 && "text-rose-500",
                                balance.netBalance === 0 && "text-muted-foreground"
                            )}>
                                {balance.netBalance > 0 ? '+' : ''}
                                {formatCurrency(balance.netBalance)}
                            </span>
                        </motion.div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
