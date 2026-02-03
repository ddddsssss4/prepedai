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

        const prompt = buildBlueprintPrompt(intent, architecture, database, api);

        // We stream the JSON response
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        try {
            const stream = chatStream(prompt, {
                systemPrompt: BLUEPRINT_SYSTEM_PROMPT,
                model: 'qwen2.5-coder-7b-instruct'
            });

            for await (const chunk of stream) {
                res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
            }

            res.write('data: [DONE]\n\n');
            res.end();
        } catch (error) {
            console.error('Blueprint generation error:', error);
            res.write(`data: ${JSON.stringify({ error: 'Failed to generate blueprint' })}\n\n`);
            res.end();
        }

    } catch (error) {
        console.error('Blueprint route error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export const blueprintRouter = router;
