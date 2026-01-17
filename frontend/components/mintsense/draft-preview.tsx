'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { formatCurrency } from '@/lib/utils';
import { Check, Edit2, AlertTriangle, ArrowRight, Wallet, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

// Types for the backend response structure
export interface DraftSplit {
    participantId: string;
    shareAmount?: number;
    percentage?: number;
}

export interface DraftResponse {
    payerId: string;
    amount: number;
    description: string;
    date: string;
    splitMode: 'EQUAL' | 'CUSTOM' | 'PERCENTAGE';
    splits: DraftSplit[];
    confidence: number;
}

interface DraftPreviewProps {
    draft: DraftResponse;
    participantMap: Record<string, string>;
    onEdit: () => void;
    onCreate: () => void;
    isCreating: boolean;
}

export function DraftPreview({ draft, participantMap, onEdit, onCreate, isCreating }: DraftPreviewProps) {
    const [isConfirmed, setIsConfirmed] = useState(false);

    const isLowConfidence = draft.confidence < 0.7;
    const payerName = participantMap[draft.payerId] || 'Unknown User';
    const participantCount = draft.splits.length;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
        >
            <Card className="border-border/40 shadow-xl bg-card/50 backdrop-blur-sm">
                <CardHeader className="border-b border-border/40 pb-4">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-xl">Review Expense Draft</CardTitle>
                        <Badge variant={isLowConfidence ? "destructive" : "secondary"} className="text-xs">
                            {(draft.confidence * 100).toFixed(0)}% Confidence
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">

                    {isLowConfidence && (
                        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 flex gap-3 text-yellow-500">
                            <AlertTriangle className="h-5 w-5 shrink-0" />
                            <div className="space-y-1">
                                <h4 className="font-medium text-sm">Low Confidence Draft</h4>
                                <p className="text-xs text-yellow-500/90">
                                    The AI wasn't fully sure about the details. Please verify the amount, payer, and splits carefully.
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Description</label>
                            <div className="text-lg font-medium">{draft.description}</div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Amount</label>
                            <div className="text-2xl font-bold font-mono text-primary flex items-center gap-2">
                                {formatCurrency(draft.amount)}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Payer</label>
                            <div className="flex items-center gap-2">
                                <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                                    {payerName.charAt(0)}
                                </div>
                                <span>{payerName}</span>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Split Mode</label>
                            <div className="flex items-center gap-2">
                                <Badge variant="outline">{draft.splitMode}</Badge>
                                <span className="text-sm text-muted-foreground">{participantCount} participants</span>
                            </div>
                        </div>
                    </div>

                    {(isLowConfidence) && (
                        <div className="flex items-center gap-2 py-2">
                            <input
                                type="checkbox"
                                id="confirm-check"
                                checked={isConfirmed}
                                onChange={(e) => setIsConfirmed(e.target.checked)}
                                className="rounded border-input bg-transparent text-primary focus:ring-ring h-4 w-4"
                            />
                            <label htmlFor="confirm-check" className="text-sm font-medium cursor-pointer select-none">
                                I have verified that these details are correct
                            </label>
                        </div>
                    )}

                </CardContent>
                <CardFooter className="bg-muted/30 p-4 flex justify-between items-center">
                    <Button variant="ghost" onClick={onEdit} disabled={isCreating}>
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit Text
                    </Button>

                    <Button
                        onClick={onCreate}
                        disabled={isCreating || (isLowConfidence && !isConfirmed)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                        {isCreating ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            <>
                                Create Expense
                                <ArrowRight className="h-4 w-4 ml-2" />
                            </>
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </motion.div>
    );
}
