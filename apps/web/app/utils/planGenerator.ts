// Mock plan generator utility
// Generates structured plans based on user intent

import { nanoid } from 'nanoid';
import { Plan, Phase } from '../types/schemas';

// Template keywords and their associated plans
const templates: Record<string, Partial<Plan>> = {
    authentication: {
        phases: [
            {
                id: nanoid(),
                name: 'Analysis',
                description: 'Analyze existing codebase and determine auth strategy',
                risk: 'low',
                steps: [
                    {
                        id: nanoid(),
                        description: 'Review existing routes and components',
                        enabled: true,
                        status: 'pending',
                    },
                    {
                        id: nanoid(),
                        description: 'Choose auth library (e.g., NextAuth, Auth0, Clerk)',
                        enabled: true,
                        status: 'pending',
                    },
                    {
                        id: nanoid(),
                        description: 'Design authentication flow',
                        enabled: true,
                        status: 'pending',
                    },
                ],
                filesInvolved: ['app/layout.tsx', 'app/api/auth/[...nextauth]/route.ts'],
            },
            {
                id: nanoid(),
                name: 'Backend Implementation',
                description: 'Set up authentication endpoints and middleware',
                risk: 'high',
                steps: [
                    {
                        id: nanoid(),
                        description: 'Install auth dependencies',
                        enabled: true,
                        status: 'pending',
                    },
                    {
                        id: nanoid(),
                        description: 'Create auth API routes',
                        enabled: true,
                        status: 'pending',
                    },
                    {
                        id: nanoid(),
                        description: 'Set up authentication middleware',
                        enabled: true,
                        status: 'pending',
                    },
                    {
                        id: nanoid(),
                        description: 'Configure session management',
                        enabled: true,
                        status: 'pending',
                    },
                ],
                filesInvolved: ['app/api/auth/[...nextauth]/route.ts', 'middleware.ts', 'lib/auth.ts'],
            },
            {
                id: nanoid(),
                name: 'Frontend Integration',
                description: 'Build login UI and protect routes',
                risk: 'medium',
                steps: [
                    {
                        id: nanoid(),
                        description: 'Create login/signup forms',
                        enabled: true,
                        status: 'pending',
                    },
                    {
                        id: nanoid(),
                        description: 'Add session provider to layout',
                        enabled: true,
                        status: 'pending',
                    },
                    {
                        id: nanoid(),
                        description: 'Implement route protection',
                        enabled: true,
                        status: 'pending',
                    },
                    {
                        id: nanoid(),
                        description: 'Add user profile component',
                        enabled: true,
                        status: 'pending',
                    },
                ],
                filesInvolved: ['app/login/page.tsx', 'app/components/AuthProvider.tsx'],
            },
            {
                id: nanoid(),
                name: 'Testing & Verification',
                description: 'Test authentication flows and edge cases',
                risk: 'medium',
                steps: [
                    {
                        id: nanoid(),
                        description: 'Test login/logout flow',
                        enabled: true,
                        status: 'pending',
                    },
                    {
                        id: nanoid(),
                        description: 'Test protected routes',
                        enabled: true,
                        status: 'pending',
                    },
                    {
                        id: nanoid(),
                        description: 'Verify session persistence',
                        enabled: true,
                        status: 'pending',
                    },
                ],
            },
        ],
    },

    refactor: {
        phases: [
            {
                id: nanoid(),
                name: 'Code Analysis',
                description: 'Identify code smells and refactoring opportunities',
                risk: 'low',
                steps: [
                    {
                        id: nanoid(),
                        description: 'Run linter and identify issues',
                        enabled: true,
                        status: 'pending',
                    },
                    {
                        id: nanoid(),
                        description: 'Identify duplicate code',
                        enabled: true,
                        status: 'pending',
                    },
                    {
                        id: nanoid(),
                        description: 'Map component dependencies',
                        enabled: true,
                        status: 'pending',
                    },
                ],
            },
            {
                id: nanoid(),
                name: 'Refactoring',
                description: 'Apply refactoring patterns and clean up code',
                risk: 'high',
                steps: [
                    {
                        id: nanoid(),
                        description: 'Extract reusable components',
                        enabled: true,
                        status: 'pending',
                    },
                    {
                        id: nanoid(),
                        description: 'Move shared logic to utilities',
                        enabled: true,
                        status: 'pending',
                    },
                    {
                        id: nanoid(),
                        description: 'Apply consistent naming conventions',
                        enabled: true,
                        status: 'pending',
                    },
                    {
                        id: nanoid(),
                        description: 'Remove dead code',
                        enabled: true,
                        status: 'pending',
                    },
                ],
            },
            {
                id: nanoid(),
                name: 'Verification',
                description: 'Ensure refactored code works correctly',
                risk: 'medium',
                steps: [
                    {
                        id: nanoid(),
                        description: 'Run existing tests',
                        enabled: true,
                        status: 'pending',
                    },
                    {
                        id: nanoid(),
                        description: 'Manual testing of affected features',
                        enabled: true,
                        status: 'pending',
                    },
                    {
                        id: nanoid(),
                        description: 'Performance testing',
                        enabled: true,
                        status: 'pending',
                    },
                ],
            },
        ],
    },

    feature: {
        phases: [
            {
                id: nanoid(),
                name: 'Planning',
                description: 'Define feature requirements and design',
                risk: 'low',
                steps: [
                    {
                        id: nanoid(),
                        description: 'Write feature specifications',
                        enabled: true,
                        status: 'pending',
                    },
                    {
                        id: nanoid(),
                        description: 'Design component architecture',
                        enabled: true,
                        status: 'pending',
                    },
                    {
                        id: nanoid(),
                        description: 'Identify dependencies and integrations',
                        enabled: true,
                        status: 'pending',
                    },
                ],
            },
            {
                id: nanoid(),
                name: 'Implementation',
                description: 'Build the new feature',
                risk: 'high',
                steps: [
                    {
                        id: nanoid(),
                        description: 'Create necessary components',
                        enabled: true,
                        status: 'pending',
                    },
                    {
                        id: nanoid(),
                        description: 'Implement business logic',
                        enabled: true,
                        status: 'pending',
                    },
                    {
                        id: nanoid(),
                        description: 'Add API endpoints if needed',
                        enabled: true,
                        status: 'pending',
                    },
                    {
                        id: nanoid(),
                        description: 'Style components',
                        enabled: true,
                        status: 'pending',
                    },
                ],
            },
            {
                id: nanoid(),
                name: 'Testing',
                description: 'Test the new feature thoroughly',
                risk: 'medium',
                steps: [
                    {
                        id: nanoid(),
                        description: 'Write unit tests',
                        enabled: true,
                        status: 'pending',
                    },
                    {
                        id: nanoid(),
                        description: 'Write integration tests',
                        enabled: true,
                        status: 'pending',
                    },
                    {
                        id: nanoid(),
                        description: 'Manual QA testing',
                        enabled: true,
                        status: 'pending',
                    },
                ],
            },
        ],
    },
};

// Default plan for generic requests
const defaultPlan: Partial<Plan> = {
    phases: [
        {
            id: nanoid(),
            name: 'Analysis',
            description: 'Understand the requirements and current codebase',
            risk: 'low',
            steps: [
                {
                    id: nanoid(),
                    description: 'Review existing code',
                    enabled: true,
                    status: 'pending',
                },
                {
                    id: nanoid(),
                    description: 'Identify affected files',
                    enabled: true,
                    status: 'pending',
                },
                {
                    id: nanoid(),
                    description: 'Plan implementation approach',
                    enabled: true,
                    status: 'pending',
                },
            ],
        },
        {
            id: nanoid(),
            name: 'Implementation',
            description: 'Execute the changes',
            risk: 'medium',
            steps: [
                {
                    id: nanoid(),
                    description: 'Make necessary code changes',
                    enabled: true,
                    status: 'pending',
                },
                {
                    id: nanoid(),
                    description: 'Update documentation',
                    enabled: true,
                    status: 'pending',
                },
            ],
        },
        {
            id: nanoid(),
            name: 'Verification',
            description: 'Test and validate changes',
            risk: 'low',
            steps: [
                {
                    id: nanoid(),
                    description: 'Test the changes',
                    enabled: true,
                    status: 'pending',
                },
                {
                    id: nanoid(),
                    description: 'Verify expected behavior',
                    enabled: true,
                    status: 'pending',
                },
            ],
        },
    ],
};

/**
 * Generates a plan based on user intent
 * Uses keyword matching to select appropriate template
 */
export function generatePlan(intent: string): Plan {
    const lowerIntent = intent.toLowerCase();

    let selectedTemplate = defaultPlan;

    // Match keywords to templates
    if (lowerIntent.includes('auth') || lowerIntent.includes('login') || lowerIntent.includes('signup')) {
        selectedTemplate = templates.authentication;
    } else if (lowerIntent.includes('refactor') || lowerIntent.includes('clean') || lowerIntent.includes('improve')) {
        selectedTemplate = templates.refactor;
    } else if (lowerIntent.includes('add') || lowerIntent.includes('create') || lowerIntent.includes('feature')) {
        selectedTemplate = templates.feature;
    }

    return {
        id: nanoid(),
        intent,
        phases: selectedTemplate.phases || [],
        createdAt: new Date(),
    };
}

/**
 * Suggested prompts for users
 */
export const suggestedPrompts = [
    'Add authentication to my web app',
    'Refactor the dashboard component',
    'Create a new user profile feature',
    'Fix the data fetching bug',
    'Add dark mode toggle',
    'Implement form validation',
];
