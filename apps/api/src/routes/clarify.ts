import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { chatJSON } from '../lib/llm';
import { CLARIFY_SYSTEM_PROMPT, buildClarifyPrompt } from '../prompts/clarify.prompt';

const router = Router();

const RequestSchema = z.object({
    prompt: z.string().min(10, 'Prompt must be at least 10 characters'),
});

router.post('/', async (req: Request, res: Response) => {
    try {
        const validation = RequestSchema.safeParse(req.body);

        if (!validation.success) {
            return res.status(400).json({
                success: false,
                error: validation.error.issues[0]?.message || 'Invalid request',
            });
        }

        const { prompt } = validation.data;

        console.log('[Clarify] Generating questions for:', prompt);

        const questions = await chatJSON<string[]>(buildClarifyPrompt(prompt), {
            systemPrompt: CLARIFY_SYSTEM_PROMPT,
            temperature: 0.7,
        });

        console.log('[Clarify] Generated questions:', questions);

        return res.json({
            success: true,
            questions: Array.isArray(questions) ? questions : [],
        });
    } catch (error) {
        console.error('[Clarify] Error:', error);
        return res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to generate questions',
        });
    }
});

export default router;
