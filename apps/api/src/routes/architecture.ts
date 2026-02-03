import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { chatJSON } from '../lib/llm';
import {
    ARCHITECTURE_SYSTEM_PROMPT,
    buildArchitecturePrompt,
} from '../prompts/architecture.prompt';

const architectureRoute = new Hono();

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

architectureRoute.post('/', zValidator('json', RequestSchema), async (c) => {
    const { prompt, clarifications } = c.req.valid('json');

    try {
        const result = await chatJSON<ArchitectureResponse>(
            buildArchitecturePrompt(prompt, clarifications),
            {
                system: ARCHITECTURE_SYSTEM_PROMPT,
                temperature: 0.4,
                maxTokens: 8192,
            }
        );

        return c.json({
            success: true,
            ...result,
        });
    } catch (error) {
        console.error('Architecture generation error:', error);
        return c.json(
            {
                success: false,
                error: 'Failed to generate architecture',
                details: error instanceof Error ? error.message : 'Unknown error',
            },
            500
        );
    }
});

export default architectureRoute;
