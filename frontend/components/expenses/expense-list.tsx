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

export function ExpenseList({ expenses, participantMap, isLoading }: ExpenseListProps) {
    if (isLoading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-24 w-full rounded-lg border border-border/40 bg-muted/40 animate-pulse" />
                ))}
            </div>
        );
    }

    if (expenses.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                <div className="bg-muted/30 p-4 rounded-full mb-4">
                    <SearchX className="h-8 w-8" />
                </div>
                <p className="text-lg font-medium">No expenses match your filters.</p>
                <p className="text-sm">Try adjusting the search criteria or clear filters.</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {expenses.map((expense, index) => (
                <motion.div
                    key={expense.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                >
                    <ExpenseCard expense={expense} participantMap={participantMap} />
                </motion.div>
            ))}
        </div>
    );
}
