import { Router, Request, Response } from 'express';
import { chat } from '../lib/llm';
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

        // Use non-streaming chat to get complete JSON response
        const response = await chat(prompt, {
            systemPrompt: BLUEPRINT_SYSTEM_PROMPT,
            model: 'qwen2.5-coder-7b-instruct'
        });

        // Try to parse the response as JSON
        try {
            // Clean markdown code blocks if present
            let jsonString = response.trim();
            const match = jsonString.match(/```(?:json)?\s*([\s\S]*?)```/);
            if (match) {
                jsonString = match[1].trim();
            }

            const parsed = JSON.parse(jsonString);
            res.json(parsed);
        } catch (parseError) {
            console.error('Failed to parse LLM response as JSON:', parseError);
            console.error('Raw response:', response);
            res.status(500).json({
                error: 'Failed to parse blueprint response',
                raw: response
            });
        }

    } catch (error) {
        console.error('Blueprint route error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export const blueprintRouter = router;
