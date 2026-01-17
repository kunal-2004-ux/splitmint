'use client';

import { Suspense, useEffect, useState, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import api from '@/lib/api';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { Container } from '@/components/container';
import { FilterBar, FilterState } from '@/components/expenses/filter-bar';
import { ExpenseList } from '@/components/expenses/expense-list';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface Group {
    id: string;
    name: string;
}

interface Participant {
    id: string;
    name: string;
}

function ExpensesContent() {
    const { user, logout } = useAuth();
    const searchParams = useSearchParams();
    const router = useRouter();

    // State
    const [groups, setGroups] = useState<Group[]>([]);
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [expenses, setExpenses] = useState<any[]>([]); // Using exact backend type
    const [isLoading, setIsLoading] = useState(true);

    // Derived filters from URL
    const filters: FilterState = useMemo(() => ({
        from: searchParams.get('from') || '',
        to: searchParams.get('to') || '',
        participantId: searchParams.get('participantId') || '',
        minAmount: searchParams.get('minAmount') || '',
        maxAmount: searchParams.get('maxAmount') || '',
        q: searchParams.get('q') || '',
    }), [searchParams]);

    const groupId = searchParams.get('groupId');

    // Fetch groups on mount and handle defensive redirect
    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const response = await api.get('/groups');
                const groupsList = response.data.data.groups || [];
                setGroups(groupsList);

                if (groupsList.length > 0 && !groupId) {
                    // Defensive: Auto-select first group if none in URL
                    const newParams = new URLSearchParams(searchParams.toString());
                    newParams.set('groupId', groupsList[0].id);
                    router.replace(`/dashboard/expenses?${newParams.toString()}`);
                } else if (groupsList.length === 0) {
                    setIsLoading(false);
                }
            } catch (error) {
                console.error('Failed to fetch groups', error);
                setIsLoading(false);
            }
        };
        fetchGroups();
    }, [groupId, router, searchParams]);

    // Fetch participants and expenses when groupId changes or filters change
    useEffect(() => {
        if (!groupId) return;

        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Fetch participants (for filter dropdown & name mapping)
                const partsRes = await api.get(`/groups/${groupId}/participants`);
                setParticipants(partsRes.data.data.participants || []);

                // Clean filters to remove empty strings which cause backend validation errors
                const cleanedFilters = Object.fromEntries(
                    Object.entries(filters).filter(([_, v]) => v !== '')
                );

                // Fetch expenses
                const expensesRes = await api.get(`/groups/${groupId}/expenses`, {
                    params: cleanedFilters,
                });
                setExpenses(expensesRes.data.data.expenses || []);
            } catch (error) {
                console.error('Failed to fetch expense data', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [groupId, filters.from, filters.to, filters.participantId, filters.minAmount, filters.maxAmount, filters.q]);


    const handleGroupChange = (newGroupId: string) => {
        const newParams = new URLSearchParams(searchParams.toString());
        newParams.set('groupId', newGroupId);
        router.push(`/dashboard/expenses?${newParams.toString()}`);
    };

    const handleFilterChange = (newFilters: FilterState) => {
        const newParams = new URLSearchParams(searchParams.toString());

        // Update or remove params
        Object.entries(newFilters).forEach(([key, value]) => {
            if (value) {
                newParams.set(key, value);
            } else {
                newParams.delete(key);
            }
        });

        router.push(`/dashboard/expenses?${newParams.toString()}`);
    };

    const handleClearFilters = () => {
        if (!groupId) return;
        // Keep groupId, clear others
        router.push(`/dashboard/expenses?groupId=${groupId}`);
    };

    // Participant Map for display
    const participantMap = useMemo(() => {
        return participants.reduce((acc, p) => {
            acc[p.id] = p.name;
            return acc;
        }, {} as Record<string, string>);
    }, [participants]);

    if (isLoading && groups.length === 0) {
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

            <Container className="py-8 space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" asChild className="gap-2 -ml-2 text-muted-foreground">
                        <Link href="/dashboard">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Dashboard
                        </Link>
                    </Button>
                </div>

                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-semibold tracking-tight">Expenses</h1>
                    <p className="text-sm text-muted-foreground">
                        View and filter transaction history for {groups.find(g => g.id === groupId)?.name || '...'}
                    </p>
                </div>

                <FilterBar
                    filters={filters}
                    participants={participants}
                    onFilterChange={handleFilterChange}
                    onClearFilters={handleClearFilters}
                />

                <ExpenseList
                    expenses={expenses}
                    participantMap={participantMap}
                    isLoading={isLoading}
                />
            </Container>
        </div>
    );
}

export default function ExpensesPage() {
    return (
        <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
            <ExpensesContent />
        </Suspense>
    )
}
