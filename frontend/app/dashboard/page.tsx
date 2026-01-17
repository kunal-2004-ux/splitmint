'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/auth-context';
import api from '@/lib/api';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { SummaryCards } from '@/components/dashboard/summary-cards';
import { BalanceList } from '@/components/dashboard/balance-list';
import { SettlementList } from '@/components/dashboard/settlement-list';
import { Container } from '@/components/container';
import { Loader2, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface Group {
    id: string;
    name: string;
}

interface DashboardData {
    summary: {
        totalSpent: number;
        youOwe: number;
        owedToYou: number;
    };
    balances: Array<{
        participantId: string;
        name: string;
        netBalance: number;
    }>;
    settlements: Array<{
        fromName: string;
        toName: string;
        amount: number;
    }>;
}

export default function DashboardPage() {
    const { user, logout } = useAuth();
    const [groups, setGroups] = useState<Group[]>([]);
    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSwitching, setIsSwitching] = useState(false);

    // Fetch groups on mount
    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const response = await api.get('/groups');
                // Structure: { success: true, data: { groups: [...] } }
                const groupsList = response.data.data.groups || [];
                setGroups(groupsList);

                if (groupsList.length > 0) {
                    setSelectedGroupId(groupsList[0].id);
                } else {
                    setIsLoading(false); // Stop loading if no groups
                }
            } catch (error) {
                console.error('Failed to fetch groups', error);
                setIsLoading(false);
            }
        };

        fetchGroups();
    }, []);

    // Fetch dashboard data when selectedGroupId changes
    const fetchDashboardData = useCallback(async (groupId: string) => {
        if (!groupId) return;

        // Use isSwitching for subsequent loads to avoid clearing UI
        const isFirstLoad = !dashboardData;
        if (isFirstLoad) setIsLoading(true);
        else setIsSwitching(true);

        try {
            const response = await api.get(`/groups/${groupId}/balances`);
            // Structure: { success: true, data: { summary, balances, settlements } }
            setDashboardData(response.data.data);
        } catch (error) {
            console.error('Failed to fetch dashboard data', error);
        } finally {
            setIsLoading(false);
            setIsSwitching(false);
        }
    }, [dashboardData]);

    useEffect(() => {
        if (selectedGroupId) {
            fetchDashboardData(selectedGroupId);
        }
    }, [selectedGroupId, fetchDashboardData]);

    const handleGroupChange = (groupId: string) => {
        setSelectedGroupId(groupId);
    };

    if (isLoading && !dashboardData && groups.length > 0) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    // Empty state: No groups
    if (!isLoading && groups.length === 0) {
        return (
            <>
                <DashboardHeader
                    userEmail={user?.email}
                    groups={[]}
                    selectedGroupId={null}
                    onGroupChange={() => { }}
                    onLogout={logout}
                />
                <Container className="py-20 flex flex-col items-center justify-center text-center">
                    <div className="bg-muted/30 p-8 rounded-full mb-6">
                        <PlusCircle className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <h2 className="text-3xl font-semibold tracking-tight mb-2">Welcome to SplitMint</h2>
                    <p className="text-muted-foreground max-w-md mb-8">
                        You don't have any groups yet. Create your first group to start splitting expenses smarter.
                    </p>
                    <Button asChild>
                        <Link href="/groups/new">Create Group</Link>
                    </Button>
                </Container>
            </>
        )
    }

    return (
        <div className="min-h-screen bg-background pb-10">
            <DashboardHeader
                userEmail={user?.email}
                groups={groups}
                selectedGroupId={selectedGroupId}
                onGroupChange={handleGroupChange}
                onLogout={logout}
            />

            <Container className="py-8 space-y-8 relative">
                {/* Loading Overlay */}
                {isSwitching && (
                    <div className="absolute inset-0 bg-background/50 z-10 flex items-start justify-center pt-20 backdrop-blur-[1px] transition-all duration-300">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                )}

                {/* Dashboard Content */}
                <div className={isSwitching ? 'opacity-50 transition-opacity duration-300' : 'transition-opacity duration-300'}>
                    <section className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-medium tracking-tight">Overview</h2>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={`/dashboard/expenses${selectedGroupId ? `?groupId=${selectedGroupId}` : ''}`}>
                                        View Expenses
                                    </Link>
                                </Button>
                                <Button size="sm" className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white border-0 shadow-sm" asChild>
                                    <Link href={`/dashboard/mintsense${selectedGroupId ? `?groupId=${selectedGroupId}` : ''}`}>
                                        <span className="mr-2">✨</span> MintSense AI
                                    </Link>
                                </Button>
                            </div>
                        </div>
                        <SummaryCards
                            data={dashboardData?.summary || null}
                            isLoading={isLoading}
                        />
                    </section>

                    <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                        <div className="lg:col-span-4">
                            <BalanceList
                                balances={dashboardData?.balances || []}
                                isLoading={isLoading}
                            />
                        </div>
                        <div className="lg:col-span-3">
                            <SettlementList
                                settlements={dashboardData?.settlements || []}
                                isLoading={isLoading}
                            />
                        </div>
                    </section>
                </div>
            </Container>
        </div>
    );
}
