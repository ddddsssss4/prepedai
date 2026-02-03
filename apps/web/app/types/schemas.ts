// Type definitions and Zod schemas for Traycer AI

import { z } from 'zod';

// Execution status for steps
export const ExecutionStatusSchema = z.enum(['pending', 'running', 'completed', 'error']);
export type ExecutionStatus = z.infer<typeof ExecutionStatusSchema>;

// Risk levels for phases
export const RiskLevelSchema = z.enum(['low', 'medium', 'high']);
export type RiskLevel = z.infer<typeof RiskLevelSchema>;

// Architecture Schema
export const ArchitectureSchema = z.object({
  diagram: z.string(), // Mermaid chart string
  patterns: z.array(z.string()),
  tradeoffs: z.array(z.string()),
});

// Database Schema
export const DatabaseSchema = z.object({
  diagram: z.string(), // Mermaid ER dictionary
  models: z.array(z.object({
    name: z.string(),
    fields: z.array(z.string()),
  })),
});

// API Schema
export const ApiEndpointSchema = z.object({
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE']),
  path: z.string(),
  description: z.string(),
});
export const ApiSchema = z.object({
  endpoints: z.array(ApiEndpointSchema),
});

// Tech Stack Schema
export const TechItemSchema = z.object({
  category: z.string(), // Frontend, Backend, Database, DevOps
  name: z.string(),
  icon: z.string().optional(),
  reason: z.string(),
});
export const TechStackSchema = z.array(TechItemSchema);

// Coding Agent Schema for phase assignment
export const CodingAgentSchema = z.enum(['gemini', 'claude', 'gpt4', 'manual']);
export type CodingAgent = z.infer<typeof CodingAgentSchema>;

// Step schema
export const StepSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  detailedDescription: z.string().optional(), // Extended explanation for dialog
  enabled: z.boolean().default(true),
  status: ExecutionStatusSchema.default('pending'),
  result: z.string().optional(),
});
export type Step = z.infer<typeof StepSchema>;

// Phase schema
export const PhaseSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  risk: RiskLevelSchema,
  steps: z.array(StepSchema),
  filesInvolved: z.array(z.string()).optional(),
  assignedAgent: CodingAgentSchema.optional(), // Which AI agent to use
});
export type Phase = z.infer<typeof PhaseSchema>;

// Clarification Q&A Schema
export const ClarificationSchema = z.object({
  question: z.string(),
  answer: z.string().optional(),
});
export type Clarification = z.infer<typeof ClarificationSchema>;

// Clarification status for the planning flow
export const ClarificationStatusSchema = z.enum(['idle', 'loading', 'ready', 'completed']);
export type ClarificationStatus = z.infer<typeof ClarificationStatusSchema>;

// Complete plan schema
export const PlanSchema = z.object({
  id: z.string(),
  intent: z.string(),
  phases: z.array(PhaseSchema),
  architecture: ArchitectureSchema.optional(),
  database: DatabaseSchema.optional(),
  api: ApiSchema.optional(),
  techStack: TechStackSchema.optional(),
  clarifications: z.array(ClarificationSchema).optional(),
  clarificationStatus: ClarificationStatusSchema.optional(),
  createdAt: z.date().default(() => new Date()),
});
export type Plan = z.infer<typeof PlanSchema>;

// Intent schema
export const IntentSchema = z.object({
  text: z.string().min(10, 'Intent must be at least 10 characters'),
});
export type Intent = z.infer<typeof IntentSchema>;

// App screen types
export type Screen = 'intent' | 'planning' | 'execution';
