/**
 * Sanitize markdown content to fix common issues from LLM streaming
 * Main issue: Tables are output on single lines instead of separate lines
 */
export function sanitizeMarkdown(content: string): string {
    let sanitized = content;

    // First, normalize any escaped newlines from JSON/streaming
    sanitized = sanitized.replace(/\\n/g, '\n');
    sanitized = sanitized.replace(/\\t/g, '  ');
    sanitized = sanitized.replace(/\r\n/g, '\n');

    // Fix markdown tables - the LLM outputs them on single lines like:
    // | Header1 | Header2 | |---|---| | Data1 | Data2 |
    // We need each row on its own line

    // Strategy: Find table separator pattern |---|---| and use it to identify tables
    // Then split the rows properly

    // Pattern 1: Header row ends, separator row starts
    // `| ` followed by `|---` or `|:--` (with possible spaces)
    // Insert newline before the separator
    sanitized = sanitized.replace(/(\|)\s+(\|[-:]+)/g, '$1\n$2');

    // Pattern 2: Separator row ends, data row starts
    // `---|` or `--:|` followed by space and `|` (start of data cell)
    // Insert newline after separator row
    sanitized = sanitized.replace(/([-:]+\|)\s+(\|)(?=\s*[A-Za-z0-9])/g, '$1\n$2');

    // Pattern 3: Multiple data rows on same line
    // End of row `|` followed by spaces and `|` starting next row
    // But NOT if it's part of separator (contains -)
    // Look for: `| ` + `|` + letter/number (not -)
    sanitized = sanitized.replace(/(\|)\s{2,}(\|)(?=\s*[A-Za-z0-9])/g, '$1\n$2');

    // Debug: Log a sample of what we're processing
    console.log('[sanitizeMarkdown] Sample of processed content:',
        sanitized.substring(0, 500).replace(/\n/g, '\\n'));

    return sanitized;
}

/**
 * More aggressive table fixer - splits tables into proper rows
 * Call this if sanitizeMarkdown doesn't work
 */
export function fixMarkdownTables(content: string): string {
    let result = content;

    // Normalize escaped newlines
    result = result.replace(/\\n/g, '\n');

    // Find anything that looks like a markdown table row: | something |
    // The key insight: separator row has pattern |---|, |:--|, etc

    // Split on the separator pattern
    // Before: | A | B | |---|---| | C | D |
    // We want to insert \n before |---

    // Step 1: Add newline before separator row
    result = result.replace(/\|\s*(\|[-:]+[-:|\s]+)/g, '|\n$1');

    // Step 2: Add newline after separator row (before data rows)
    // Separator ends with | followed by space and another |
    result = result.replace(/([-:]+\|)\s*(\|\s*[^-|])/g, '$1\n$2');

    // Step 3: Handle multiple data rows on same line
    // Pattern: | data | | data | (row boundary is `| |`)
    // We need to detect when one row ends and another begins
    // A row ends with | and next row starts with | 
    // The trick: there's usually extra spacing between rows
    result = result.replace(/\|\s{3,}\|/g, '|\n|');

    return result;
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
