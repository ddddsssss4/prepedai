'use client';

import React, { useEffect, useState } from 'react';
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

/**
 * Sanitize mermaid chart content to fix common syntax issues
 * - Escape parentheses inside square bracket node labels
 * - Convert escaped newlines to real newlines
 */
function sanitizeMermaidChart(chart: string): string {
    let clean = chart
        .trim()
        .replace(/\\n/g, '\n')      // Convert escaped newlines
        .replace(/\\t/g, '  ')       // Convert tabs to spaces
        .replace(/\r\n/g, '\n');     // Normalize line endings

    // Fix node labels with parentheses inside square brackets
    // e.g., A[Content Delivery Network (CDN)] -> A["Content Delivery Network (CDN)"]
    // This regex finds [...text with (parens)...]  and wraps content in quotes
    clean = clean.replace(/\[([^\]]*\([^\]]*\)[^\]]*)\]/g, (match, content) => {
        // If already quoted, don't double-quote
        if (content.startsWith('"') && content.endsWith('"')) {
            return match;
        }
        return `["${content}"]`;
    });

    // Fix erDiagram attributes with multiple qualifiers (PK FK together is invalid)
    // Change "type name PK FK" to "type name FK" (keep FK, drop PK for junction tables)
    clean = clean.replace(/(\w+\s+\w+)\s+PK\s+FK/g, '$1 FK');

    console.log('[Mermaid] Sanitized chart:', clean.substring(0, 200) + '...');
    return clean;
}

export const Mermaid = ({ chart, className }: MermaidProps) => {
    const [error, setError] = useState<string | null>(null);
    const [svg, setSvg] = useState<string>('');

    useEffect(() => {
        const renderChart = async () => {
            if (!chart || !chart.trim()) {
                setError('No diagram content');
                return;
            }

            const cleanChart = sanitizeMermaidChart(chart);
            console.log('[Mermaid] Raw input:', chart.substring(0, 100) + '...');

            try {
                // Generate unique ID
                const id = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

                // Render directly - mermaid.render handles validation
                const { svg: renderedSvg } = await mermaid.render(id, cleanChart);
                setSvg(renderedSvg);
                setError(null);
            } catch (err) {
                console.error('[Mermaid] Render error:', err);
                console.error('[Mermaid] Failed chart:\n', cleanChart);

                // Try a fallback: strip all parentheses from node labels
                try {
                    const fallbackChart = cleanChart.replace(/\[([^\]]+)\]/g, (match, content) => {
                        // Remove parentheses and their contents from labels
                        const cleaned = content.replace(/\s*\([^)]*\)/g, '');
                        return `[${cleaned}]`;
                    });

                    console.log('[Mermaid] Trying fallback chart:', fallbackChart.substring(0, 100));
                    const fallbackId = `mermaid-fallback-${Date.now()}`;
                    const { svg: fallbackSvg } = await mermaid.render(fallbackId, fallbackChart);
                    setSvg(fallbackSvg);
                    setError(null);
                } catch (fallbackErr) {
                    setError(err instanceof Error ? err.message : 'Failed to render diagram');
                }
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
                <details className="mt-4 text-xs text-muted-foreground w-full">
                    <summary className="cursor-pointer hover:text-foreground">Show raw content</summary>
                    <pre className="mt-2 p-3 bg-black/40 rounded text-xs overflow-auto max-h-40 whitespace-pre-wrap">
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
