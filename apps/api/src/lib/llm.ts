import OpenAI from 'openai';

// LM Studio runs an OpenAI-compatible server on localhost:1234
const client = new OpenAI({
    baseURL: process.env.LLM_BASE_URL || 'http://localhost:1234/v1',
    apiKey: 'not-needed', // LM Studio doesn't require an API key
});

const DEFAULT_MODEL = process.env.LLM_MODEL || 'qwen2.5-coder-14b-instruct';

export interface ChatOptions {
    system?: string;
    temperature?: number;
    maxTokens?: number;
}

export async function chat(
    userPrompt: string,
    options: ChatOptions = {}
): Promise<string> {
    const { system, temperature = 0.7, maxTokens = 4096 } = options;

    const messages: OpenAI.ChatCompletionMessageParam[] = [];

    if (system) {
        messages.push({ role: 'system', content: system });
    }

    messages.push({ role: 'user', content: userPrompt });

    const response = await client.chat.completions.create({
        model: DEFAULT_MODEL,
        messages,
        temperature,
        max_tokens: maxTokens,
    });

    return response.choices[0]?.message?.content || '';
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
    const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
    const jsonString = jsonMatch ? jsonMatch[1].trim() : response.trim();

    return JSON.parse(jsonString) as T;
}
