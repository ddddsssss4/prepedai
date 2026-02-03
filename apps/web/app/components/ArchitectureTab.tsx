'use client';

import { useAppStore } from '../store/appStore';
import { Button } from '@/components/ui/button';
import {
    Layers,
    Loader2,
    ArrowRight,
    AlertTriangle,
    CheckCircle2,
    Target,
    AlertCircle,
    Lightbulb,
    Boxes,
    Workflow,
    Cpu,
    Scale
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Mermaid } from './Mermaid';
import { Components } from 'react-markdown';
import { sanitizeMarkdown, extractMermaid } from '../lib/markdownUtils';

// Custom markdown components for better styling
const markdownComponents: Partial<Components> = {
    h2: ({ children }) => (
        <h2 className="text-2xl font-bold mt-8 mb-4 text-foreground flex items-center gap-3 border-b border-white/10 pb-3">
            {getIconForHeading(String(children))}
            {children}
        </h2>
    ),
    h3: ({ children }) => (
        <h3 className="text-lg font-semibold mt-6 mb-3 text-primary/90">
            {children}
        </h3>
    ),
    h4: ({ children }) => (
        <h4 className="text-base font-medium mt-4 mb-2 text-foreground/80">
            {children}
        </h4>
    ),
    p: ({ children }) => (
        <p className="text-muted-foreground leading-relaxed mb-4">
            {children}
        </p>
    ),
    ul: ({ children }) => (
        <ul className="space-y-2 mb-4 ml-1">
            {children}
        </ul>
    ),
    li: ({ children }) => (
        <li className="flex items-start gap-2 text-muted-foreground">
            <span className="text-primary mt-1.5">•</span>
            <span>{children}</span>
        </li>
    ),
    strong: ({ children }) => (
        <strong className="text-foreground font-semibold">{children}</strong>
    ),
    table: ({ children }) => (
        <div className="overflow-x-auto my-4 rounded-lg border border-white/10">
            <table className="w-full text-sm">
                {children}
            </table>
        </div>
    ),
    thead: ({ children }) => (
        <thead className="bg-white/5 border-b border-white/10">
            {children}
        </thead>
    ),
    th: ({ children }) => (
        <th className="px-4 py-3 text-left font-semibold text-foreground">
            {children}
        </th>
    ),
    td: ({ children }) => (
        <td className="px-4 py-3 text-muted-foreground border-t border-white/5">
            {children}
        </td>
    ),
    code: ({ children, className }) => {
        const isInline = !className;
        if (isInline) {
            return (
                <code className="px-1.5 py-0.5 rounded bg-white/10 text-primary text-sm font-mono">
                    {children}
                </code>
            );
        }
        return (
            <code className={className}>{children}</code>
        );
    },
    pre: ({ children }) => (
        <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto mb-4 border border-white/10">
            {children}
        </pre>
    ),
};

function getIconForHeading(text: string) {
    const lower = text.toLowerCase();
    if (lower.includes('problem')) return <Target className="h-6 w-6 text-red-400" />;
    if (lower.includes('overview')) return <Layers className="h-6 w-6 text-blue-400" />;
    if (lower.includes('diagram')) return <Workflow className="h-6 w-6 text-purple-400" />;
    if (lower.includes('component')) return <Boxes className="h-6 w-6 text-green-400" />;
    if (lower.includes('data flow')) return <Workflow className="h-6 w-6 text-cyan-400" />;
    if (lower.includes('technology') || lower.includes('tech')) return <Cpu className="h-6 w-6 text-orange-400" />;
    if (lower.includes('trade')) return <Scale className="h-6 w-6 text-yellow-400" />;
    return <Lightbulb className="h-6 w-6 text-primary" />;
}

export function ArchitectureTab() {
    const {
        architectureStream,
        generationStep,
        clarificationStatus,
        streamArchitecture,
        streamDatabase
    } = useAppStore();

    const { isStreaming, content, error } = architectureStream;

    // Not ready yet
    if (generationStep === 'idle' || generationStep === 'clarify') {
        if (clarificationStatus === 'loading') {
            return (
                <div className="flex flex-col items-center justify-center py-24 space-y-6">
                    <Loader2 className="h-12 w-12 text-primary animate-spin" />
                    <p className="text-muted-foreground">Generating clarifying questions...</p>
                </div>
            );
        }

        return (
            <div className="flex flex-col items-center justify-center py-24 space-y-6">
                <Layers className="h-16 w-16 text-muted-foreground/30" />
                <p className="text-muted-foreground text-center">
                    Complete the Clarification step first to unlock Architecture design.
                </p>
            </div>
        );
    }

    // Streaming or has content
    if (isStreaming || content) {
        // Extract mermaid diagram if present
        const mermaidMatch = content.match(/```mermaid\s*([\s\S]*?)```/);
        const mermaidCode = mermaidMatch ? mermaidMatch[1].trim() : null;
        const contentWithoutMermaid = content.replace(/```mermaid[\s\S]*?```/g, '');

        // Debug logging
        console.log('[ArchitectureTab] Streaming content length:', content.length);
        console.log('[ArchitectureTab] Mermaid match found:', !!mermaidMatch);
        if (mermaidCode) {
            console.log('[ArchitectureTab] Mermaid code:', mermaidCode.substring(0, 100) + '...');
        }

        const isComplete = !isStreaming && content.length > 0;

        return (
            <div className="space-y-6">
                {/* Streaming indicator */}
                {isStreaming && (
                    <div className="flex items-center gap-2 text-primary animate-pulse bg-primary/5 border border-primary/20 rounded-lg px-4 py-3">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm font-mono">Generating architecture design...</span>
                    </div>
                )}

                {/* Error display */}
                {error && (
                    <div className="flex items-center gap-2 text-red-500 bg-red-500/10 p-4 rounded-lg border border-red-500/20">
                        <AlertTriangle className="h-4 w-4" />
                        <span>{error}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main content area */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Diagram - Glassmorphism card */}
                        {mermaidCode && (
                            <div className="rounded-xl border border-white/10 bg-gradient-to-br from-purple-500/5 via-black/40 to-blue-500/5 backdrop-blur-xl p-6 shadow-xl">
                                <div className="flex items-center gap-3 mb-4">
                                    <Workflow className="h-5 w-5 text-purple-400" />
                                    <h3 className="text-lg font-semibold">System Diagram</h3>
                                </div>
                                <Mermaid chart={mermaidCode} />
                            </div>
                        )}

                        {/* Architecture details - Styled card */}
                        <div className="rounded-xl border border-white/10 bg-gradient-to-br from-white/5 via-card/80 to-white/5 backdrop-blur-sm p-8 shadow-lg">
                            <div className="prose prose-invert prose-sm max-w-none">
                                <ReactMarkdown components={markdownComponents}>
                                    {sanitizeMarkdown(contentWithoutMermaid)}
                                </ReactMarkdown>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Status card */}
                        <div className="rounded-xl border border-white/10 bg-gradient-to-br from-green-500/5 to-transparent p-6">
                            <h3 className="text-sm font-mono uppercase tracking-wider text-muted-foreground mb-4">Status</h3>
                            <div className="flex items-center gap-2">
                                {isComplete ? (
                                    <>
                                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                                        <span className="text-green-500 font-medium">Architecture Complete</span>
                                    </>
                                ) : (
                                    <>
                                        <Loader2 className="h-5 w-5 text-primary animate-spin" />
                                        <span className="text-primary">Generating...</span>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Next step */}
                        {isComplete && (
                            <div className="rounded-xl border border-primary/30 bg-gradient-to-br from-primary/10 to-purple-500/5 p-6">
                                <h3 className="text-sm font-mono uppercase tracking-wider text-primary mb-4">Next Step</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Architecture is complete. Proceed to Database design.
                                </p>
                                <Button
                                    onClick={streamDatabase}
                                    className="w-full gap-2"
                                >
                                    Generate Database
                                    <ArrowRight className="h-4 w-4" />
                                </Button>
                            </div>
                        )}

                        {/* Tips card */}
                        <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                            <div className="flex items-center gap-2 mb-3">
                                <AlertCircle className="h-4 w-4 text-blue-400" />
                                <h3 className="text-sm font-semibold">Tips</h3>
                            </div>
                            <ul className="text-xs text-muted-foreground space-y-2">
                                <li>• Review the architecture before proceeding</li>
                                <li>• Check if all components are covered</li>
                                <li>• Verify the technology choices fit your needs</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Waiting state
    return (
        <div className="flex flex-col items-center justify-center py-24 space-y-6">
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
            <p className="text-muted-foreground">Preparing architecture design...</p>
        </div>
    );
}
