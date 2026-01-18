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
import { ArrowLeft, Loader2, Plus, Users, UserPlus, Trash2, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface Group {
    id: string;
    name: string;
}

interface Participant {
    id: string;
    name: string;
    color?: string;
}

function ParticipantsContent() {
    const { user, logout } = useAuth();
    const searchParams = useSearchParams();
    const router = useRouter();
    const groupId = searchParams.get('groupId');

    const [groups, setGroups] = useState<Group[]>([]);
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [newName, setNewName] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const groupsRes = await api.get('/groups');
                const groupsList = groupsRes.data.data.groups || [];
                setGroups(groupsList);

                if (groupId) {
                    const partsRes = await api.get(`/groups/${groupId}/participants`);
                    setParticipants(partsRes.data.data.participants || []);
                }
            } catch (err) {
                console.error('Failed to fetch data', err);
                setError('Failed to load participants');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [groupId]);

    const handleGroupChange = (newGroupId: string) => {
        router.push(`/dashboard/participants?groupId=${newGroupId}`);
    };

    const handleAddParticipant = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName.trim() || !groupId) return;

        setIsSubmitting(true);
        setError('');

        try {
            const response = await api.post(`/groups/${groupId}/participants`, {
                name: newName.trim(),
            });

            setParticipants([...participants, response.data.data.participant]);
            setNewName('');
        } catch (err: any) {
            setError(err.message || 'Failed to add participant');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteParticipant = async (id: string) => {
        if (!confirm('Are you sure you want to remove this participant? All their associated expenses will remain, but you won\'t be able to select them for new ones.')) return;

        try {
            await api.delete(`/participants/${id}`);
            setParticipants(participants.filter(p => p.id !== id));
        } catch (err: any) {
            setError(err.message || 'Failed to remove participant');
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

            <Container className="py-8 max-w-4xl">
                <div className="mb-8 pt-4">
                    <Button variant="ghost" size="sm" asChild className="gap-2 px-3 h-9 font-bold text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all rounded-lg mb-6">
                        <Link href="/dashboard">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Overview
                        </Link>
                    </Button>
                    <h1 className="text-4xl font-black tracking-tight">Manage Group</h1>
                    <div className="flex items-center gap-2 mt-2">
                        <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                        <p className="text-xs font-bold text-muted-foreground/80 uppercase tracking-widest">
                            {currentGroup?.name || '...'}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Add Participant Card */}
                    <div className="lg:col-span-1">
                        <Card className="border-2 shadow-xl sticky top-24 relative overflow-hidden">
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-emerald-500" />
                            <CardHeader className="pb-4 bg-muted/20 border-b-2 border-border/50">
                                <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-muted-foreground">
                                    <UserPlus className="h-4 w-4 text-primary" />
                                    Add Member
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <form onSubmit={handleAddParticipant} className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold tracking-tight ml-1">Full Name</label>
                                        <Input
                                            placeholder="e.g. John Smith"
                                            value={newName}
                                            onChange={(e) => setNewName(e.target.value)}
                                            className="h-13 border-2 border-border bg-white rounded-xl focus:ring-4 focus:ring-primary/5 focus:border-primary/40 transition-all font-bold"
                                            required
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        className="w-full h-13 font-black text-lg rounded-xl shadow-2xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                        disabled={isSubmitting || !newName.trim()}
                                    >
                                        {isSubmitting ? <Loader2 className="h-6 w-6 animate-spin" /> : <><Plus className="mr-2 h-5 w-5" /> Add Member</>}
                                    </Button>
                                    <AnimatePresence>
                                        {error && (
                                            <motion.p
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                className="text-xs text-destructive font-medium bg-destructive/5 p-2 rounded-lg border border-destructive/20 mt-2"
                                            >
                                                {error}
                                            </motion.p>
                                        )}
                                    </AnimatePresence>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Participant List */}
                    <div className="lg:col-span-2 space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground/80 flex items-center gap-2 mb-4">
                            <Users className="h-4 w-4 text-primary" />
                            Group Members ({participants.length})
                        </h3>

                        <AnimatePresence mode="popLayout">
                            {participants.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="bg-muted/10 border-2 border-dashed rounded-2xl py-20 text-center flex flex-col items-center justify-center p-6"
                                >
                                    <div className="h-16 w-16 bg-muted/20 rounded-full flex items-center justify-center mb-4">
                                        <Users className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                    <h4 className="text-xl font-bold mb-1">No members yet</h4>
                                    <p className="text-muted-foreground max-w-xs">
                                        Add your friends to start splitting.
                                    </p>
                                </motion.div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {participants.map((p, index) => (
                                        <motion.div
                                            key={p.id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <Card className="group border-2 border-border bg-white hover:border-primary/40 transition-all hover:shadow-xl rounded-2xl overflow-hidden relative">
                                                <div className="h-full w-1 absolute left-0 top-0 bg-primary/20 group-hover:bg-primary transition-colors" />
                                                <CardContent className="p-4 flex items-center justify-between">
                                                    <div className="flex items-center gap-4 pl-1">
                                                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-xl border border-primary/20 transition-all group-hover:scale-110 group-hover:bg-primary group-hover:text-white group-hover:border-primary group-hover:shadow-lg group-hover:shadow-primary/20">
                                                            {p.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-lg leading-tight">{p.name}</p>
                                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                                <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60">Participant</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-10 w-10 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                                        onClick={() => handleDeleteParticipant(p.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </AnimatePresence>

                        <Card className="bg-primary/5 border-2 border-primary/20 rounded-3xl overflow-hidden mt-6">
                            <CardContent className="p-6 flex items-start gap-5">
                                <div className="h-14 w-14 shrink-0 bg-primary/10 rounded-2xl flex items-center justify-center border-2 border-primary/20">
                                    <ShieldCheck className="h-7 w-7 text-primary" />
                                </div>
                                <div className="space-y-2">
                                    <p className="text-lg font-black tracking-tight">Enterprise-Grade Privacy</p>
                                    <p className="text-sm font-bold text-muted-foreground/80 leading-relaxed">
                                        Members added represent logical entities in your group ledger. They don't need to create accounts, keeping your group data private and streamlined.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </Container>
        </div>
    );
}

export default function ParticipantsPage() {
    return (
        <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
            <ParticipantsContent />
        </Suspense>
    );
}
