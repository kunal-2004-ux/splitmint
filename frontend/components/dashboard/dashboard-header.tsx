'use client';

import { LogOut, ChevronDown, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/container';
import { cn } from '@/lib/utils';
import { ChangeEvent } from 'react';

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
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <Container>
                <div className="flex h-16 items-center justify-between">
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                                <span className="font-bold text-primary-foreground">S</span>
                            </div>
                            <span className="hidden text-xl font-bold sm:inline-block">SplitMint</span>
                        </div>

                        {groups.length > 0 && (
                            <div className="relative">
                                <select
                                    value={selectedGroupId || ''}
                                    onChange={handleGroupChange}
                                    className={cn(
                                        "h-9 w-[180px] appearance-none rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors",
                                        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                                        "cursor-pointer hover:bg-accent hover:text-accent-foreground"
                                    )}
                                >
                                    {groups.map((group) => (
                                        <option key={group.id} value={group.id} className="bg-popover text-popover-foreground">
                                            {group.name}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50 pointer-events-none" />
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground hidden sm:inline-block">
                            {userEmail}
                        </span>
                        <Button variant="ghost" size="icon" onClick={onLogout} title="Sign Out">
                            <LogOut className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </Container>
        </header>
    );
}
