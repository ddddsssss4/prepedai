'use client';

import { useAppStore } from '../store/appStore';
import { Mermaid } from './Mermaid';
import { Button } from '@/components/ui/button';
import {
    Database as DatabaseIcon,
    Loader2,
    Table,
    Link2,
    ArrowRight,
    AlertTriangle,
    CheckCircle2,
    AlertCircle,
    Key,
    Boxes
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Components } from 'react-markdown';

// Custom markdown components for better styling
const markdownComponents: Partial<Components> = {
    h2: ({ children }) => (
        <h2 className="text-2xl font-bold mt-8 mb-4 text-foreground flex items-center gap-3 border-b border-white/10 pb-3">
            {getIconForHeading(String(children))}
            {children}
        </h2>
    ),
    h3: ({ children }) => (
        <h3 className="text-lg font-semibold mt-6 mb-3 text-green-400/90">
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
            <span className="text-green-400 mt-1.5">•</span>
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
        <thead className="bg-green-500/10 border-b border-white/10">
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
                <code className="px-1.5 py-0.5 rounded bg-green-500/10 text-green-400 text-sm font-mono">
                    {children}
                </code>
            );
        }
        return <code className={className}>{children}</code>;
    },
    pre: ({ children }) => (
        <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto mb-4 border border-white/10">
            {children}
        </pre>
    ),
};

function getIconForHeading(text: string) {
    const lower = text.toLowerCase();
    if (lower.includes('overview')) return <DatabaseIcon className="h-6 w-6 text-green-400" />;
    if (lower.includes('entity') || lower.includes('diagram')) return <Link2 className="h-6 w-6 text-blue-400" />;
    if (lower.includes('table')) return <Table className="h-6 w-6 text-purple-400" />;
    if (lower.includes('design') || lower.includes('decision')) return <Boxes className="h-6 w-6 text-orange-400" />;
    if (lower.includes('index') || lower.includes('key')) return <Key className="h-6 w-6 text-yellow-400" />;
    return <DatabaseIcon className="h-6 w-6 text-green-400" />;
}

export function DatabaseTab() {
    const {
        databaseStream,
        generationStep,
        architectureStream,
        streamDatabase,
        streamApiDesign
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
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/10 flex items-center justify-center">
                    <DatabaseIcon className="h-10 w-10 text-green-400" />
                </div>
                <div className="text-center space-y-2">
                    <p className="text-foreground text-xl font-semibold">Ready to Design Database</p>
                    <p className="text-muted-foreground max-w-md">
                        Based on your architecture, we&apos;ll generate a complete database schema with ERD diagram.
                    </p>
                </div>
                <Button
                    size="lg"
                    onClick={streamDatabase}
                    className="mt-4 gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
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
        const contentWithoutMermaid = content.replace(/```mermaid[\s\S]*?```/g, '');

        const isComplete = !isStreaming && content.length > 0;

        return (
            <div className="space-y-6">
                {/* Streaming indicator */}
                {isStreaming && (
                    <div className="flex items-center gap-2 text-green-400 animate-pulse bg-green-500/5 border border-green-500/20 rounded-lg px-4 py-3">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm font-mono">Generating database schema...</span>
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
                    {/* Main content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* ERD Diagram */}
                        {mermaidCode && (
                            <div className="rounded-xl border border-white/10 bg-gradient-to-br from-green-500/5 via-black/40 to-emerald-500/5 backdrop-blur-xl p-6 shadow-xl">
                                <div className="flex items-center space-x-3 mb-4">
                                    <Link2 className="h-5 w-5 text-green-400" />
                                    <h3 className="text-lg font-semibold">Entity Relationship Diagram</h3>
                                </div>
                                <Mermaid chart={mermaidCode} />
                            </div>
                        )}

                        {/* Schema Details */}
                        <div className="rounded-xl border border-white/10 bg-gradient-to-br from-white/5 via-card/80 to-white/5 backdrop-blur-sm p-8 shadow-lg">
                            <div className="prose prose-invert prose-sm max-w-none">
                                <ReactMarkdown components={markdownComponents}>
                                    {contentWithoutMermaid}
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
                                        <span className="text-green-500 font-medium">Database Complete</span>
                                    </>
                                ) : (
                                    <>
                                        <Loader2 className="h-5 w-5 text-green-400 animate-spin" />
                                        <span className="text-green-400">Generating...</span>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Next step */}
                        {isComplete && (
                            <div className="rounded-xl border border-green-500/30 bg-gradient-to-br from-green-500/10 to-emerald-500/5 p-6">
                                <h3 className="text-sm font-mono uppercase tracking-wider text-green-400 mb-4">Next Step</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Database schema is ready. Proceed to API design.
                                </p>
                                <Button
                                    onClick={streamApiDesign}
                                    className="w-full gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                                >
                                    Generate API Design
                                    <ArrowRight className="h-4 w-4" />
                                </Button>
                            </div>
                        )}

                        {/* Tips */}
                        <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                            <div className="flex items-center gap-2 mb-3">
                                <AlertCircle className="h-4 w-4 text-green-400" />
                                <h3 className="text-sm font-semibold">Database Tips</h3>
                            </div>
                            <ul className="text-xs text-muted-foreground space-y-2">
                                <li>• Check primary and foreign keys</li>
                                <li>• Review indexes for query performance</li>
                                <li>• Verify relationships are correct</li>
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
            <Loader2 className="h-12 w-12 text-green-400 animate-spin" />
            <p className="text-muted-foreground">Preparing database design...</p>
        </div>
    );
}
