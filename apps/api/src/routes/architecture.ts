import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { chatJSON } from '../lib/llm';
import {
    ARCHITECTURE_SYSTEM_PROMPT,
    buildArchitecturePrompt,
} from '../prompts/architecture.prompt';

const router = Router();

const ClarificationSchema = z.object({
    question: z.string(),
    answer: z.string(),
});

const RequestSchema = z.object({
    prompt: z.string().min(10, 'Prompt must be at least 10 characters'),
    clarifications: z.array(ClarificationSchema).default([]),
});

// Architecture response type matching the new prompt structure
interface ArchitectureResponse {
    architecture: {
        problem_understanding: {
            core_problem: string;
            key_challenges: string[];
            assumptions: string[];
        };
        overview: {
            summary: string;
            architecture_style: string;
            key_principles: string[];
        };
        components: {
            name: string;
            purpose: string;
            justification: string;
            technologies: string[];
        }[];
        data_flow: {
            description: string;
            steps: string[];
        };
        technology_choices: {
            category: string;
            choice: string;
            reasoning: string;
        }[];
        tradeoffs: {
            decision: string;
            benefit: string;
            cost: string;
            alternative: string;
        }[];
        mermaid_diagram: string;
    };
}

router.post('/', async (req: Request, res: Response) => {
    try {
        const validation = RequestSchema.safeParse(req.body);

        if (!validation.success) {
            return res.status(400).json({
                success: false,
                error: validation.error.issues[0]?.message || 'Invalid request',
            });
        }

        const { prompt, clarifications } = validation.data;

        console.log('[Architecture] Generating for:', prompt);
        console.log('[Architecture] With clarifications:', clarifications.length);

        const result = await chatJSON<ArchitectureResponse>(
            buildArchitecturePrompt(prompt, clarifications),
            {
                systemPrompt: ARCHITECTURE_SYSTEM_PROMPT,
                temperature: 0.4,
                maxTokens: 8192,
            }
        );

        console.log('[Architecture] Generated successfully');

        // Ensure tradeoffs is always an array
        if (result.architecture) {
            result.architecture.tradeoffs = result.architecture.tradeoffs || [];
            result.architecture.components = result.architecture.components || [];
            result.architecture.technology_choices = result.architecture.technology_choices || [];
        }

        return res.json({
            success: true,
            ...result,
        });
    } catch (error) {
        console.error('[Architecture] Error:', error);
        return res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to generate architecture',
        });
    }
});

export default router;
