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

// Full architecture response type
interface ArchitectureResponse {
    architecture: {
        problem_context: {
            use_case: string;
            scale_assumptions: {
                users: string;
                requests_per_second: string;
                data_growth: string;
            };
        };
        entry_layer: {
            dns: string;
            cdn: {
                enabled: boolean;
                provider: string;
                cached_assets: string[];
            };
            tls_termination: string;
        };
        traffic_management: {
            load_balancer: {
                type: string;
                tool: string;
            };
            rate_limiter: {
                enabled: boolean;
                strategy: string;
                location: string;
            };
        };
        api_gateway: {
            enabled: boolean;
            responsibilities: string[];
        };
        application_layer: {
            services: {
                name: string;
                responsibility: string;
                scaling: string;
            }[];
        };
        background_processing: {
            message_queue: {
                tool: string;
                use_cases: string[];
            };
            cron_jobs: {
                name: string;
                schedule: string;
                task: string;
            }[];
        };
        caching_layer: {
            tool: string;
            use_cases: string[];
            eviction_policy: string;
        };
        data_layer: {
            primary_database: {
                type: string;
                tool: string;
                replication: string;
                sharding: string;
            };
            read_replicas: {
                enabled: boolean;
                count: number;
            };
        };
        observability: {
            logging: string;
            metrics: string;
            tracing: string;
            alerting: string;
        };
        security: {
            authentication: string;
            authorization: string;
            data_encryption: {
                at_rest: boolean;
                in_transit: boolean;
            };
        };
        failure_handling: {
            circuit_breaker: boolean;
            retries: {
                enabled: boolean;
                strategy: string;
            };
            fallbacks: string[];
        };
        mermaid_diagram: string;
        tradeoffs: {
            decision: string;
            reason: string;
        }[];
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
