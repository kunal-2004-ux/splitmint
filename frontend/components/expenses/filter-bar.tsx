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
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search expenses..."
                        className="pl-9 bg-background/50"
                        value={localSearch}
                        onChange={(e) => handleSearchChange(e.target.value)}
                    />
                </div>

                {/* Date Range */}
                <div className="flex items-center gap-2">
                    <Input
                        type="date"
                        className="bg-background/50"
                        value={filters.from}
                        onChange={(e) => handleInputChange('from', e.target.value)}
                        placeholder="From"
                    />
                    <span className="text-muted-foreground">-</span>
                    <Input
                        type="date"
                        className="bg-background/50"
                        value={filters.to}
                        onChange={(e) => handleInputChange('to', e.target.value)}
                        placeholder="To"
                    />
                </div>

                {/* Participant */}
                <div>
                    <select
                        className={cn(
                            "flex h-9 w-full items-center justify-between rounded-md border border-input bg-background/50 px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 appearance-none",
                        )}
                        value={filters.participantId}
                        onChange={(e) => handleInputChange('participantId', e.target.value)}
                    >
                        <option value="">All Participants</option>
                        {participants.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                </div>

                {/* Amount */}
                <div className="flex items-center gap-2">
                    <Input
                        type="number"
                        placeholder="Min"
                        className="bg-background/50"
                        value={filters.minAmount}
                        onChange={(e) => handleInputChange('minAmount', e.target.value)}
                    />
                    <Input
                        type="number"
                        placeholder="Max"
                        className="bg-background/50"
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
