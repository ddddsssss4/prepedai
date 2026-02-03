'use client';

import { useState } from 'react';
import { Phase } from '../types/schemas';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Settings, Save, FileCode, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface PhaseCardProps {
    phase: Phase;
    index: number;
    onClick?: () => void;
    onStepClick?: (stepId: string) => void;
}

export function PhaseCard({
    phase,
    index,
    onClick,
    onStepClick
}: PhaseCardProps) {
    const enabledSteps = phase.steps.filter(s => s.enabled).length;
    const totalSteps = phase.steps.length;
    const progress = (enabledSteps / totalSteps) * 100;

    const getRiskColor = (risk: string) => {
        switch (risk) {
            case 'high': return 'destructive';
            case 'medium': return 'warning';
            case 'low': return 'success';
            default: return 'outline';
        }
    };

    return (
        <Card
            className="group relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:bg-card/95 cursor-pointer h-[240px] flex flex-col justify-between border-white/10 bg-card/40 backdrop-blur-md"
            onClick={onClick}
        >
            <CardHeader className="p-6 pb-2 space-y-0">
                <div className="flex items-start justify-between mb-4">
                    {/* Decorative Icons */}
                    <div className="flex items-center gap-3 text-muted-foreground/50">
                        <Settings className="h-5 w-5" />
                        <FileCode className="h-5 w-5" />
                        <Save className="h-5 w-5" />
                    </div>

                    <Badge variant={getRiskColor(phase.risk)} className="uppercase tracking-wider font-mono text-[10px] h-6">
                        {phase.risk}
                    </Badge>
                </div>

                <div className="space-y-1">
                    <div className="text-sm font-bold text-muted-foreground uppercase tracking-widest opacity-70 font-mono">
                        Phase {index + 1}:
                    </div>
                    <h3 className="text-xl font-bold tracking-tight text-foreground leading-tight group-hover:text-primary transition-colors">
                        {phase.name}
                    </h3>
                </div>
            </CardHeader>

            <CardContent className="p-6 pt-0">
                <div className="space-y-4">
                    {/* Progress Bar Visual */}
                    <div className="space-y-2">
                        <Progress value={progress} className="h-1.5 bg-muted/20" indicatorClassName={cn(
                            phase.risk === 'high' ? 'bg-destructive' : 'bg-primary'
                        )} />
                    </div>

                    {/* Step Triggers */}
                    <div className="grid grid-cols-5 gap-2 pt-2">
                        {phase.steps.map((step, i) => (
                            <div
                                key={step.id}
                                className="group/step relative cursor-pointer"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onStepClick?.(step.id);
                                }}
                            >
                                <div className={cn(
                                    "h-8 w-full rounded-md border border-white/5 flex items-center justify-center transition-all bg-muted/30 hover:bg-muted/60",
                                    step.enabled ? "opacity-100" : "opacity-30"
                                )}>
                                    {/* Icon based on step type or just generic */}
                                    <FileCode className="h-4 w-4 text-muted-foreground group-hover/step:text-primary transition-colors" />
                                </div>
                                {/* Tooltip for step id */}
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-[10px] px-2 py-1 rounded border opacity-0 group-hover/step:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                    {step.id}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Hover Reveal Arrow */}
                <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                        <ArrowRight className="h-4 w-4" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
