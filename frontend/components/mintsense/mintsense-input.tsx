'use client';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Loader2 } from 'lucide-react';

interface MintSenseInputProps {
    value: string;
    onChange: (value: string) => void;
    onGenerate: () => void;
    isGenerating: boolean;
}

export function MintSenseInput({ value, onChange, onGenerate, isGenerating }: MintSenseInputProps) {
    return (
        <Card className="border-border/40 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-50" />
            <CardContent className="p-6 space-y-4">
                <label className="text-sm font-medium text-muted-foreground block">
                    Describe your expense
                </label>
                <Textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="e.g. Paid 1500 for lunch at Olive Garden with Alice and Bob split equally"
                    className="resize-none text-lg p-4 h-32 bg-muted/20 focus:bg-background transition-colors"
                    disabled={isGenerating}
                />
                <div className="flex justify-end">
                    <Button
                        onClick={onGenerate}
                        disabled={!value.trim() || isGenerating}
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg transition-all"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Analyzing...
                            </>
                        ) : (
                            <>
                                <Sparkles className="mr-2 h-4 w-4" />
                                Generate Draft
                            </>
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
