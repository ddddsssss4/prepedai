/**
 * Sanitize markdown content to fix common issues from LLM streaming
 */
export function sanitizeMarkdown(content: string): string {
    let sanitized = content;

    // Fix tables that are on single lines
    // Pattern: | Header1 | Header2 | |---|---| | Data1 | Data2 |
    // Needs to be split into separate lines

    // First, normalize any existing newlines
    sanitized = sanitized.replace(/\\n/g, '\n');

    // Check if we have tables that are on single lines
    // A table row is | text | text | followed by more | text | patterns
    // We need to add newlines before each row

    // Add newline before header separator row (|---|---|)
    sanitized = sanitized.replace(/\|\s*(\|[-:]+[-:\s|]+\|)/g, '|\n$1');

    // Add newline after header separator row
    sanitized = sanitized.replace(/(\|[-:]+[-:\s|]+\|)\s*\|/g, '$1\n|');

    // Add newlines between data rows
    // Pattern: end of row | | start of next row
    sanitized = sanitized.replace(/\|\s+\|(?=\s*[^-|])/g, '|\n|');

    // More aggressive: split any line that has too many table cells
    const lines = sanitized.split('\n');
    const fixedLines = lines.map(line => {
        // Count pipe characters
        const pipeCount = (line.match(/\|/g) || []).length;

        // If we have more than expected pipes for a single row (heuristic: > 10)
        // This likely means multiple rows are on one line
        if (pipeCount > 10 && line.includes('|')) {
            // Find row pattern: starts/ends with | 
            // Split on | followed by whitespace and |
            return line.replace(/\|\s*\|(?!\s*[-:])/g, '|\n|');
        }
        return line;
    });

    return fixedLines.join('\n');
}

/**
 * Extract mermaid code blocks from content
 */
export function extractMermaid(content: string): { mermaidCode: string | null; contentWithoutMermaid: string } {
    const mermaidMatch = content.match(/```mermaid\s*([\s\S]*?)```/);
    const mermaidCode = mermaidMatch?.[1]?.trim() ?? null;
    const contentWithoutMermaid = content.replace(/```mermaid[\s\S]*?```/g, '');

    return { mermaidCode, contentWithoutMermaid };
}
