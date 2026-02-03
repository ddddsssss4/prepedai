import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { chatStream } from '../lib/llm';
import { DATABASE_SYSTEM_PROMPT, buildDatabasePrompt } from '../prompts/database.prompt';

const router = Router();

const RequestSchema = z.object({
    intent: z.string().min(10),
    architecture: z.string().min(10), // Context from previous step
});

// SSE streaming endpoint for database schema generation
router.post('/', async (req: Request, res: Response) => {
    try {
        const validation = RequestSchema.safeParse(req.body);

        if (!validation.success) {
            return res.status(400).json({
                success: false,
                error: validation.error.issues[0]?.message || 'Invalid request',
            });
        }

        const { intent, architecture } = validation.data;

        console.log('[Database] Starting stream for:', intent.substring(0, 50));

        // Set SSE headers
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.flushHeaders();

        let fullContent = '';

        try {
            for await (const chunk of chatStream(
                buildDatabasePrompt(intent, architecture),
                {
                    systemPrompt: DATABASE_SYSTEM_PROMPT,
                    temperature: 0.4,
                    maxTokens: 4096,
                }
            )) {
                fullContent += chunk;

                // Send chunk as SSE event
                res.write(`data: ${JSON.stringify({ type: 'chunk', content: chunk })}\n\n`);
            }

            // Send completion event
            res.write(`data: ${JSON.stringify({ type: 'done', content: fullContent })}\n\n`);
            res.end();
        } catch (streamError) {
            console.error('[Database] Stream error:', streamError);
            res.write(`data: ${JSON.stringify({ type: 'error', error: String(streamError) })}\n\n`);
            res.end();
        }
    } catch (error) {
        console.error('[Database] Error:', error);
        return res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to generate database schema',
        });
    }
});

export default router;
