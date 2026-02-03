'use client';

import { useAppStore } from '../store/appStore';
import { Mermaid } from './Mermaid';
import { Button } from '@/components/ui/button';
import {
    Database as DatabaseIcon,
    Loader2,
    Table,
    Link2,
    Lightbulb,
    ArrowRight,
    AlertTriangle
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export function DatabaseTab() {
    const {
        databaseStream,
        generationStep,
        architectureStream,
        streamDatabase
    } = useAppStore();

    const { isStreaming, content, error } = databaseStream;

    // Check if we can start generating database
    const canGenerate = generationStep === 'architecture' &&
        !architectureStream.isStreaming &&
        architectureStream.content.length > 0;

    // Not yet available
    if (generationStep === 'idle' || generationStep === 'clarify') {
        return (
            <div className="flex flex-col items-center justify-center py-24 space-y-6">
                <DatabaseIcon className="h-16 w-16 text-muted-foreground/30" />
                <p className="text-muted-foreground text-center">
                    Complete the Architecture step first to unlock Database design.
                </p>
            </div>
        );
    }

    // Ready to generate
    if (canGenerate && !content && !isStreaming) {
        return (
            <div className="flex flex-col items-center justify-center py-24 space-y-6">
                <DatabaseIcon className="h-16 w-16 text-primary/50" />
                <div className="text-center space-y-2">
                    <p className="text-foreground text-xl font-semibold">Ready to Design Database</p>
                    <p className="text-muted-foreground max-w-md">
                        Based on your architecture, we&apos;ll generate a complete database schema with ERD diagram.
                    </p>
                </div>
                <Button
                    size="lg"
                    onClick={streamDatabase}
                    className="mt-4 gap-2"
                >
                    Generate Database Schema
                    <ArrowRight className="h-4 w-4" />
                </Button>
            </div>
        );
    }

    // Streaming or has content
    if (isStreaming || content) {
        // Extract mermaid diagram if present
        const mermaidMatch = content.match(/```mermaid\s*([\s\S]*?)```/);
        const mermaidCode = mermaidMatch ? mermaidMatch[1].trim() : null;

        return (
            <div className="space-y-6">
                {/* Streaming indicator */}
                {isStreaming && (
                    <div className="flex items-center gap-2 text-primary animate-pulse">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm font-mono">Generating database schema...</span>
                    </div>
                )}

                {/* Error display */}
                {error && (
                    <div className="flex items-center gap-2 text-red-500 bg-red-500/10 p-4 rounded-lg">
                        <AlertTriangle className="h-4 w-4" />
                        <span>{error}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* ERD Diagram */}
                    <div className="rounded-xl border border-white/10 bg-black/40 backdrop-blur-xl p-6">
                        <div className="flex items-center space-x-2 mb-4">
                            <Link2 className="h-5 w-5 text-primary" />
                            <h3 className="text-lg font-semibold">Entity Relationship Diagram</h3>
                        </div>
                        {mermaidCode ? (
                            <Mermaid chart={mermaidCode} />
                        ) : (
                            <div className="flex items-center justify-center h-64 text-muted-foreground">
                                {isStreaming ? 'Generating diagram...' : 'No ERD diagram available'}
                            </div>
                        )}
                    </div>

                    {/* Schema Details */}
                    <div className="rounded-xl border border-white/10 bg-card/50 p-6 overflow-auto max-h-[600px]">
                        <div className="flex items-center space-x-2 mb-4">
                            <Table className="h-5 w-5 text-green-500" />
                            <h3 className="text-lg font-semibold">Schema Details</h3>
                        </div>
                        <div className="prose prose-invert prose-sm max-w-none">
                            <ReactMarkdown>
                                {content.replace(/```mermaid[\s\S]*?```/g, '')}
                            </ReactMarkdown>
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
            <p className="text-muted-foreground">Preparing database design...</p>
        </div>
    );
}
