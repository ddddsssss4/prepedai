import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { chatJSON } from '../lib/llm';
import { CLARIFY_SYSTEM_PROMPT, buildClarifyPrompt } from '../prompts/clarify.prompt';

const clarifyRoute = new Hono();

const RequestSchema = z.object({
    prompt: z.string().min(10, 'Prompt must be at least 10 characters'),
});

clarifyRoute.post('/', zValidator('json', RequestSchema), async (c) => {
    const { prompt } = c.req.valid('json');

    try {
        const questions = await chatJSON<string[]>(buildClarifyPrompt(prompt), {
            system: CLARIFY_SYSTEM_PROMPT,
            temperature: 0.7,
        });

        return c.json({
            success: true,
            questions: Array.isArray(questions) ? questions : [],
        });
    } catch (error) {
        console.error('Clarify error:', error);
        return c.json(
            {
                success: false,
                error: 'Failed to generate clarifying questions',
                questions: [
                    'What is the expected scale of users for this system?',
                    'Are there any specific technology preferences or constraints?',
                    'What integrations with external services are needed?',
                    'What is the timeline for this project?',
                ],
            },
            500
        );
    }
});

export default clarifyRoute;
