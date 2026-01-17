'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

interface Settlement {
    fromName: string;
    toName: string;
    amount: number;
}

interface SettlementListProps {
    settlements: Settlement[];
    isLoading: boolean;
}

export function SettlementList({ settlements, isLoading }: SettlementListProps) {
    if (isLoading) {
        return (
            <Card className="border-border/40 h-full">
                <CardHeader>
                    <CardTitle>Smart Settlements</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {[1, 2].map(i => (
                        <div key={i} className="h-16 w-full bg-muted animate-pulse rounded-lg" />
                    ))}
                </CardContent>
            </Card>
        );
    }

    if (settlements.length === 0) {
        return (
            <Card className="border-border/40 h-full">
                <CardHeader>
                    <CardTitle>Smart Settlements</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
                        <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                    </div>
                    <p className="text-sm text-muted-foreground">All debts are settled!</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-border/40 h-full">
            <CardHeader>
                <CardTitle>Smart Settlements</CardTitle>
                <CardDescription>Suggested payments to settle up</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                {settlements.map((settlement, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/30 p-3"
                    >
                        <div className="flex items-center gap-2 text-sm">
                            <span className="font-medium text-muted-foreground">{settlement.fromName}</span>
                            <span className="text-muted-foreground">pays</span>
                            <span className="font-medium text-primary">{settlement.toName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="font-bold">{formatCurrency(settlement.amount)}</span>
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                    </motion.div>
                ))}
            </CardContent>
        </Card>
    );
}
