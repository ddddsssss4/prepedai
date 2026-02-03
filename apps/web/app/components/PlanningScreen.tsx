'use client';

import { useState } from 'react';
import { useAppStore, GenerationStep } from '../store/appStore';
import { Button } from '@/components/ui/button';
import { PhaseCard } from './PhaseCard';
import { StepDetailDialog } from './StepDetailDialog';
import { ClarificationTab } from './ClarificationTab';
import { ArchitectureTab } from './ArchitectureTab';
import { DatabaseTab } from './DatabaseTab';
import { ApiTab } from './ApiTab';
import { Phase, Step } from '../types/schemas';
import { Zap, HelpCircle, Layers, Database, Server, ListChecks, Lock } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Define tab order for progressive unlock
const TAB_ORDER: GenerationStep[] = ['clarify', 'architecture', 'database', 'api', 'complete'];

function isTabUnlocked(tabStep: GenerationStep, currentStep: GenerationStep): boolean {
    const currentIndex = TAB_ORDER.indexOf(currentStep);
    const tabIndex = TAB_ORDER.indexOf(tabStep);
    return tabIndex <= currentIndex;
}

export default function PlanningScreen() {
    const { plan, executePlanSteps, clarificationStatus, generationStep } = useAppStore();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedPhase, setSelectedPhase] = useState<Phase | null>(null);
    const [selectedStep, setSelectedStep] = useState<Step | null>(null);

    // Default to clarification tab
    const [activeTab, setActiveTab] = useState('clarification');

    if (!plan) return null;

    const totalSteps = plan.phases.reduce((acc, phase) => acc + phase.steps.length, 0);
    const totalFiles = plan.phases.reduce((acc, phase) => acc + (phase.filesInvolved?.length || 0), 0);

    return (
        <div className="flex flex-col min-h-[calc(100vh-100px)] w-full max-w-7xl mx-auto px-6 py-8">
            {/* Header */}
            <div className="mb-8 space-y-2">
                <div className="flex items-center space-x-2 text-primary font-mono text-sm uppercase tracking-widest opacity-80">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                    <span>Engineering Design</span>
                </div>
                <h1 className="text-5xl font-bold tracking-tight leading-tight">
                    <span className="text-foreground">System</span>{' '}
                    <span className="text-muted-foreground">Architecture & Plan</span>
                </h1>
            </div>

            <Tabs defaultValue="clarification" className="flex-1 flex flex-col space-y-8" onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-5 bg-muted/20 backdrop-blur-sm p-1">
                    <TabsTrigger
                        value="clarification"
                        className="uppercase tracking-wider font-mono text-xs data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400"
                    >
                        <HelpCircle className="h-3 w-3 mr-1" /> Clarify
                    </TabsTrigger>
                    <TabsTrigger
                        value="architecture"
                        disabled={!isTabUnlocked('architecture', generationStep)}
                        className="uppercase tracking-wider font-mono text-xs disabled:opacity-40"
                    >
                        {!isTabUnlocked('architecture', generationStep) && <Lock className="h-3 w-3 mr-1" />}
                        <Layers className="h-3 w-3 mr-1" /> Architecture
                    </TabsTrigger>
                    <TabsTrigger
                        value="database"
                        disabled={!isTabUnlocked('database', generationStep)}
                        className="uppercase tracking-wider font-mono text-xs disabled:opacity-40"
                    >
                        {!isTabUnlocked('database', generationStep) && <Lock className="h-3 w-3 mr-1" />}
                        <Database className="h-3 w-3 mr-1" /> Database
                    </TabsTrigger>
                    <TabsTrigger
                        value="api"
                        disabled={!isTabUnlocked('api', generationStep)}
                        className="uppercase tracking-wider font-mono text-xs disabled:opacity-40"
                    >
                        {!isTabUnlocked('api', generationStep) && <Lock className="h-3 w-3 mr-1" />}
                        <Server className="h-3 w-3 mr-1" /> API Design
                    </TabsTrigger>
                    <TabsTrigger
                        value="blueprint"
                        disabled={generationStep !== 'complete'}
                        className="uppercase tracking-wider font-mono text-xs data-[state=active]:bg-primary/20 data-[state=active]:text-primary disabled:opacity-40"
                    >
                        {generationStep !== 'complete' && <Lock className="h-3 w-3 mr-1" />}
                        <ListChecks className="h-3 w-3 mr-1" /> Blueprint
                    </TabsTrigger>
                </TabsList>

                {/* CLARIFICATION TAB */}
                <TabsContent value="clarification" className="flex-1 focus-visible:ring-0">
                    <ClarificationTab />
                </TabsContent>

                {/* ARCHITECTURE TAB */}
                <TabsContent value="architecture" className="flex-1 space-y-6 focus-visible:ring-0">
                    <ArchitectureTab />
                </TabsContent>

                {/* DATABASE TAB */}
                <TabsContent value="database" className="flex-1 space-y-6 focus-visible:ring-0">
                    <DatabaseTab />
                </TabsContent>

                {/* API TAB */}
                <TabsContent value="api" className="flex-1 focus-visible:ring-0">
                    <ApiTab />
                </TabsContent>

                {/* BLUEPRINT TAB */}
                <TabsContent value="blueprint" className="space-y-8 focus-visible:ring-0">
                    {/* Main Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                        {plan.phases.map((phase, index) => (
                            <PhaseCard
                                key={phase.id}
                                phase={phase}
                                index={index}
                                onStepClick={(stepId) => {
                                    setSelectedPhase(phase);
                                    setSelectedStep(phase.steps.find(s => s.id === stepId) || null);
                                    setIsDialogOpen(true);
                                }}
                            />
                        ))}
                    </div>

                    {/* Footer Stats & Action */}
                    <div className="mt-auto space-y-12">
                        <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto text-center border-t border-white/5 pt-12">
                            <div className="space-y-2">
                                <div className="text-4xl font-bold">{plan.phases.length}</div>
                                <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Phases</div>
                            </div>
                            <div className="space-y-2">
                                <div className="text-4xl font-bold">{totalSteps}</div>
                                <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Steps</div>
                            </div>
                            <div className="space-y-2">
                                <div className="text-4xl font-bold">{totalFiles}</div>
                                <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Files</div>
                            </div>
                        </div>

                        <div className="flex justify-center">
                            <Button
                                size="lg"
                                className="group text-lg font-semibold gap-3 px-10 py-6 rounded-full bg-gradient-to-r from-primary via-purple-500 to-primary hover:shadow-[0_0_40px_rgba(var(--primary-rgb),0.4)] transition-all duration-300"
                                onClick={executePlanSteps}
                            >
                                <Zap className="h-5 w-5 group-hover:animate-pulse" />
                                Execute Full Blueprint
                            </Button>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>

            <StepDetailDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                step={selectedStep}
                phase={selectedPhase}
            />
        </div>
    );
}
