// Type definitions and Zod schemas for Traycer AI

import { z } from 'zod';

// Execution status for steps
export const ExecutionStatusSchema = z.enum(['pending', 'running', 'completed', 'error']);
export type ExecutionStatus = z.infer<typeof ExecutionStatusSchema>;

// Risk levels for phases
export const RiskLevelSchema = z.enum(['low', 'medium', 'high']);
export type RiskLevel = z.infer<typeof RiskLevelSchema>;

// Step schema
export const StepSchema = z.object({
  id: z.string(),
  description: z.string(),
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
});
export type Phase = z.infer<typeof PhaseSchema>;

// Complete plan schema
export const PlanSchema = z.object({
  id: z.string(),
  intent: z.string(),
  phases: z.array(PhaseSchema),
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
