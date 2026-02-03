'use client';

import { useAppStore } from '../store/appStore';
import { Button } from '@/components/ui/button';
import {
    Layers,
    Loader2,
    ArrowRight,
    AlertTriangle,
    CheckCircle2
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Mermaid } from './Mermaid';

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

        const isComplete = !isStreaming && content.length > 0;

        return (
            <div className="space-y-6">
                {/* Streaming indicator */}
                {isStreaming && (
                    <div className="flex items-center gap-2 text-primary animate-pulse">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm font-mono">Generating architecture design...</span>
                    </div>
                )}

                {/* Error display */}
                {error && (
                    <div className="flex items-center gap-2 text-red-500 bg-red-500/10 p-4 rounded-lg">
                        <AlertTriangle className="h-4 w-4" />
                        <span>{error}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main content area */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Diagram */}
                        {mermaidCode && (
                            <div className="rounded-xl border border-white/10 bg-black/40 backdrop-blur-xl p-6">
                                <h3 className="text-lg font-semibold mb-4">System Diagram</h3>
                                <Mermaid chart={mermaidCode} />
                            </div>
                        )}

                        {/* Architecture details */}
                        <div className="rounded-xl border border-white/10 bg-card/50 p-6 overflow-auto max-h-[500px]">
                            <h3 className="text-lg font-semibold mb-4">Architecture Details</h3>
                            <div className="prose prose-invert prose-sm max-w-none">
                                <ReactMarkdown>
                                    {contentWithoutMermaid}
                                </ReactMarkdown>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Status card */}
                        <div className="rounded-xl border border-white/10 bg-card/50 p-6">
                            <h3 className="text-sm font-mono uppercase tracking-wider text-muted-foreground mb-4">Status</h3>
                            <div className="flex items-center gap-2">
                                {isComplete ? (
                                    <>
                                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                                        <span className="text-green-500">Architecture Complete</span>
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
                            <div className="rounded-xl border border-primary/30 bg-primary/5 p-6">
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
