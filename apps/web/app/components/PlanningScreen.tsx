'use client';

import { useState } from 'react';
import { useAppStore } from '../store/appStore';
import { Button } from '@/components/ui/button';
import { PhaseCard } from './PhaseCard';
import { StepDetailDialog } from './StepDetailDialog';
import { ClarificationTab } from './ClarificationTab';
import { ArchitectureTab } from './ArchitectureTab';
import { Phase, Step } from '../types/schemas';
import { Zap, Layers, FileCode, ListChecks, Database, Server, Component, HelpCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mermaid } from './Mermaid';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function PlanningScreen() {
    const { plan, executePlanSteps, updateStepDescription, clarificationStatus } = useAppStore();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedPhase, setSelectedPhase] = useState<Phase | null>(null);
    const [selectedStep, setSelectedStep] = useState<Step | null>(null);

    // Default to clarification tab if clarifications are in progress
    const defaultTab = clarificationStatus === 'ready' || clarificationStatus === 'loading' ? 'clarification' : 'architecture';
    const [activeTab, setActiveTab] = useState(defaultTab);

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

            <Tabs defaultValue={defaultTab} className="flex-1 flex flex-col space-y-8" onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-5 bg-muted/20 backdrop-blur-sm p-1">
                    <TabsTrigger value="clarification" className="uppercase tracking-wider font-mono text-xs data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
                        <HelpCircle className="h-3 w-3 mr-1" /> Clarify
                    </TabsTrigger>
                    <TabsTrigger value="architecture" className="uppercase tracking-wider font-mono text-xs">Architecture</TabsTrigger>
                    <TabsTrigger value="database" className="uppercase tracking-wider font-mono text-xs">Database</TabsTrigger>
                    <TabsTrigger value="api" className="uppercase tracking-wider font-mono text-xs">API Design</TabsTrigger>
                    <TabsTrigger value="blueprint" className="uppercase tracking-wider font-mono text-xs data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Blueprint</TabsTrigger>
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
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 rounded-xl border border-white/10 bg-black/40 backdrop-blur-xl p-6 min-h-[400px]">
                            <div className="flex items-center space-x-2 mb-4">
                                <Database className="h-5 w-5 text-primary" />
                                <h3 className="text-lg font-semibold">Entity Relationship Diagram</h3>
                            </div>
                            {plan.database ? (
                                <Mermaid chart={plan.database.diagram} />
                            ) : <div>No Database Diagram</div>}
                        </div>
                        <div className="rounded-xl border border-white/10 bg-card p-0 overflow-hidden">
                            <div className="p-4 border-b border-white/10 bg-muted/20">
                                <h3 className="text-sm font-mono uppercase tracking-wider">Schema Definitions</h3>
                            </div>
                            <ScrollArea className="h-[400px] p-4">
                                <div className="space-y-6">
                                    {plan.database?.models.map((model, i) => (
                                        <div key={i} className="space-y-2">
                                            <div className="font-bold text-primary flex items-center">
                                                <Component className="h-4 w-4 mr-2 opacity-70" /> {model.name}
                                            </div>
                                            <div className="space-y-1 pl-6 border-l border-white/10 ml-2">
                                                {model.fields.map((field, j) => (
                                                    <div key={j} className="text-xs font-mono text-muted-foreground">{field}</div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                    </div>
                </TabsContent>

                {/* API TAB */}
                <TabsContent value="api" className="flex-1 focus-visible:ring-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {plan.api?.endpoints.map((ep, i) => (
                            <div key={i} className="group rounded-lg border border-white/5 bg-card/50 hover:bg-card hover:border-white/10 transition-all p-4 flex flex-col space-y-3">
                                <div className="flex items-center justify-between">
                                    <Badge variant={ep.method === 'POST' ? 'default' : ep.method === 'GET' ? 'outline' : 'destructive'}
                                        className={ep.method === 'GET' ? 'text-blue-400 border-blue-400/20 bg-blue-400/10' : ''}>
                                        {ep.method}
                                    </Badge>
                                    <span className="text-[10px] font-mono opacity-50">HTTP/1.1</span>
                                </div>
                                <code className="text-sm font-mono text-primary break-all">{ep.path}</code>
                                <p className="text-sm text-muted-foreground">{ep.description}</p>
                            </div>
                        ))}
                    </div>
                </TabsContent>

                {/* BLUEPRINT TAB (Legacy View) */}
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
                                <div className="text-5xl font-bold tracking-tight font-serif">{plan.phases.length}</div>
                                <div className="text-xs text-muted-foreground font-mono uppercase tracking-widest font-semibold">Phases</div>
                            </div>
                            <div className="space-y-2">
                                <div className="text-5xl font-bold tracking-tight font-serif">{totalSteps}</div>
                                <div className="text-xs text-muted-foreground font-mono uppercase tracking-widest font-semibold">Steps</div>
                            </div>
                            <div className="space-y-2">
                                <div className="text-5xl font-bold tracking-tight font-serif">{totalFiles || 23}</div>
                                <div className="text-xs text-muted-foreground font-mono uppercase tracking-widest font-semibold">Code Files</div>
                            </div>
                        </div>

                        <div className="flex justify-center pb-12">
                            <Button
                                size="lg"
                                className="w-full max-w-md h-16 text-lg font-semibold shadow-2xl shadow-primary/20 hover:shadow-primary/40 transition-all duration-500 bg-gradient-to-r from-primary to-primary/80 hover:scale-[1.02]"
                                onClick={executePlanSteps}
                            >
                                <Zap className="mr-2 h-5 w-5 fill-current" />
                                Execute Plan
                            </Button>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>

            <StepDetailDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                phase={selectedPhase}
                step={selectedStep}
                onSave={(stepId, description) => {
                    if (selectedPhase) {
                        updateStepDescription(selectedPhase.id, stepId, description);
                    }
                }}
            />
        </div>
    );
}
