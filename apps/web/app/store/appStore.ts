'use client';

import { create } from 'zustand';
import { Plan, Phase, Step, Screen } from '../types/schemas';
import { generatePlan } from '../utils/planGenerator';
import { executePlan } from '../utils/executor';

interface AppState {
    // Current screen
    currentScreen: Screen;
    setCurrentScreen: (screen: Screen) => void;

    // Intent input
    intent: string;
    setIntent: (intent: string) => void;

    // Plan
    plan: Plan | null;
    generatePlanFromIntent: () => void;

    // Plan editing
    toggleStep: (phaseId: string, stepId: string) => void;
    updateStepDescription: (phaseId: string, stepId: string, description: string) => void;
    reorderPhases: (fromIndex: number, toIndex: number) => void;

    // Execution
    isExecuting: boolean;
    executionProgress: number;
    executePlanSteps: () => Promise<void>;
    updateStepStatus: (phaseId: string, stepId: string, update: Partial<Step>) => void;

    // Reset
    reset: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
    // Initial state
    currentScreen: 'intent',
    intent: '',
    plan: null,
    isExecuting: false,
    executionProgress: 0,

    // Actions
    setCurrentScreen: (screen) => set({ currentScreen: screen }),

    setIntent: (intent) => set({ intent }),

    generatePlanFromIntent: () => {
        const { intent } = get();
        if (!intent.trim()) return;

        const newPlan = generatePlan(intent);
        set({ plan: newPlan, currentScreen: 'planning' });
    },

    toggleStep: (phaseId, stepId) => {
        const { plan } = get();
        if (!plan) return;

        const updatedPhases = plan.phases.map((phase) => {
            if (phase.id !== phaseId) return phase;

            return {
                ...phase,
                steps: phase.steps.map((step) =>
                    step.id === stepId ? { ...step, enabled: !step.enabled } : step
                ),
            };
        });

        set({ plan: { ...plan, phases: updatedPhases } });
    },

    updateStepDescription: (phaseId, stepId, description) => {
        const { plan } = get();
        if (!plan) return;

        const updatedPhases = plan.phases.map((phase) => {
            if (phase.id !== phaseId) return phase;

            return {
                ...phase,
                steps: phase.steps.map((step) =>
                    step.id === stepId ? { ...step, description } : step
                ),
            };
        });

        set({ plan: { ...plan, phases: updatedPhases } });
    },

    reorderPhases: (fromIndex, toIndex) => {
        const { plan } = get();
        if (!plan) return;

        const phases = [...plan.phases];
        const [removed] = phases.splice(fromIndex, 1);
        phases.splice(toIndex, 0, removed);

        set({ plan: { ...plan, phases } });
    },

    updateStepStatus: (phaseId, stepId, update) => {
        const { plan } = get();
        if (!plan) return;

        const updatedPhases = plan.phases.map((phase) => {
            if (phase.id !== phaseId) return phase;

            return {
                ...phase,
                steps: phase.steps.map((step) =>
                    step.id === stepId ? { ...step, ...update } : step
                ),
            };
        });

        set({ plan: { ...plan, phases: updatedPhases } });

        // Update progress
        const totalSteps = plan.phases.reduce(
            (acc, phase) => acc + phase.steps.filter(s => s.enabled).length,
            0
        );
        const completedSteps = updatedPhases.reduce(
            (acc, phase) => acc + phase.steps.filter(s => s.enabled && s.status === 'completed').length,
            0
        );
        const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;
        set({ executionProgress: progress });
    },

    executePlanSteps: async () => {
        const { plan, updateStepStatus } = get();
        if (!plan) return;

        set({ isExecuting: true, currentScreen: 'execution', executionProgress: 0 });

        await executePlan(plan.phases, (phaseId, stepId, update) => {
            updateStepStatus(phaseId, stepId, update);
        });

        set({ isExecuting: false });
    },

    reset: () => {
        set({
            currentScreen: 'intent',
            intent: '',
            plan: null,
            isExecuting: false,
            executionProgress: 0,
        });
    },
}));
