'use client';

import { useAppStore } from '../store/appStore';
import { Button } from '@/components/ui/button';
import { PhaseCard } from './PhaseCard';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, CheckCircle2, XCircle, Clock, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export default function ExecutionScreen() {
    const { plan, isExecuting, executionProgress, reset } = useAppStore();

    if (!plan) return null;

    const totalSteps = plan.phases.reduce(
        (acc, phase) => acc + phase.steps.filter(s => s.enabled).length,
        0
    );

    const completedSteps = plan.phases.reduce(
        (acc, phase) => acc + phase.steps.filter(s => s.enabled && s.status === 'completed').length,
        0
    );

    const failedSteps = plan.phases.reduce(
        (acc, phase) => acc + phase.steps.filter(s => s.enabled && s.status === 'error').length,
        0
    );

    const isComplete = !isExecuting && (completedSteps + failedSteps) === totalSteps;
    const hasErrors = failedSteps > 0;

    return (
        <div className="container max-w-5xl mx-auto px-4 py-8 animate-in fade-in duration-500 pb-24">
            <div className="mb-12 space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-4xl font-bold tracking-tight">
                                {isExecuting ? 'Executing Plan...' : isComplete ? 'Execution Complete' : 'Execution Logic'}
                            </h1>
                            {isExecuting && <Badge className="animate-pulse bg-blue-500">RUNNING</Badge>}
                        </div>
                        <p className="text-muted-foreground text-lg">
                            {isExecuting
                                ? 'Orchestrating agents to complete your tasks...'
                                : isComplete
                                    ? hasErrors
                                        ? 'Process finished with some errors to review.'
                                        : 'All tasks completed successfully.'
                                    : 'Ready to execute.'}
                        </p>
                    </div>
                    {isComplete && (
                        <Button
                            variant="default"
                            size="lg"
                            onClick={reset}
                            className="shadow-lg animate-in fade-in zoom-in"
                        >
                            <RotateCcw className="mr-2 h-4 w-4" /> Start New Plan
                        </Button>
                    )}
                </div>

                <Card className="border-2 shadow-md bg-card/50 backdrop-blur">
                    <CardContent className="p-8 space-y-8">
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm font-mono uppercase tracking-wider font-semibold">
                                <span>Total Progress</span>
                                <span>{Math.round(executionProgress)}%</span>
                            </div>
                            <Progress value={executionProgress} className="h-4 border border-border" />
                        </div>

                        <div className="grid grid-cols-3 gap-8">
                            <div className="flex items-center gap-4 p-4 border border-emerald-900/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400">
                                <CheckCircle2 className="h-8 w-8" />
                                <div>
                                    <div className="text-3xl font-bold font-mono">{completedSteps}</div>
                                    <div className="text-xs uppercase tracking-wider font-semibold opacity-80">Completed</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-4 border border-destructive/20 bg-destructive/5 text-destructive">
                                <XCircle className="h-8 w-8" />
                                <div>
                                    <div className="text-3xl font-bold font-mono">{failedSteps}</div>
                                    <div className="text-xs uppercase tracking-wider font-semibold opacity-80">Failed</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-4 border border-primary/20 bg-primary/5 text-primary">
                                <Clock className="h-8 w-8" />
                                <div>
                                    <div className="text-3xl font-bold font-mono">{totalSteps - completedSteps - failedSteps}</div>
                                    <div className="text-xs uppercase tracking-wider font-semibold opacity-80">Remaining</div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-6">
                {plan.phases.map((phase, index) => (
                    <PhaseCard
                        key={phase.id}
                        phase={phase}
                        index={index}
                        canMoveUp={false}
                        canMoveDown={false}
                        onMoveUp={() => { }}
                        onMoveDown={() => { }}
                    />
                ))}
            </div>
        </div>
    );
}
