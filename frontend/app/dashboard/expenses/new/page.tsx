'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import api from '@/lib/api';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { Container } from '@/components/container';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Loader2, Plus, Users, Receipt, Calendar, Info } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface Group {
    id: string;
    name: string;
}

interface Participant {
    id: string;
    name: string;
}

function AddExpenseContent() {
    const { user, logout } = useAuth();
    const searchParams = useSearchParams();
    const router = useRouter();
    const groupId = searchParams.get('groupId');

    const [groups, setGroups] = useState<Group[]>([]);
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Form state
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [payerId, setPayerId] = useState('');
    const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const groupsRes = await api.get('/groups');
                const groupsList = groupsRes.data.data.groups || [];
                setGroups(groupsList);

                if (!groupId && groupsList.length > 0) {
                    router.replace(`/dashboard/expenses/new?groupId=${groupsList[0].id}`);
                    return;
                }

                if (groupId) {
                    const partsRes = await api.get(`/groups/${groupId}/participants`);
                    const partsList = partsRes.data.data.participants || [];
                    setParticipants(partsList);

                    if (partsList.length > 0) {
                        setPayerId(partsList[0].id);
                        setSelectedParticipants(partsList.map((p: any) => p.id));
                    }
                }
            } catch (err) {
                console.error('Failed to fetch data', err);
                setError('Failed to load group data');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [groupId, router]);

    const handleGroupChange = (newGroupId: string) => {
        router.push(`/dashboard/expenses/new?groupId=${newGroupId}`);
    };

    const toggleParticipant = (id: string) => {
        setSelectedParticipants(prev =>
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!description.trim()) return setError('Description is required');
        if (!amount || parseFloat(amount) <= 0) return setError('Valid amount is required');
        if (!payerId) return setError('Payer is required');
        if (selectedParticipants.length === 0) return setError('Select at least one participant to split with');

        setIsSubmitting(true);

        try {
            await api.post(`/groups/${groupId}/expenses`, {
                description: description.trim(),
                amount: Math.round(parseFloat(amount) * 100), // Convert to cents/paise
                date: new Date(date).toISOString(),
                payerId,
                splitMode: 'EQUAL',
                splits: selectedParticipants
            });

            router.push(`/dashboard/expenses?groupId=${groupId}`);
        } catch (err: any) {
            setError(err.message || 'Failed to create expense');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const currentGroup = groups.find(g => g.id === groupId);

    return (
        <div className="min-h-screen bg-background pb-10">
            <DashboardHeader
                userEmail={user?.email}
                groups={groups}
                selectedGroupId={groupId}
                onGroupChange={handleGroupChange}
                onLogout={logout}
            />

            <Container className="py-8 max-w-2xl">
                <div className="mb-8 pt-4">
                    <Button variant="ghost" size="sm" asChild className="gap-2 px-3 h-9 font-bold text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all rounded-lg mb-6">
                        <Link href="/dashboard">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Overview
                        </Link>
                    </Button>
                    <h1 className="text-4xl font-black tracking-tight">Record Expense</h1>
                    <div className="flex items-center gap-2 mt-2">
                        <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                        <p className="text-xs font-bold text-muted-foreground/80 uppercase tracking-widest">
                            {currentGroup?.name || '...'}
                        </p>
                    </div>
                </div>

                {participants.length === 0 ? (
                    <Card className="border-dashed border-2 bg-muted/10">
                        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="h-16 w-16 rounded-full bg-muted/20 flex items-center justify-center mb-4">
                                <Users className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">No Participants Found</h3>
                            <p className="text-muted-foreground max-w-sm mb-6">
                                You need to add participants to this group before you can record expenses.
                            </p>
                            <Button variant="default" className="shadow-lg shadow-primary/20 rounded-xl font-bold px-8 h-12" asChild>
                                <Link href={`/dashboard/participants?groupId=${groupId}`}>
                                    Add Participants First
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Card className="border-2 border-border shadow-sm rounded-3xl overflow-hidden">
                            <CardHeader className="pb-4 bg-muted/20 border-b-2 border-border/50">
                                <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-muted-foreground">
                                    <Receipt className="h-4 w-4 text-primary" />
                                    Expense Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <label htmlFor="description" className="text-sm font-bold tracking-tight ml-1">Description</label>
                                    <Input
                                        id="description"
                                        placeholder="e.g. Grocery shopping, Movie tickets..."
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="h-13 border-2 border-border bg-white rounded-xl focus:ring-4 focus:ring-primary/5 focus:border-primary/40 transition-all font-medium"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label htmlFor="amount" className="text-sm font-bold tracking-tight ml-1">Amount</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">₹</span>
                                            <Input
                                                id="amount"
                                                type="number"
                                                step="0.01"
                                                placeholder="0.00"
                                                value={amount}
                                                onChange={(e) => setAmount(e.target.value)}
                                                className="pl-8 h-13 border-2 border-border bg-white rounded-xl focus:ring-4 focus:ring-primary/5 focus:border-primary/40 transition-all font-bold text-lg"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="date" className="text-sm font-bold tracking-tight ml-1">Date</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="date"
                                                type="date"
                                                value={date}
                                                onChange={(e) => setDate(e.target.value)}
                                                className="pl-10 h-13 border-2 border-border bg-white rounded-xl focus:ring-4 focus:ring-primary/5 focus:border-primary/40 transition-all font-bold"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-2 border-border shadow-sm rounded-3xl overflow-hidden">
                            <CardHeader className="pb-4 bg-muted/20 border-b-2 border-border/50">
                                <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-muted-foreground">
                                    <Plus className="h-4 w-4 text-primary" />
                                    Split Configuration
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-3">
                                    <label className="text-sm font-bold tracking-tight ml-1">Who paid?</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {participants.map(p => (
                                            <button
                                                key={p.id}
                                                type="button"
                                                onClick={() => setPayerId(p.id)}
                                                className={`p-4 text-sm font-bold rounded-2xl border-2 transition-all text-center ${payerId === p.id
                                                    ? 'border-primary bg-primary text-white shadow-lg shadow-primary/20 scale-105 z-10'
                                                    : 'border-border bg-white hover:border-primary/30 hover:bg-primary/5 text-muted-foreground'
                                                    }`}
                                            >
                                                {p.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-3 pt-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-bold tracking-tight ml-1">Split with whom?</label>
                                        <button
                                            type="button"
                                            onClick={() => setSelectedParticipants(participants.map(p => p.id))}
                                            className="text-xs text-primary font-semibold hover:underline"
                                        >
                                            Select All
                                        </button>
                                    </div>
                                    <div className="bg-muted/30 p-5 rounded-2xl border-2 border-border space-y-3">
                                        {participants.map(p => (
                                            <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-white border border-border shadow-sm">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                                                        {p.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="text-sm font-bold">{p.name}</span>
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    id={`p-${p.id}`}
                                                    checked={selectedParticipants.includes(p.id)}
                                                    onChange={() => toggleParticipant(p.id)}
                                                    className="w-5 h-5 rounded-md border-2 border-border text-primary focus:ring-primary transition-all cursor-pointer"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex items-start gap-3 text-xs font-bold text-primary bg-primary/5 p-4 rounded-2xl border-2 border-primary/10">
                                        <Info className="h-4 w-4 shrink-0 mt-0.5" />
                                        <p className="leading-relaxed">Splitting <span className="text-foreground">equally</span> among {selectedParticipants.length} selected person{selectedParticipants.length !== 1 ? 's' : ''}.</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="p-4 bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium rounded-xl flex items-center gap-2"
                                >
                                    <Info className="h-4 w-4" />
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="flex gap-4 pt-4">
                            <Button
                                variant="outline"
                                type="button"
                                className="flex-1 h-13 border-2 border-border rounded-xl font-bold bg-white hover:bg-muted/50 transition-all"
                                onClick={() => router.back()}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="flex-[2] h-13 font-black text-lg rounded-xl shadow-2xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? <Loader2 className="h-6 w-6 animate-spin" /> : 'Create Expense'}
                            </Button>
                        </div>
                    </form>
                )}
            </Container>
        </div>
    );
}

export default function AddExpensePage() {
    return (
        <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
            <AddExpenseContent />
        </Suspense>
    );
}
