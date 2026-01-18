'use client';

import { LogOut, ChevronDown, User, Plus, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/container';
import { cn } from '@/lib/utils';
import { ChangeEvent } from 'react';
import Link from 'next/link';

interface Group {
    id: string;
    name: string;
}

interface DashboardHeaderProps {
    userEmail?: string | null;
    groups: Group[];
    selectedGroupId: string | null;
    onGroupChange: (groupId: string) => void;
    onLogout: () => void;
}

export function DashboardHeader({
    userEmail,
    groups,
    selectedGroupId,
    onGroupChange,
    onLogout,
}: DashboardHeaderProps) {
    const handleGroupChange = (e: ChangeEvent<HTMLSelectElement>) => {
        onGroupChange(e.target.value);
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
            <Container>
                <div className="flex h-16 items-center justify-between">
                    <div className="flex items-center gap-8">
                        <Link href="/dashboard" className="flex items-center gap-2 group transition-all">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-emerald-600 shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
                                <span className="font-bold text-white text-lg">S</span>
                            </div>
                            <span className="hidden text-xl font-bold sm:inline-block bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                                SplitMint
                            </span>
                        </Link>

                        <div className="flex items-center gap-3">
                            {groups.length > 0 && (
                                <div className="relative group">
                                    <select
                                        value={selectedGroupId || ''}
                                        onChange={handleGroupChange}
                                        className={cn(
                                            "h-10 w-[160px] sm:w-[200px] appearance-none rounded-xl border-2 border-border/60 bg-background/50 pl-4 pr-10 text-sm font-medium shadow-sm transition-all",
                                            "focus:border-primary/60 focus:ring-4 focus:ring-primary/10 outline-none cursor-pointer hover:bg-muted/50"
                                        )}
                                    >
                                        {groups.map((group) => (
                                            <option key={group.id} value={group.id} className="bg-popover text-popover-foreground py-2">
                                                {group.name}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50 pointer-events-none group-focus-within:rotate-180 transition-transform" />
                                </div>
                            )}

                            <Button asChild variant="outline" size="icon" className="h-10 w-10 rounded-xl border-2 hover:bg-primary/5 hover:border-primary/40 hover:text-primary transition-all shadow-sm" title="Create New Group">
                                <Link href="/groups/new">
                                    <Plus className="h-5 w-5" />
                                </Link>
                            </Button>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-6">
                        <div className="hidden md:flex flex-col items-end">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Account</span>
                            <span className="text-sm font-medium">
                                {userEmail?.split('@')[0]}
                            </span>
                        </div>

                        <div className="h-8 w-[1px] bg-border/40 hidden sm:block" />

                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onLogout}
                            className="h-10 w-10 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                            title="Sign Out"
                        >
                            <LogOut className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </Container>
        </header>
    );
}
