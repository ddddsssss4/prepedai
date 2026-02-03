import { Router, Request, Response } from 'express';
import { chatStream } from '../lib/llm';
import { buildBlueprintPrompt, BLUEPRINT_SYSTEM_PROMPT } from '../prompts/blueprint.prompt';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
    try {
        const { intent, architecture, database, api } = req.body;

        if (!intent || !architecture || !database || !api) {
            res.status(400).json({ error: 'Missing required context (intent, architecture, database, api)' });
            return;
        }

        console.log('[Blueprint] Starting stream for:', intent.substring(0, 50));

        const prompt = buildBlueprintPrompt(intent, architecture, database, api);

        // Set SSE headers (matching other routes)
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.flushHeaders();

        let fullContent = '';

        try {
            for await (const chunk of chatStream(prompt, {
                systemPrompt: BLUEPRINT_SYSTEM_PROMPT,
                model: 'qwen2.5-coder-7b-instruct'
            })) {
                fullContent += chunk;

                // Send chunk as SSE event - MUST match format expected by consumeSSEStream
                res.write(`data: ${JSON.stringify({ type: 'chunk', content: chunk })}\n\n`);
            }

            // Send completion event with full content
            res.write(`data: ${JSON.stringify({ type: 'done', content: fullContent })}\n\n`);
            res.end();
        } catch (streamError) {
            console.error('[Blueprint] Stream error:', streamError);
            res.write(`data: ${JSON.stringify({ type: 'error', error: String(streamError) })}\n\n`);
            res.end();
        }

    } catch (error) {
        console.error('Blueprint route error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export const blueprintRouter = router;
