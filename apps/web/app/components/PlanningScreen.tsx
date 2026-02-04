'use client';

import { useState } from 'react';
import { useAppStore, GenerationStep } from '../store/appStore';
import { ClarificationTab } from './ClarificationTab';
import { ArchitectureTab } from './ArchitectureTab';
import { DatabaseTab } from './DatabaseTab';
import { ApiTab } from './ApiTab';
import { BlueprintTab } from './BlueprintTab';
import { HelpCircle, Layers, Database, Server, ListChecks, Lock } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Define tab order for progressive unlock
const TAB_ORDER: GenerationStep[] = ['clarify', 'architecture', 'database', 'api', 'complete'];

function isTabUnlocked(tabStep: GenerationStep, currentStep: GenerationStep): boolean {
    const currentIndex = TAB_ORDER.indexOf(currentStep);
    const tabIndex = TAB_ORDER.indexOf(tabStep);
    return tabIndex <= currentIndex;
}

export default function PlanningScreen() {
    // Use global active tab state for auto-switching
    const { activeTab, setActiveTab, generationStep } = useAppStore();



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

            <Tabs value={activeTab} className="flex-1 flex flex-col space-y-8" onValueChange={setActiveTab}>
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
                    <BlueprintTab />
                </TabsContent>
            </Tabs>
        </div>
    );
}
