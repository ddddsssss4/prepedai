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

    // Generate button if plan is empty but we are ready
    if (!plan || !plan.phases || plan.phases.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 space-y-6">
                {blueprintStream.isStreaming ? (
                    <>
                        <Loader2 className="h-12 w-12 text-primary animate-spin" />
                        <div className="text-center space-y-2">
                            <h3 className="text-lg font-medium">Generating Execution Blueprint</h3>
                            <p className="text-muted-foreground max-w-md">
                                Analyzing architecture, database, and API designs to create a detailed implementation plan...
                            </p>
                        </div>
                    </>
                ) : (
                    <>
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
                    </>
                )}
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
