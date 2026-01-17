'use client';

import { Suspense, useEffect, useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import api from '@/lib/api';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { Container } from '@/components/container';
import { MintSenseInput } from '@/components/mintsense/mintsense-input';
import { DraftPreview, DraftResponse } from '@/components/mintsense/draft-preview';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface Group {
    id: string;
    name: string;
}

interface Participant {
    id: string;
    name: string;
}

function MintSenseContent() {
    const { user, logout } = useAuth();
    const searchParams = useSearchParams();
    const router = useRouter();

    const [groups, setGroups] = useState<Group[]>([]);
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [isInitializing, setIsInitializing] = useState(true);

    // MintSense State
    const [text, setText] = useState('');
    const [draft, setDraft] = useState<DraftResponse | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    const groupId = searchParams.get('groupId');

    useEffect(() => {
        const init = async () => {
            try {
                const response = await api.get('/groups');
                const groupsList = response.data.data.groups || [];
                setGroups(groupsList);

                if (groupsList.length > 0 && !groupId) {
                    const newParams = new URLSearchParams(searchParams.toString());
                    newParams.set('groupId', groupsList[0].id);
                    router.replace(`/dashboard/mintsense?${newParams.toString()}`);
                }

                // Fetch participants if generic group is set
                if (groupId) {
                    const partsRes = await api.get(`/groups/${groupId}/participants`);
                    setParticipants(partsRes.data.data.participants || []);
                }

            } catch (error) {
                console.error('Failed to init MintSense', error);
            } finally {
                setIsInitializing(false);
            }
        };
        init();
    }, [groupId, router, searchParams]);

    // Handle Group Change
    const handleGroupChange = (newGroupId: string) => {
        const newParams = new URLSearchParams(searchParams.toString());
        newParams.set('groupId', newGroupId);
        router.push(`/dashboard/mintsense?${newParams.toString()}`);
        // Clear state on group switch
        setDraft(null);
        setText('');
    };

    // Participant Map
    const participantMap = useMemo(() => {
        return participants.reduce((acc, p) => {
            acc[p.id] = p.name;
            return acc;
        }, {} as Record<string, string>);
    }, [participants]);

    // Handlers
    const handleTextChange = (val: string) => {
        setText(val);
        if (draft) setDraft(null); // Draft Locking Refinement
    };

    const handleGenerate = async () => {
        if (!groupId || !text.trim()) return;

        setIsGenerating(true);
        setDraft(null);

        try {
            const response = await api.post('/ai/expense-draft', {
                groupId,
                text
            });

            if (response.data.success) {
                setDraft(response.data.data.draft);
            }
        } catch (error) {
            console.error('Generation failed', error);
            // Could add toast here
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCreate = async () => {
        if (!draft || !groupId) return;

        setIsCreating(true);
        try {
            const payload = {
                payerId: draft.payerId,
                amount: draft.amount,
                description: draft.description,
                date: draft.date,
                splitMode: draft.splitMode,
                splits: draft.splits
            };

            const response = await api.post(`/groups/${groupId}/expenses`, payload);

            if (response.data.success) {
                router.push(`/dashboard?groupId=${groupId}`);
            }
        } catch (error) {
            console.error('Creation failed', error);
        } finally {
            setIsCreating(false);
        }
    };

    if (isInitializing && groups.length === 0) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-10">
            <DashboardHeader
                userEmail={user?.email}
                groups={groups}
                selectedGroupId={groupId}
                onGroupChange={handleGroupChange}
                onLogout={logout}
            />

            <Container className="py-8 space-y-6 max-w-4xl">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" asChild className="gap-2 -ml-2 text-muted-foreground">
                        <Link href="/dashboard">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Dashboard
                        </Link>
                    </Button>
                </div>

                <div className="space-y-2">
                    <h1 className="text-3xl font-semibold tracking-tight flex items-center gap-2">
                        <Sparkles className="h-8 w-8 text-indigo-500" />
                        MintSense AI
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Describe your expense in natural language, and we'll draft it for you.
                    </p>
                </div>

                <div className="grid gap-8 lg:grid-cols-5">
                    <div className="lg:col-span-3 space-y-6">
                        <MintSenseInput
                            value={text}
                            onChange={handleTextChange}
                            onGenerate={handleGenerate}
                            isGenerating={isGenerating}
                        />

                        {draft && (
                            <DraftPreview
                                draft={draft}
                                participantMap={participantMap}
                                onEdit={() => {
                                    // Just focus the input? It's already there. 
                                    setDraft(null); // Clear preview to "edit"
                                }}
                                onCreate={handleCreate}
                                isCreating={isCreating}
                            />
                        )}
                    </div>

                    <div className="lg:col-span-2">
                        <div className="bg-muted/30 rounded-lg p-6 space-y-4 border border-border/40">
                            <h3 className="font-semibold">Examples</h3>
                            <ul className="space-y-3 text-sm text-muted-foreground">
                                <li className="bg-background/50 p-3 rounded border border-border/40 cursor-pointer hover:border-primary/50 transition-colors"
                                    onClick={() => handleTextChange("Lunch at Saravana Bhavan for 450 paid by Rahul")}
                                >
                                    "Lunch at Saravana Bhavan for 450 paid by Rahul"
                                </li>
                                <li className="bg-background/50 p-3 rounded border border-border/40 cursor-pointer hover:border-primary/50 transition-colors"
                                    onClick={() => handleTextChange("Paid 1200 for Uber split equally between me, Alice and Bob")}
                                >
                                    "Paid 1200 for Uber split equally between me, Alice and Bob"
                                </li>
                                <li className="bg-background/50 p-3 rounded border border-border/40 cursor-pointer hover:border-primary/50 transition-colors"
                                    onClick={() => handleTextChange("Movie tickets 300 each for 4 people paid by me")}
                                >
                                    "Movie tickets 300 each for 4 people paid by me"
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </Container>
        </div>
    );
}

export default function MintSensePage() {
    return (
        <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
            <MintSenseContent />
        </Suspense>
    )
}
