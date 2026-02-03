'use client';

import { useAppStore } from '../store/appStore';
import { Mermaid } from './Mermaid';
import { Badge } from '@/components/ui/badge';
import {
    Lightbulb,
    Layers,
    ArrowRight,
    Cpu,
    Scale,
    AlertTriangle,
    CheckCircle,
    XCircle,
    RefreshCw,
    Loader2
} from 'lucide-react';

interface ArchitectureData {
    problem_understanding?: {
        core_problem: string;
        key_challenges: string[];
        assumptions: string[];
    };
    overview?: {
        summary: string;
        architecture_style: string;
        key_principles: string[];
    };
    components?: {
        name: string;
        purpose: string;
        justification: string;
        technologies: string[];
    }[];
    data_flow?: {
        description: string;
        steps: string[];
    };
    technology_choices?: {
        category: string;
        choice: string;
        reasoning: string;
    }[];
    tradeoffs?: {
        decision: string;
        benefit: string;
        cost: string;
        alternative: string;
    }[];
    mermaid_diagram?: string;
    // Legacy fields
    diagram?: string;
    patterns?: string[];
}

export function ArchitectureTab() {
    const { plan, clarificationStatus, clarificationError } = useAppStore();

    // Get architecture data - handle both new and legacy formats
    const arch = plan?.architecture as unknown as ArchitectureData | undefined;
    const diagram = arch?.mermaid_diagram || arch?.diagram || '';

    // Check if we're still loading or have an error
    if (clarificationStatus === 'loading') {
        return (
            <div className="flex flex-col items-center justify-center py-24 space-y-6">
                <Loader2 className="h-12 w-12 text-primary animate-spin" />
                <p className="text-muted-foreground font-mono text-sm animate-pulse">
                    Generating architecture design...
                </p>
            </div>
        );
    }

    if (!arch || (!arch.overview && !arch.diagram)) {
        return (
            <div className="flex flex-col items-center justify-center py-24 space-y-6">
                <Layers className="h-16 w-16 text-muted-foreground/50" />
                <div className="text-center space-y-2">
                    <p className="text-foreground text-xl font-semibold">No Architecture Yet</p>
                    <p className="text-muted-foreground max-w-md">
                        Complete the clarification questions first to generate the architecture design.
                    </p>
                </div>
                {clarificationError && (
                    <div className="text-amber-500 text-sm bg-amber-500/10 p-4 rounded-lg max-w-md">
                        <AlertTriangle className="h-4 w-4 inline mr-2" />
                        {clarificationError}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Problem Understanding Section */}
            {arch.problem_understanding && (
                <section className="rounded-xl border border-white/10 bg-card/50 backdrop-blur-sm p-6">
                    <div className="flex items-center space-x-2 mb-4">
                        <Lightbulb className="h-5 w-5 text-amber-500" />
                        <h2 className="text-xl font-bold">Problem Understanding</h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <h3 className="text-sm font-mono uppercase tracking-wider text-muted-foreground mb-2">Core Problem</h3>
                            <p className="text-foreground">{arch.problem_understanding.core_problem}</p>
                        </div>

                        {arch.problem_understanding.key_challenges?.length > 0 && (
                            <div>
                                <h3 className="text-sm font-mono uppercase tracking-wider text-muted-foreground mb-2">Key Challenges</h3>
                                <ul className="space-y-2">
                                    {arch.problem_understanding.key_challenges.map((challenge, i) => (
                                        <li key={i} className="flex items-start text-foreground/80">
                                            <span className="mr-3 text-amber-500">•</span>
                                            {challenge}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {arch.problem_understanding.assumptions?.length > 0 && (
                            <div>
                                <h3 className="text-sm font-mono uppercase tracking-wider text-muted-foreground mb-2">Assumptions</h3>
                                <div className="flex flex-wrap gap-2">
                                    {arch.problem_understanding.assumptions.map((assumption, i) => (
                                        <Badge key={i} variant="outline" className="text-sm py-1 px-3 border-white/10">
                                            {assumption}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* Architecture Overview Section */}
            {arch.overview && (
                <section className="rounded-xl border border-white/10 bg-card/50 backdrop-blur-sm p-6">
                    <div className="flex items-center space-x-2 mb-4">
                        <Layers className="h-5 w-5 text-primary" />
                        <h2 className="text-xl font-bold">Architecture Overview</h2>
                        {arch.overview.architecture_style && (
                            <Badge className="ml-auto bg-primary/20 text-primary border-0">
                                {arch.overview.architecture_style}
                            </Badge>
                        )}
                    </div>

                    <p className="text-foreground/90 mb-4">{arch.overview.summary}</p>

                    {arch.overview.key_principles?.length > 0 && (
                        <div>
                            <h3 className="text-sm font-mono uppercase tracking-wider text-muted-foreground mb-2">Key Principles</h3>
                            <div className="flex flex-wrap gap-2">
                                {arch.overview.key_principles.map((principle, i) => (
                                    <Badge key={i} variant="secondary" className="text-sm py-1 px-3">
                                        {principle}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}
                </section>
            )}

            {/* Visual Diagram */}
            {diagram && (
                <section className="rounded-xl border border-white/10 bg-black/40 backdrop-blur-xl p-6">
                    <div className="flex items-center space-x-2 mb-4">
                        <RefreshCw className="h-5 w-5 text-blue-500" />
                        <h2 className="text-xl font-bold">System Diagram</h2>
                    </div>
                    <Mermaid chart={diagram} className="w-full" />
                </section>
            )}

            {/* Components Section */}
            {arch.components && arch.components.length > 0 && (
                <section className="rounded-xl border border-white/10 bg-card/50 backdrop-blur-sm p-6">
                    <div className="flex items-center space-x-2 mb-6">
                        <Cpu className="h-5 w-5 text-green-500" />
                        <h2 className="text-xl font-bold">Component Breakdown</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {arch.components.map((component, i) => (
                            <div key={i} className="rounded-lg border border-white/5 bg-black/20 p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold text-foreground">{component.name}</h3>
                                    <div className="flex gap-1">
                                        {component.technologies?.map((tech, j) => (
                                            <Badge key={j} variant="outline" className="text-xs border-white/10">
                                                {tech}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground">{component.purpose}</p>
                                <div className="text-sm text-foreground/70 border-l-2 border-primary/50 pl-3 italic">
                                    <span className="text-primary font-medium">Why: </span>
                                    {component.justification}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Data Flow Section */}
            {arch.data_flow && (
                <section className="rounded-xl border border-white/10 bg-card/50 backdrop-blur-sm p-6">
                    <div className="flex items-center space-x-2 mb-4">
                        <ArrowRight className="h-5 w-5 text-cyan-500" />
                        <h2 className="text-xl font-bold">Data Flow</h2>
                    </div>

                    <p className="text-foreground/90 mb-4">{arch.data_flow.description}</p>

                    {arch.data_flow.steps?.length > 0 && (
                        <div className="space-y-2">
                            {arch.data_flow.steps.map((step, i) => (
                                <div key={i} className="flex items-start text-sm">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-500 flex items-center justify-center text-xs font-bold mr-3">
                                        {i + 1}
                                    </span>
                                    <span className="text-foreground/80 pt-0.5">{step}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            )}

            {/* Technology Choices Section */}
            {arch.technology_choices && arch.technology_choices.length > 0 && (
                <section className="rounded-xl border border-white/10 bg-card/50 backdrop-blur-sm p-6">
                    <div className="flex items-center space-x-2 mb-6">
                        <Cpu className="h-5 w-5 text-purple-500" />
                        <h2 className="text-xl font-bold">Technology Choices</h2>
                    </div>

                    <div className="space-y-4">
                        {arch.technology_choices.map((tech, i) => (
                            <div key={i} className="flex items-start space-x-4 p-3 rounded-lg bg-black/20">
                                <Badge variant="outline" className="flex-shrink-0 border-purple-500/50 text-purple-400">
                                    {tech.category}
                                </Badge>
                                <div className="flex-1">
                                    <div className="font-semibold text-foreground">{tech.choice}</div>
                                    <div className="text-sm text-muted-foreground mt-1">{tech.reasoning}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Trade-offs Section */}
            {arch.tradeoffs && arch.tradeoffs.length > 0 && (
                <section className="rounded-xl border border-white/10 bg-card/50 backdrop-blur-sm p-6">
                    <div className="flex items-center space-x-2 mb-6">
                        <Scale className="h-5 w-5 text-orange-500" />
                        <h2 className="text-xl font-bold">Trade-offs & Decisions</h2>
                    </div>

                    <div className="space-y-4">
                        {arch.tradeoffs.map((tradeoff, i) => (
                            <div key={i} className="rounded-lg border border-white/5 bg-black/20 p-4 space-y-3">
                                <h3 className="font-semibold text-foreground">{tradeoff.decision}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                                    <div className="flex items-start space-x-2">
                                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <div className="text-green-500 font-medium">Benefit</div>
                                            <div className="text-foreground/70">{tradeoff.benefit}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-2">
                                        <XCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <div className="text-red-500 font-medium">Cost</div>
                                            <div className="text-foreground/70">{tradeoff.cost}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-2">
                                        <RefreshCw className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <div className="text-blue-500 font-medium">Alternative</div>
                                            <div className="text-foreground/70">{tradeoff.alternative}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Legacy patterns display (fallback for old format) */}
            {arch.patterns && arch.patterns.length > 0 && !arch.components && (
                <section className="rounded-xl border border-white/10 bg-card/50 backdrop-blur-sm p-6">
                    <h2 className="text-xl font-bold mb-4">Design Patterns</h2>
                    <div className="flex flex-wrap gap-2">
                        {arch.patterns.map((pattern, i) => (
                            <Badge key={i} variant="outline" className="text-sm py-1 px-3 border-white/10">
                                {pattern}
                            </Badge>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
