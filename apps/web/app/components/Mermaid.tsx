'use client';

import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { AlertTriangle } from 'lucide-react';

interface MermaidProps {
    chart: string;
    className?: string;
}

mermaid.initialize({
    startOnLoad: false,
    theme: 'dark',
    securityLevel: 'loose',
    fontFamily: 'inherit',
    flowchart: {
        htmlLabels: true,
        useMaxWidth: true,
    },
    er: {
        useMaxWidth: true,
    },
});

export const Mermaid = ({ chart, className }: MermaidProps) => {
    const ref = useRef<HTMLDivElement>(null);
    const [error, setError] = useState<string | null>(null);
    const [svg, setSvg] = useState<string>('');

    useEffect(() => {
        const renderChart = async () => {
            if (!chart || !chart.trim()) {
                setError('No diagram content');
                return;
            }

            // Clean and normalize the chart content
            let cleanChart = chart
                .trim()
                .replace(/\\n/g, '\n')  // Convert escaped newlines to real newlines
                .replace(/\\t/g, '  ')   // Convert tabs to spaces
                .replace(/\r\n/g, '\n'); // Normalize line endings

            // Log for debugging
            console.log('[Mermaid] Raw chart input:', chart);
            console.log('[Mermaid] Cleaned chart:', cleanChart);

            try {
                // Validate first
                const isValid = await mermaid.parse(cleanChart);
                console.log('[Mermaid] Parse result:', isValid);

                // Generate unique ID
                const id = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

                // Render
                const { svg: renderedSvg } = await mermaid.render(id, cleanChart);
                setSvg(renderedSvg);
                setError(null);
            } catch (err) {
                console.error('[Mermaid] Render error:', err);
                console.error('[Mermaid] Failed chart content:', cleanChart);
                setError(err instanceof Error ? err.message : 'Failed to render diagram');
            }
        };

        renderChart();
    }, [chart]);

    if (error) {
        return (
            <div className={`flex flex-col items-center justify-center p-8 bg-red-500/10 rounded-lg border border-red-500/20 ${className || ''}`}>
                <AlertTriangle className="h-8 w-8 text-red-400 mb-3" />
                <p className="text-red-400 text-sm font-medium">Diagram Error</p>
                <p className="text-red-400/70 text-xs mt-1 text-center max-w-md">{error}</p>
                <details className="mt-4 text-xs text-muted-foreground">
                    <summary className="cursor-pointer hover:text-foreground">Show raw content</summary>
                    <pre className="mt-2 p-3 bg-black/40 rounded text-xs overflow-auto max-h-32 max-w-full">
                        {chart}
                    </pre>
                </details>
            </div>
        );
    }

    if (!svg) {
        return (
            <div className={`flex items-center justify-center p-8 bg-black/20 rounded-lg ${className || ''}`}>
                <p className="text-muted-foreground text-sm">Loading diagram...</p>
            </div>
        );
    }

    return (
        <div
            className={`flex justify-center p-4 bg-black/20 rounded-lg overflow-x-auto ${className || ''}`}
            dangerouslySetInnerHTML={{ __html: svg }}
        />
    );
};
