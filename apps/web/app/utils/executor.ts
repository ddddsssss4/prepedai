// Simulated execution engine
// Processes steps sequentially with realistic delays and status updates

import { Phase, Step, ExecutionStatus } from '../types/schemas';

export interface ExecutionUpdate {
    phaseId: string;
    stepId: string;
    status: ExecutionStatus;
    result?: string;
}

// Simulated delay ranges (in ms) for each status
const DELAYS = {
    running: 800,
    completed: 1200,
    error: 1000,
};

// Random chance of error (5%)
const ERROR_CHANCE = 0.05;

/**
 * Execute a single step with simulated delay
 */
async function executeStep(
    step: Step,
    onUpdate: (update: Partial<Step>) => void
): Promise<void> {
    // Mark as running
    onUpdate({ status: 'running' });
    await delay(DELAYS.running);

    // Simulate random failures
    if (Math.random() < ERROR_CHANCE) {
        onUpdate({
            status: 'error',
            result: 'Execution failed: Simulated error for demonstration',
        });
        await delay(DELAYS.error);
        return;
    }

    // Mark as completed
    onUpdate({
        status: 'completed',
        result: 'Successfully completed',
    });
    await delay(DELAYS.completed);
}

/**
 * Execute all enabled steps in sequence
 * Calls onUpdate for each step status change
 */
export async function executePlan(
    phases: Phase[],
    onUpdate: (phaseId: string, stepId: string, update: Partial<Step>) => void
): Promise<void> {
    for (const phase of phases) {
        for (const step of phase.steps) {
            // Skip disabled steps
            if (!step.enabled) {
                continue;
            }

            await executeStep(step, (update) => {
                onUpdate(phase.id, step.id, update);
            });

            // Stop execution if step failed
            if (step.status === 'error') {
                return;
            }
        }
    }
}

/**
 * Utility delay function
 */
function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
