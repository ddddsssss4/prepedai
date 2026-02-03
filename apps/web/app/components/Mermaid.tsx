'use client';

import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

interface MermaidProps {
    chart: string;
    className?: string;
}

mermaid.initialize({
    startOnLoad: true,
    theme: 'dark',
    securityLevel: 'loose',
    fontFamily: 'inherit',
});

export const Mermaid = ({ chart, className }: MermaidProps) => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (ref.current) {
            mermaid.contentLoaded();
            ref.current.innerHTML = chart;
            ref.current.removeAttribute('data-processed');
            mermaid.run({
                nodes: [ref.current],
            }).catch(err => console.error('Mermaid render error:', err));
        }
    }, [chart]);

    return (
        <div key={chart} className={`mermaid flex justify-center p-4 bg-black/20 rounded-lg ${className}`} ref={ref}>
            {chart}
        </div>
    );
};
