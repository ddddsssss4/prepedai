'use client';

import { create } from 'zustand';
import { Plan, Phase, Step, Screen, Clarification, ClarificationStatus } from '../types/schemas';
import { generatePlan } from '../utils/planGenerator';
import { executePlan } from '../utils/executor';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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

    // Clarification flow
    clarifications: Clarification[];
    clarificationStatus: ClarificationStatus;
    clarificationError: string | null;
    fetchClarifyingQuestions: () => Promise<void>;
    updateClarificationAnswer: (index: number, answer: string) => void;
    submitClarificationsAndGenerateArchitecture: () => Promise<void>;

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
    clarifications: [],
    clarificationStatus: 'idle',
    clarificationError: null,

    // Actions
    setCurrentScreen: (screen) => set({ currentScreen: screen }),

    setIntent: (intent) => set({ intent }),

    generatePlanFromIntent: () => {
        const { intent } = get();
        if (!intent.trim()) return;

        const newPlan = generatePlan(intent);
        set({ plan: newPlan, currentScreen: 'planning' });
    },

    // Clarification flow - ALL from LLM, no fallbacks
    fetchClarifyingQuestions: async () => {
        const { intent } = get();
        if (!intent.trim()) return;

        set({ clarificationStatus: 'loading', clarificationError: null });

        try {
            const response = await fetch(`${API_BASE_URL}/api/clarify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: intent }),
            });

            const data = await response.json();

            if (data.success && data.questions && data.questions.length > 0) {
                const clarifications: Clarification[] = data.questions.map((q: string) => ({
                    question: q,
                    answer: '',
                }));
                set({ clarifications, clarificationStatus: 'ready', clarificationError: null });
            } else {
                // No fallback - show error
                set({
                    clarifications: [],
                    clarificationStatus: 'ready',
                    clarificationError: data.error || 'Failed to generate questions. Is LM Studio running?',
                });
            }
        } catch (error) {
            console.error('Failed to fetch clarifying questions:', error);
            set({
                clarifications: [],
                clarificationStatus: 'ready',
                clarificationError: error instanceof Error
                    ? `LLM Error: ${error.message}`
                    : 'Failed to connect to LLM. Make sure LM Studio is running on localhost:1234',
            });
        }
    },

    updateClarificationAnswer: (index, answer) => {
        const { clarifications } = get();
        const updated = [...clarifications];
        if (updated[index]) {
            updated[index] = { ...updated[index], answer };
        }
        set({ clarifications: updated });
    },

    submitClarificationsAndGenerateArchitecture: async () => {
        const { intent, clarifications, plan } = get();

        set({ clarificationStatus: 'loading', clarificationError: null });

        try {
            const response = await fetch(`${API_BASE_URL}/api/architecture`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: intent,
                    clarifications: clarifications.filter(c => c.answer?.trim()),
                }),
            });

            const data = await response.json();

            if (data.success && data.architecture) {
                const arch = data.architecture;

                // Generate the base plan first if not exists
                const basePlan = plan || generatePlan(intent);

                // Update plan with real architecture data from LLM
                const updatedPlan: Plan = {
                    ...basePlan,
                    clarifications,
                    clarificationStatus: 'completed',
                    architecture: {
                        diagram: arch.mermaid_diagram || '',
                        patterns: arch.api_gateway?.responsibilities || [],
                        tradeoffs: arch.tradeoffs?.map((t: { decision: string; reason: string }) =>
                            `${t.decision}: ${t.reason}`
                        ) || [],
                    },
                    database: {
                        diagram: '', // Will be generated separately
                        models: [
                            {
                                name: arch.data_layer?.primary_database?.tool || 'Database',
                                fields: [
                                    `Type: ${arch.data_layer?.primary_database?.type}`,
                                    `Replication: ${arch.data_layer?.primary_database?.replication}`,
                                ],
                            },
                        ],
                    },
                    api: {
                        endpoints: arch.application_layer?.services?.map((s: { name: string; responsibility: string }) => ({
                            method: 'GET' as const,
                            path: `/api/${s.name.toLowerCase().replace(/\s/g, '-')}`,
                            description: s.responsibility,
                        })) || [],
                    },
                    techStack: [
                        ...(arch.caching_layer?.tool ? [{ category: 'Cache', name: arch.caching_layer.tool, reason: 'Caching layer' }] : []),
                        ...(arch.data_layer?.primary_database?.tool ? [{ category: 'Database', name: arch.data_layer.primary_database.tool, reason: arch.data_layer.primary_database.type }] : []),
                        ...(arch.traffic_management?.load_balancer?.tool ? [{ category: 'Infrastructure', name: arch.traffic_management.load_balancer.tool, reason: 'Load balancing' }] : []),
                        ...(arch.background_processing?.message_queue?.tool ? [{ category: 'Messaging', name: arch.background_processing.message_queue.tool, reason: 'Async processing' }] : []),
                    ],
                };

                set({
                    plan: updatedPlan,
                    clarificationStatus: 'completed',
                    clarificationError: null,
                });
            } else {
                // No fallback - show error
                set({
                    clarificationStatus: 'completed',
                    clarificationError: data.error || 'Failed to generate architecture. Check LM Studio.',
                });
            }
        } catch (error) {
            console.error('Failed to generate architecture:', error);
            set({
                clarificationStatus: 'completed',
                clarificationError: error instanceof Error
                    ? `Architecture Error: ${error.message}`
                    : 'Failed to connect to LLM for architecture generation.',
            });
        }
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
        if (removed) {
            phases.splice(toIndex, 0, removed);
        }

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
            clarifications: [],
            clarificationStatus: 'idle',
            clarificationError: null,
        });
    },
}));
