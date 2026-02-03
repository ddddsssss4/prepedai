'use client';

import { useAppStore } from '../store/appStore';
import { Button } from '@/components/ui/button';
import {
    Server,
    Loader2,
    ArrowRight,
    AlertTriangle,
    Shield,
    Zap
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export function ApiTab() {
    const {
        apiStream,
        generationStep,
        databaseStream,
        streamApiDesign
    } = useAppStore();

    const { isStreaming, content, error } = apiStream;

    // Check if we can start generating API
    const canGenerate = generationStep === 'database' &&
        !databaseStream.isStreaming &&
        databaseStream.content.length > 0;

    // Not yet available
    if (['idle', 'clarify', 'architecture'].includes(generationStep)) {
        return (
            <div className="flex flex-col items-center justify-center py-24 space-y-6">
                <Server className="h-16 w-16 text-muted-foreground/30" />
                <p className="text-muted-foreground text-center">
                    Complete the Database step first to unlock API design.
                </p>
            </div>
        );
    }

    // Ready to generate
    if (canGenerate && !content && !isStreaming) {
        return (
            <div className="flex flex-col items-center justify-center py-24 space-y-6">
                <Server className="h-16 w-16 text-primary/50" />
                <div className="text-center space-y-2">
                    <p className="text-foreground text-xl font-semibold">Ready to Design API</p>
                    <p className="text-muted-foreground max-w-md">
                        Based on your database schema, we&apos;ll generate RESTful API endpoints.
                    </p>
                </div>
                <Button
                    size="lg"
                    onClick={streamApiDesign}
                    className="mt-4 gap-2"
                >
                    Generate API Design
                    <ArrowRight className="h-4 w-4" />
                </Button>
            </div>
        );
    }

    // Streaming or has content
    if (isStreaming || content) {
        return (
            <div className="space-y-6">
                {/* Streaming indicator */}
                {isStreaming && (
                    <div className="flex items-center gap-2 text-primary animate-pulse">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm font-mono">Generating API design...</span>
                    </div>
                )}

                {/* Error display */}
                {error && (
                    <div className="flex items-center gap-2 text-red-500 bg-red-500/10 p-4 rounded-lg">
                        <AlertTriangle className="h-4 w-4" />
                        <span>{error}</span>
                    </div>
                )}

                {/* API Content */}
                <div className="rounded-xl border border-white/10 bg-card/50 backdrop-blur-sm p-6 overflow-auto max-h-[700px]">
                    <div className="flex items-center space-x-2 mb-6">
                        <Server className="h-5 w-5 text-blue-500" />
                        <h3 className="text-xl font-bold">API Specification</h3>
                    </div>
                    <div className="prose prose-invert prose-sm max-w-none">
                        <ReactMarkdown>
                            {content}
                        </ReactMarkdown>
                    </div>
                </div>
            </div>
        );
    }

    // Waiting state
    return (
        <div className="flex flex-col items-center justify-center py-24 space-y-6">
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
            <p className="text-muted-foreground">Preparing API design...</p>
        </div>
    );
}
