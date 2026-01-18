'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Loader2, AlertCircle, ArrowLeft, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import { Container } from '@/components/container';

export default function CreateGroupPage() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (name.trim().length === 0) {
            setError('Group name is required');
            return;
        }

        setIsLoading(true);

        try {
            const response = await api.post('/groups', {
                name: name.trim()
            });

            if (response.data.success) {
                // Group created, redirect to dashboard
                // The dashboard will pick up the new group automatically
                router.push('/dashboard');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to create group. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen bg-background overflow-hidden flex flex-col">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] -z-10" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[80px] -z-10" />

            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl py-4">
                <Container className="flex items-center justify-between">
                    <Link href="/dashboard" className="flex items-center gap-3 group">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-emerald-600 shadow-lg shadow-primary/20 transition-transform group-hover:scale-110">
                            <span className="text-xl font-bold text-white">S</span>
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                            SplitMint
                        </span>
                    </Link>
                    <Button variant="ghost" asChild className="h-10 hover:bg-muted/50">
                        <Link href="/dashboard">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Dashboard
                        </Link>
                    </Button>
                </Container>
            </header>

            <main className="flex-1 flex items-center justify-center p-4">
                <Container className="max-w-lg w-full">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <Card className="border-2 border-border/60 bg-card/90 backdrop-blur-sm shadow-2xl relative overflow-hidden">
                            {/* Decorative gradient bar */}
                            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-indigo-500 to-purple-600" />

                            <CardHeader className="space-y-3 pb-8 pt-8 text-center">
                                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-2">
                                    <Users className="h-8 w-8 text-primary" />
                                </div>
                                <CardTitle className="text-3xl font-bold tracking-tight">Create a New Group</CardTitle>
                                <CardDescription className="text-base text-muted-foreground px-4">
                                    Groups help you organize expenses with friends, family, or roommates.
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="px-8 pb-10">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-3">
                                        <label htmlFor="name" className="text-sm font-semibold ml-1">
                                            Group Name
                                        </label>
                                        <div className="relative group">
                                            <Users className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                                            <Input
                                                id="name"
                                                type="text"
                                                placeholder="e.g. Europe Trip 2024, Flatmates..."
                                                className="pl-12 h-14 text-lg bg-background/80 border-2 border-border/60 focus:border-primary/60 focus:ring-4 focus:ring-primary/10 transition-all rounded-xl"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                disabled={isLoading}
                                                required
                                                autoFocus
                                            />
                                        </div>
                                    </div>

                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            className="flex items-center gap-3 rounded-xl bg-destructive/10 px-4 py-4 text-sm text-destructive border border-destructive/20 shadow-sm"
                                        >
                                            <AlertCircle className="h-5 w-5 shrink-0" />
                                            <p className="font-medium">{error}</p>
                                        </motion.div>
                                    )}

                                    <Button
                                        type="submit"
                                        className="w-full h-14 text-lg font-bold shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all duration-300 rounded-xl bg-gradient-to-r from-primary to-emerald-600 hover:scale-[1.02] active:scale-[0.98]"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                                                Creating group...
                                            </>
                                        ) : (
                                            <>
                                                <Plus className="mr-2 h-6 w-6" />
                                                Create Group
                                            </>
                                        )}
                                    </Button>

                                    <div className="text-center">
                                        <p className="text-sm text-muted-foreground">
                                            You can add participants to this group later.
                                        </p>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </motion.div>
                </Container>
            </main>

            {/* Grid Pattern CSS */}
            <style jsx global>{`
                .bg-grid-pattern {
                    background-image: radial-gradient(circle, hsl(var(--foreground) / 0.05) 1px, transparent 1px);
                    background-size: 32px 32px;
                }
            `}</style>
        </div>
    );
}
