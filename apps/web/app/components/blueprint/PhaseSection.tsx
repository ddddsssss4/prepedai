'use client';

import { useState } from 'react';
import { Phase, Step, CodingAgent } from '../../types/schemas';
import { StepRow } from './StepRow';
import { AgentSelector } from './AgentSelector';
import { Plus, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PhaseSectionProps {
    phase: Phase;
    index: number;
    onStepClick: (step: Step) => void;
    onAgentChange: (phaseId: string, agent: CodingAgent) => void;
    onAddStep: (phaseId: string) => void;
}

export function PhaseSection({
    phase,
    index,
    onStepClick,
    onAgentChange,
    onAddStep
}: PhaseSectionProps) {
    const [isExpanded, setIsExpanded] = useState(true);

    return (
        <div className="rounded-xl border border-white/10 bg-card/40 backdrop-blur-sm overflow-hidden">
            {/* Phase Header */}
            <div
                className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-primary/5 to-transparent cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-3">
                    {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                    <div>
                        <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                            Phase {index + 1}
                        </span>
                        <h3 className="text-lg font-semibold text-foreground">
                            {phase.name}
                        </h3>
                    </div>
                </div>

                <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                    {/* Add Step Button */}
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => onAddStep(phase.id)}
                    >
                        <Plus className="h-4 w-4" />
                    </Button>

                    {/* Agent Selector */}
                    <AgentSelector
                        value={phase.assignedAgent}
                        onChange={(agent) => onAgentChange(phase.id, agent)}
                    />
                </div>
            </div>

            {/* Steps List */}
            {isExpanded && (
                <div className="px-5 pb-5 space-y-2">
                    {phase.steps.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground text-sm">
                            No steps yet. Click the + button to add one.
                        </div>
                    ) : (
                        phase.steps.map((step) => (
                            <StepRow
                                key={step.id}
                                step={step}
                                onClick={() => onStepClick(step)}
                            />
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
