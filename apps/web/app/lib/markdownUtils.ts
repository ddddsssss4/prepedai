/**
 * Sanitize markdown content to fix common issues from LLM streaming
 */
export function sanitizeMarkdown(content: string): string {
    let sanitized = content;

    // First, normalize any escaped newlines from JSON/streaming
    sanitized = sanitized.replace(/\\n/g, '\n');
    sanitized = sanitized.replace(/\\t/g, '  ');
    sanitized = sanitized.replace(/\r\n/g, '\n');

    // Fix markdown tables that are all on one line
    // Pattern: | Header1 | Header2 | |---|---| | Data1 | Data2 |
    // Needs to become:
    // | Header1 | Header2 |
    // |---|---|
    // | Data1 | Data2 |

    // Step 1: Add newline BEFORE the separator row |---|---|
    // This regex matches: end of a cell `|` followed by space(s) then `|---`
    sanitized = sanitized.replace(/\|\s+(\|[-:]+)/g, '|\n$1');

    // Step 2: Add newline AFTER the separator row
    // This regex matches: end of separator row `---| ` followed by `|` starting next row
    sanitized = sanitized.replace(/([-:]+\|)\s+\|(?!\s*[-:])/g, '$1\n|');

    // Step 3: Split data rows that are on the same line
    // Pattern: | ... | | ... | (two complete rows on one line)
    // Match: `| ` at end of row followed by space(s) then `| ` starting new row
    // But we need to be careful not to split individual cells

    // Look for pattern: `|` followed by whitespace then `|` followed by non-dash character
    // This indicates a new row starting
    const lines = sanitized.split('\n');
    const processedLines: string[] = [];

    for (const line of lines) {
        // Count pipe characters to detect multiple rows on one line
        const pipeCount = (line.match(/\|/g) || []).length;

        // A typical table row has 5-8 pipes (3-4 columns = 4-5 pipes including ends)
        // If we have more than 10 pipes, likely multiple rows
        if (pipeCount > 10) {
            // Try to split on pattern: `| |` which indicates row boundary
            // But first check if it's a separator row
            if (!line.includes('|---') && !line.includes('|:--')) {
                // This is likely multiple data rows
                // Split on: `| ` followed by `|` (but not part of separator)
                const splitLine = line.replace(/\|\s+\|(?!\s*[-:])/g, '|\n|');
                processedLines.push(splitLine);
            } else {
                processedLines.push(line);
            }
        } else {
            processedLines.push(line);
        }
    }

    sanitized = processedLines.join('\n');

    // Final cleanup: ensure proper spacing
    // Remove multiple consecutive newlines
    sanitized = sanitized.replace(/\n{3,}/g, '\n\n');

    console.log('[sanitizeMarkdown] Input length:', content.length, 'Output length:', sanitized.length);

    return sanitized;
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
