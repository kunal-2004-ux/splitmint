'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FilterState {
    from: string;
    to: string;
    participantId: string;
    minAmount: string;
    maxAmount: string;
    q: string;
}

interface FilterBarProps {
    filters: FilterState;
    participants: Array<{ id: string; name: string }>;
    onFilterChange: (filters: FilterState) => void;
    onClearFilters: () => void;
}

export function FilterBar({ filters, participants, onFilterChange, onClearFilters }: FilterBarProps) {
    const [localSearch, setLocalSearch] = useState(filters.q || '');
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    // Sync local search with props if props change externally (e.g. valid clear)
    useEffect(() => {
        setLocalSearch(filters.q || '');
    }, [filters.q]);

    const handleSearchChange = (val: string) => {
        setLocalSearch(val);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            onFilterChange({ ...filters, q: val });
        }, 300);
    };

    const handleInputChange = (key: keyof FilterState, val: string) => {
        onFilterChange({ ...filters, [key]: val });
    };

    const hasActiveFilters = Object.values(filters).some(val => val !== '');

    return (
        <div className="space-y-4 rounded-lg bg-card/30 p-4 border border-border/40 backdrop-blur-sm">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Search */}
                <div className="relative col-span-full lg:col-span-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search expenses..."
                        className="pl-9 bg-background/50 h-10"
                        value={localSearch}
                        onChange={(e) => handleSearchChange(e.target.value)}
                    />
                </div>

                {/* Date Range */}
                <div className="flex flex-col sm:flex-row items-center gap-2">
                    <div className="flex items-center gap-2 w-full">
                        <Input
                            type="date"
                            className="bg-background/50 h-10 w-full"
                            value={filters.from}
                            onChange={(e) => handleInputChange('from', e.target.value)}
                            placeholder="From"
                        />
                        <span className="text-muted-foreground text-sm font-medium sm:hidden">to</span>
                    </div>
                    <span className="text-muted-foreground text-sm font-medium hidden sm:inline">to</span>
                    <Input
                        type="date"
                        className="bg-background/50 h-10 w-full"
                        value={filters.to}
                        onChange={(e) => handleInputChange('to', e.target.value)}
                        placeholder="To"
                    />
                </div>

                {/* Participant */}
                <div className="relative">
                    <select
                        className={cn(
                            "flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none pr-8 cursor-pointer"
                        )}
                        value={filters.participantId}
                        onChange={(e) => handleInputChange('participantId', e.target.value)}
                    >
                        <option value="">All Participants</option>
                        {participants.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                    <div className="absolute right-3 top-3 pointer-events-none">
                        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-50">
                            <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                </div>

                {/* Amount */}
                <div className="flex flex-col sm:flex-row items-center gap-2">
                    <div className="flex items-center gap-2 w-full">
                        <Input
                            type="number"
                            placeholder="Min"
                            className="bg-background/50 h-10 w-full"
                            value={filters.minAmount}
                            onChange={(e) => handleInputChange('minAmount', e.target.value)}
                        />
                        <span className="text-muted-foreground text-sm font-medium sm:hidden">-</span>
                    </div>
                    <span className="text-muted-foreground text-sm font-medium hidden sm:inline">-</span>
                    <Input
                        type="number"
                        placeholder="Max"
                        className="bg-background/50 h-10 w-full"
                        value={filters.maxAmount}
                        onChange={(e) => handleInputChange('maxAmount', e.target.value)}
                    />
                </div>
            </div>

            {hasActiveFilters && (
                <div className="flex justify-end">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            setLocalSearch('');
                            onClearFilters();
                        }}
                        className="text-muted-foreground hover:text-foreground h-8"
                    >
                        <X className="mr-2 h-3 w-3" />
                        Clear Filters
                    </Button>
                </div>
            )}
        </div>
    );
}
