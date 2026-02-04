'use client';

import { Button } from '@/components/ui/button';
import { Settings, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ModeToggle } from '@/components/mode-toggle';

export function Navbar() {
    return (
        <header className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-background/60 backdrop-blur-xl backdrop-saturate-150 sticky top-0 z-50">
            <div className="flex items-center gap-3">
                <div className="flex items-center justify-center h-10 w-10 bg-muted rounded-md border border-border">
                    <span className="font-mono font-bold text-lg text-foreground">P</span>
                </div>
                <div className="flex flex-col">
                    <span className="font-bold text-lg leading-tight tracking-tight">PrepedAI</span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Planning & Orchestration Layer</span>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <ModeToggle />
                <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground">
                    <Settings className="h-4 w-4" />
                    Settings
                </Button>
                <Button variant="outline" className="gap-2 bg-secondary/50 border-border hover:bg-secondary">
                    New Project
                </Button>
            </div>
        </header>
    );
}
