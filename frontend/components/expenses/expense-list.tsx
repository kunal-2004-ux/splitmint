'use client';

import { Expense, ExpenseCard } from './expense-card';
import { motion } from 'framer-motion';
import { SearchX } from 'lucide-react';

interface ExpenseListProps {
    expenses: Expense[];
    // Mapping of participantId -> Name for display
    participantMap: Record<string, string>;
    isLoading: boolean;
}

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export function ExpenseList({ expenses, participantMap, isLoading }: ExpenseListProps) {
    if (isLoading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-24 w-full rounded-lg border border-border/40 bg-muted/20 animate-pulse" />
                ))}
            </div>
        );
    }

    if (expenses.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
            >
                <Card className="border-border/40 border-dashed bg-muted/10">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="bg-muted/30 p-4 rounded-full mb-4">
                            <SearchX className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium mb-1">No expenses found</h3>
                        <p className="text-sm text-muted-foreground max-w-sm mb-6">
                            We couldn't find any expenses matching your criteria. Try adjusting your filters or search terms.
                        </p>
                        <Button variant="outline" onClick={() => window.location.href = '/dashboard/expenses'}>
                            Clear Filters
                        </Button>
                    </CardContent>
                </Card>
            </motion.div>
        );
    }

    return (
        <div className="space-y-4">
            {expenses.map((expense, index) => (
                <motion.div
                    key={expense.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                >
                    <ExpenseCard expense={expense} participantMap={participantMap} />
                </motion.div>
            ))}

            {/* End of list indicator */}
            <div className="text-center py-8">
                <p className="text-xs text-muted-foreground">End of list</p>
            </div>
        </div>
    );
}
