'use client';

import { useAppStore } from '../store/appStore';
import { Button } from '@/components/ui/button';
import {
    Server,
    Loader2,
    ArrowRight,
    AlertTriangle,
    CheckCircle2,
    AlertCircle,
    Shield,
    Zap,
    Route,
    FileJson,
    Lock
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Components } from 'react-markdown';
import { sanitizeMarkdown } from '../lib/markdownUtils';

// Custom markdown components for better styling
const markdownComponents: Partial<Components> = {
    h2: ({ children }) => (
        <h2 className="text-2xl font-bold mt-8 mb-4 text-foreground flex items-center gap-3 border-b border-white/10 pb-3">
            {getIconForHeading(String(children))}
            {children}
        </h2>
    ),
    h3: ({ children }) => (
        <h3 className="text-lg font-semibold mt-6 mb-3 text-blue-400/90">
            {children}
        </h3>
    ),
    h4: ({ children }) => (
        <h4 className="text-base font-medium mt-4 mb-2 text-foreground/80 flex items-center gap-2">
            <Route className="h-4 w-4 text-blue-400/70" />
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
            <span className="text-blue-400 mt-1.5">•</span>
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
        <thead className="bg-blue-500/10 border-b border-white/10">
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
                <code className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 text-sm font-mono">
                    {children}
                </code>
            );
        }
        return <code className={className}>{children}</code>;
    },
    pre: ({ children }) => (
        <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto mb-4 border border-white/10 text-sm">
            {children}
        </pre>
    ),
    hr: () => (
        <hr className="border-white/10 my-6" />
    ),
};

function getIconForHeading(text: string) {
    const lower = text.toLowerCase();
    if (lower.includes('overview')) return <Server className="h-6 w-6 text-blue-400" />;
    if (lower.includes('auth')) return <Shield className="h-6 w-6 text-yellow-400" />;
    if (lower.includes('endpoint')) return <Route className="h-6 w-6 text-purple-400" />;
    if (lower.includes('error')) return <AlertTriangle className="h-6 w-6 text-red-400" />;
    if (lower.includes('rate')) return <Zap className="h-6 w-6 text-orange-400" />;
    if (lower.includes('response') || lower.includes('request')) return <FileJson className="h-6 w-6 text-green-400" />;
    return <Server className="h-6 w-6 text-blue-400" />;
}

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
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500/20 to-indigo-500/10 flex items-center justify-center">
                    <Server className="h-10 w-10 text-blue-400" />
                </div>
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
        const isComplete = !isStreaming && content.length > 0;

        // Debug logging
        console.log('[ApiTab] Content length:', content.length);
        console.log('[ApiTab] Is streaming:', isStreaming);
        if (content.length > 0) {
            console.log('[ApiTab] Content preview:', content.substring(0, 200));
        }

        return (
            <div className="space-y-6">
                {/* Streaming indicator */}
                {isStreaming && (
                    <div className="flex items-center gap-2 text-blue-400 animate-pulse bg-blue-500/5 border border-blue-500/20 rounded-lg px-4 py-3">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm font-mono">Generating API design...</span>
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
                    {/* API Content */}
                    <div className="lg:col-span-2">
                        <div className="rounded-xl border border-neutral-200 dark:border-white/10 bg-gradient-to-br from-blue-500/5 via-card/80 to-indigo-500/5 backdrop-blur-sm p-8 shadow-lg">
                            <div className="prose prose-invert prose-sm max-w-none">
                                <ReactMarkdown
                                    components={markdownComponents}
                                    remarkPlugins={[remarkGfm]}
                                >
                                    {sanitizeMarkdown(content)}
                                </ReactMarkdown>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Status card */}
                        <div className="rounded-xl border border-neutral-200 dark:border-white/10 bg-gradient-to-br from-blue-500/5 to-transparent p-6 shadow-sm">
                            <h3 className="text-sm font-mono uppercase tracking-wider text-muted-foreground mb-4">Status</h3>
                            <div className="flex items-center gap-2">
                                {isComplete ? (
                                    <>
                                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                                        <span className="text-green-500 font-medium">API Design Complete</span>
                                    </>
                                ) : (
                                    <>
                                        <Loader2 className="h-5 w-5 text-blue-400 animate-spin" />
                                        <span className="text-blue-400">Generating...</span>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Completion card */}
                        {isComplete && (
                            <div className="rounded-xl border border-green-500/30 bg-gradient-to-br from-green-500/10 to-emerald-500/5 p-6 shadow-md">
                                <h3 className="text-sm font-mono uppercase tracking-wider text-green-400 mb-4">All Done!</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Your system design is complete. Review the Blueprint tab for the full execution plan.
                                </p>
                                <div className="flex items-center gap-2 text-green-400">
                                    <CheckCircle2 className="h-5 w-5" />
                                    <span className="font-medium">Blueprint Ready</span>
                                </div>
                            </div>
                        )}

                        {/* Tips */}
                        <div className="rounded-xl border border-neutral-200 dark:border-white/10 bg-white/5 p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-3">
                                <AlertCircle className="h-4 w-4 text-blue-400" />
                                <h3 className="text-sm font-semibold">API Tips</h3>
                            </div>
                            <ul className="text-xs text-muted-foreground space-y-2">
                                <li>• Verify all CRUD endpoints exist</li>
                                <li>• Check authentication requirements</li>
                                <li>• Review request/response formats</li>
                                <li>• Consider rate limiting needs</li>
                            </ul>
                        </div>

                        {/* Security reminder */}
                        <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-3">
                                <Lock className="h-4 w-4 text-yellow-400" />
                                <h3 className="text-sm font-semibold text-yellow-400">Security</h3>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Remember to implement proper authentication and input validation on all endpoints.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Waiting state
    return (
        <div className="flex flex-col items-center justify-center py-24 space-y-6">
            <Loader2 className="h-12 w-12 text-blue-400 animate-spin" />
            <p className="text-muted-foreground">Preparing API design...</p>
        </div>
    );
}
