// LM Studio Client - Direct HTTP calls to LM Studio API
// LM Studio uses /api/v1/chat endpoint

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
    };

    console.log('[LLM] Sending request to:', `${LLM_BASE_URL}/v1/chat/completions`);
    console.log('[LLM] Model:', DEFAULT_MODEL);

    const response = await fetch(`${LLM_BASE_URL}/v1/chat/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('[LLM] Error response:', errorText);
        throw new Error(`LLM request failed: ${response.status} - ${errorText}`);
    }

    const data = (await response.json()) as LMStudioResponse;
    console.log('[LLM] Response received');

    // Extract content from response
    const content =
        data.choices?.[0]?.message?.content ||
        data.response ||
        data.content ||
        '';

    if (!content) {
        throw new Error('No content in LLM response');
    }

    return content;
}

export async function chatJSON<T>(
    userPrompt: string,
    options: ChatOptions = {}
): Promise<T> {
    const response = await chat(userPrompt, {
        ...options,
        temperature: 0.3, // Lower temperature for structured output
    });

    // Extract JSON from response (handle markdown code blocks)
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
