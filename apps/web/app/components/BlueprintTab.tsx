'use client';

import { useState } from 'react';
import { useAppStore } from '../store/appStore';
import { Phase, Step, CodingAgent } from '../types/schemas';
import { PhaseSection } from './blueprint/PhaseSection';
import { StepDetailDialog } from './StepDetailDialog';
import { Button } from '@/components/ui/button';
import { Loader2, ListChecks } from 'lucide-react';

export function BlueprintTab() {
    const {
        plan,
        generationStep,
        updatePhaseAgent,
        addStepToPhase,
        deleteStep,
        updateStepDetails,
        blueprintStream,
        streamBlueprint
    } = useAppStore();

    const [selectedStep, setSelectedStep] = useState<Step | null>(null);
    const [selectedPhase, setSelectedPhase] = useState<Phase | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Handler for agent change
    const handleAgentChange = (phaseId: string, agent: CodingAgent) => {
        updatePhaseAgent(phaseId, agent);
    };

    // Handler for adding step
    const handleAddStep = (phaseId: string) => {
        addStepToPhase(phaseId, "New Custom Step");
    };

    // Handler for step click
    const handleStepClick = (phase: Phase, step: Step) => {
        setSelectedPhase(phase);
        setSelectedStep(step);
        setIsDialogOpen(true);
    };

    const handleSaveStep = (stepId: string, description: string) => {
        if (selectedPhase) {
            updateStepDetails(selectedPhase.id, stepId, description);
        }
    };

    const handleDeleteStep = (stepId: string) => {
        if (selectedPhase) {
            deleteStep(selectedPhase.id, stepId);
        }
    };

    // Not ready yet
    if (generationStep !== 'complete' || !plan) {
        return (
            <div className="flex flex-col items-center justify-center py-24 space-y-6">
                <ListChecks className="h-16 w-16 text-muted-foreground/30" />
                <p className="text-muted-foreground text-center">
                    Complete the API Design step to unlock the Blueprint.
                </p>
            </div>
        );
    }

    // Streaming state - show real-time content like other layers
    if (blueprintStream.isStreaming || (blueprintStream.content && (!plan?.phases?.length))) {
        return (
            <div className="space-y-6">
                {/* Streaming indicator */}
                <div className="flex items-center gap-2 text-primary animate-pulse bg-primary/5 border border-primary/20 rounded-lg px-4 py-3">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm font-mono">
                        {blueprintStream.isStreaming ? 'Generating execution blueprint...' : 'Parsing blueprint...'}
                    </span>
                </div>

                {/* Error display */}
                {blueprintStream.error && (
                    <div className="flex items-center gap-2 text-red-500 bg-red-500/10 p-4 rounded-lg border border-red-500/20">
                        <span>⚠️ {blueprintStream.error}</span>
                    </div>
                )}

                {/* Show streaming content in real-time */}
                {blueprintStream.content && (
                    <div className="rounded-xl border border-neutral-200 dark:border-white/10 bg-gradient-to-br from-white/5 via-card/80 to-white/5 backdrop-blur-sm p-6 shadow-lg">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <ListChecks className="h-5 w-5 text-primary" />
                            Blueprint Output
                        </h3>
                        <pre className="text-sm text-muted-foreground font-mono whitespace-pre-wrap bg-black/20 p-4 rounded-lg max-h-[500px] overflow-auto">
                            {blueprintStream.content}
                        </pre>
                    </div>
                )}
            </div>
        );
    }

    // Generate button if plan is empty but we are ready
    if (!plan || !plan.phases || plan.phases.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 space-y-6">
                <ListChecks className="h-16 w-16 text-muted-foreground/30" />
                <div className="text-center space-y-4">
                    <div>
                        <h3 className="text-lg font-medium">Ready to Plan</h3>
                        <p className="text-muted-foreground max-w-md mt-2">
                            Your architecture and designs are ready. Generate a step-by-step execution blueprint to start building.
                        </p>
                    </div>
                    <Button
                        onClick={() => streamBlueprint()}
                        size="lg"
                        className="font-semibold"
                    >
                        Generate Blueprint
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="space-y-2">
                <h2 className="text-2xl font-bold">Execution Blueprint</h2>
                <p className="text-muted-foreground">
                    Assign AI agents to each phase and customize steps before execution.
                </p>
            </div>

            {/* Phase Sections */}
            <div className="space-y-4">
                {plan.phases.map((phase, index) => (
                    <PhaseSection
                        key={phase.id}
                        phase={phase}
                        index={index}
                        onStepClick={(step) => handleStepClick(phase, step)}
                        onAgentChange={handleAgentChange}
                        onAddStep={handleAddStep}
                    />
                ))}
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto text-center pt-8 border-t border-white/5">
                <div className="space-y-1">
                    <div className="text-3xl font-bold">{plan.phases.length}</div>
                    <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Phases</div>
                </div>
                <div className="space-y-1">
                    <div className="text-3xl font-bold">
                        {plan.phases.reduce((sum, p) => sum + p.steps.length, 0)}
                    </div>
                    <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Steps</div>
                </div>
                <div className="space-y-1">
                    <div className="text-3xl font-bold">
                        {plan.phases.reduce((sum, p) => sum + (p.filesInvolved?.length || 0), 0)}
                    </div>
                    <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Files</div>
                </div>
            </div>

            {/* Step Detail Dialog */}
            <StepDetailDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                step={selectedStep}
                phase={selectedPhase}
                onSave={handleSaveStep}
                onDelete={handleDeleteStep}
            />
        </div>
    );
}
