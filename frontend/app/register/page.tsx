'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Lock, User, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '@/lib/api';

export default function RegisterPage() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Client-side validation
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setIsLoading(true);

        try {
            const response = await api.post('/auth/register', {
                name,
                email,
                password,
            });

            if (response.data.success) {
                // Registration successful, redirect to login
                router.push('/login?registered=true');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
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
                <div className="container flex items-center justify-between px-4">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-emerald-600 shadow-lg shadow-primary/20">
                            <span className="text-xl font-bold text-white">S</span>
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                            SplitMint
                        </span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" asChild className="h-10">
                            <Link href="/">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Home
                            </Link>
                        </Button>
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
                            <CardTitle className="text-3xl font-bold tracking-tight">Create an account</CardTitle>
                            <CardDescription className="text-base text-muted-foreground">
                                Join SplitMint to start managing shared expenses smarter
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2.5">
                                    <label htmlFor="name" className="text-sm font-semibold">
                                        Full Name
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3.5 top-3.5 h-5 w-5 text-muted-foreground" />
                                        <Input
                                            id="name"
                                            type="text"
                                            placeholder="John Doe"
                                            className="pl-11 h-12 text-base bg-background/80 border-2 border-border/60 focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            disabled={isLoading}
                                            required
                                        />
                                    </div>
                                </div>

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
                                    <label htmlFor="password" className="text-sm font-semibold">
                                        Password
                                    </label>
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

                                <div className="space-y-2.5">
                                    <label htmlFor="confirmPassword" className="text-sm font-semibold">
                                        Confirm Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3.5 top-3.5 h-5 w-5 text-muted-foreground" />
                                        <Input
                                            id="confirmPassword"
                                            type="password"
                                            placeholder="••••••••"
                                            className="pl-11 h-12 text-base bg-background/80 border-2 border-border/60 focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
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
                                            Creating account...
                                        </>
                                    ) : (
                                        'Create Account'
                                    )}
                                </Button>

                                <div className="relative my-8">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t-2 border-border/60" />
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="bg-card px-3 text-muted-foreground font-medium">
                                            Already have an account?
                                        </span>
                                    </div>
                                </div>

                                <Link href="/login" className="block">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full h-12 text-base font-semibold border-2 border-border/60 hover:border-primary/60 hover:bg-primary/5"
                                        disabled={isLoading}
                                    >
                                        Sign in instead
                                    </Button>
                                </Link>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Trust indicators */}
                    <p className="mt-8 text-center text-sm text-muted-foreground font-medium">
                        🔒 Your data is protected and never shared
                    </p>
                </motion.div>
            </main>

            {/* Grid Pattern CSS */}
            <style jsx global>{`
                .bg-grid-pattern {
                    background-image: radial-gradient(circle, hsl(var(--foreground) / 0.05) 1px, transparent 1px);
                    background-size: 24px 24px;
                }
            `}</style>
        </div>
    );
}
