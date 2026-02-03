// LM Studio Client - Streaming support via SSE

const LLM_BASE_URL = process.env.LLM_BASE_URL || 'http://localhost:1234';
const DEFAULT_MODEL = process.env.LLM_MODEL || 'qwen2.5-coder-7b-instruct';

export interface ChatOptions {
    systemPrompt?: string;
    temperature?: number;
    maxTokens?: number;
}

interface LMStudioResponse {
    choices?: Array<{
        message?: {
            content?: string;
        };
    }>;
    response?: string;
    content?: string;
}

interface StreamChunk {
    choices?: Array<{
        delta?: {
            content?: string;
        };
        finish_reason?: string;
    }>;
}

// Non-streaming chat (for simple requests)
export async function chat(
    userPrompt: string,
    options: ChatOptions = {}
): Promise<string> {
    const { systemPrompt, temperature = 0.7, maxTokens = 4096 } = options;

    const requestBody = {
        model: DEFAULT_MODEL,
        messages: [
            ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
            { role: 'user', content: userPrompt },
        ],
        temperature,
        max_tokens: maxTokens,
        stream: false,
    };

    console.log('[LLM] Sending request to:', `${LLM_BASE_URL}/v1/chat/completions`);

    const response = await fetch(`${LLM_BASE_URL}/v1/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`LLM request failed: ${response.status} - ${errorText}`);
    }

    const data = (await response.json()) as LMStudioResponse;
    const content = data.choices?.[0]?.message?.content || data.response || data.content || '';

    if (!content) {
        throw new Error('No content in LLM response');
    }

    return content;
}

// Streaming chat - yields chunks as they arrive
export async function* chatStream(
    userPrompt: string,
    options: ChatOptions = {}
): AsyncGenerator<string, void, unknown> {
    const { systemPrompt, temperature = 0.7, maxTokens = 4096 } = options;

    const requestBody = {
        model: DEFAULT_MODEL,
        messages: [
            ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
            { role: 'user', content: userPrompt },
        ],
        temperature,
        max_tokens: maxTokens,
        stream: true, // Enable streaming
    };

    console.log('[LLM Stream] Starting stream to:', `${LLM_BASE_URL}/v1/chat/completions`);

    const response = await fetch(`${LLM_BASE_URL}/v1/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`LLM stream failed: ${response.status} - ${errorText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
        throw new Error('No response body for streaming');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });

            // Process complete SSE lines
            const lines = buffer.split('\n');
            buffer = lines.pop() || ''; // Keep incomplete line in buffer

            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed || trimmed === 'data: [DONE]') continue;

                if (trimmed.startsWith('data: ')) {
                    try {
                        const json = JSON.parse(trimmed.slice(6)) as StreamChunk;
                        const content = json.choices?.[0]?.delta?.content;
                        if (content) {
                            yield content;
                        }
                    } catch {
                        // Ignore parse errors for incomplete chunks
                    }
                }
            }
        }
    } finally {
        reader.releaseLock();
    }
}

// JSON parsing helper for non-streaming
export async function chatJSON<T>(
    userPrompt: string,
    options: ChatOptions = {}
): Promise<T> {
    const response = await chat(userPrompt, {
        ...options,
        temperature: 0.3,
    });

    let jsonString = response.trim();

    // Remove markdown code blocks if present
    const jsonMatch = jsonString.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
        jsonString = jsonMatch[1].trim();
    }

    // Try to find JSON object or array
    const objectMatch = jsonString.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (objectMatch) {
        jsonString = objectMatch[1];
    }

    try {
        return JSON.parse(jsonString) as T;
    } catch (error) {
        console.error('[LLM] Failed to parse JSON:', jsonString);
        throw new Error(`Failed to parse LLM response as JSON: ${error}`);
    }
}
