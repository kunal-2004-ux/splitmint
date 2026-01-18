'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Sparkles, Loader2, Mail, Lock, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const response = await api.post('/auth/login', {
                email,
                password,
            });

            // Structure: { success: true, data: { user, token } }
            const { user, token } = response.data.data;

            login(token, user);
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Invalid email or password');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative flex min-h-screen flex-col bg-background overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] -z-10" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[80px] -z-10" />

            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl py-4">
                <div className="container px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-emerald-600 shadow-lg shadow-primary/20">
                                <Sparkles className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">SplitMint</span>
                        </Link>
                        <Link href="/">
                            <Button variant="ghost" size="sm" className="gap-2">
                                <ArrowLeft className="h-4 w-4" />
                                Back to Home
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex flex-1 items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="w-full max-w-lg"
                >
                    <Card className="border-2 border-border/60 bg-card/90 backdrop-blur-sm shadow-2xl">
                        <CardHeader className="space-y-3 pb-8">
                            <CardTitle className="text-3xl font-bold tracking-tight">Welcome back</CardTitle>
                            <CardDescription className="text-base text-muted-foreground">
                                Enter your credentials to access your account
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2.5">
                                    <label htmlFor="email" className="text-sm font-semibold">
                                        Email
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3.5 top-3.5 h-5 w-5 text-muted-foreground" />
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="name@example.com"
                                            className="pl-11 h-12 text-base bg-background/80 border-2 border-border/60 focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            disabled={isLoading}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2.5">
                                    <div className="flex items-center justify-between">
                                        <label htmlFor="password" className="text-sm font-semibold">
                                            Password
                                        </label>
                                        <Link href="/forgot-password" className="text-xs text-primary hover:underline font-medium">
                                            Forgot password?
                                        </Link>
                                    </div>
                                    <div className="relative">
                                        <Lock className="absolute left-3.5 top-3.5 h-5 w-5 text-muted-foreground" />
                                        <Input
                                            id="password"
                                            type="password"
                                            placeholder="••••••••"
                                            className="pl-11 h-12 text-base bg-background/80 border-2 border-border/60 focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            disabled={isLoading}
                                            required
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="flex items-center gap-3 rounded-lg bg-destructive/15 px-4 py-3.5 text-sm text-destructive border-2 border-destructive/30"
                                    >
                                        <AlertCircle className="h-5 w-5 shrink-0" />
                                        <p className="font-medium">{error}</p>
                                    </motion.div>
                                )}

                                <Button
                                    type="submit"
                                    className="w-full h-12 text-base font-semibold shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 transition-all duration-300"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            Signing in...
                                        </>
                                    ) : (
                                        'Sign In'
                                    )}
                                </Button>

                                <div className="relative my-8">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t-2 border-border/60" />
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="bg-card px-3 text-muted-foreground font-medium">
                                            New to SplitMint?
                                        </span>
                                    </div>
                                </div>

                                <Link href="/register" className="block">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full h-12 text-base font-semibold border-2 border-border/60 hover:border-primary/60 hover:bg-primary/5"
                                        disabled={isLoading}
                                    >
                                        Create an account
                                    </Button>
                                </Link>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Trust indicators */}
                    <p className="mt-8 text-center text-sm text-muted-foreground font-medium">
                        🔒 Protected by industry-standard encryption
                    </p>
                </motion.div>
            </main>

            <style jsx global>{`
                .bg-grid-pattern {
                    background-image: linear-gradient(to right, rgb(128 128 128 / 0.05) 1px, transparent 1px),
                        linear-gradient(to bottom, rgb(128 128 128 / 0.05) 1px, transparent 1px);
                    background-size: 60px 60px;
                }
            `}</style>
        </div>
    );
}
