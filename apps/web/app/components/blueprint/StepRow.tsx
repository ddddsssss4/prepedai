'use client';

import { Step } from '../../types/schemas';
import { MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StepRowProps {
    step: Step;
    onClick: () => void;
    className?: string;
}

export function StepRow({ step, onClick, className }: StepRowProps) {
    return (
        <div
            onClick={onClick}
            className={cn(
                "group flex items-center justify-between gap-3 px-4 py-3 rounded-lg border border-white/10",
                "bg-white/5 hover:bg-white/10 cursor-pointer transition-all",
                !step.enabled && "opacity-50",
                className
            )}
        >
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                    {step.title}
                </p>
                {step.description && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {step.description}
                    </p>
                )}
            </div>

            <button
                className="p-1 rounded-md hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                    e.stopPropagation();
                    onClick();
                }}
            >
                <MoreVertical className="h-4 w-4 text-muted-foreground" />
            </button>
        </div>
    );
}
