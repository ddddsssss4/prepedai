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
                        title: 'Review Config',
                        description: 'Review existing routes and components',
                        enabled: true,
                        status: 'pending',
                    },
                    {
                        id: nanoid(),
                        title: 'Select Strategy',
                        description: 'Choose auth library (e.g., NextAuth, Auth0, Clerk)',
                        enabled: true,
                        status: 'pending',
                    },
                    {
                        id: nanoid(),
                        title: 'Design Flow',
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
                        title: 'Dependencies',
                        description: 'Install auth dependencies',
                        enabled: true,
                        status: 'pending',
                    },
                    {
                        id: nanoid(),
                        title: 'API Routes',
                        description: 'Create auth API routes',
                        enabled: true,
                        status: 'pending',
                    },
                    {
                        id: nanoid(),
                        title: 'Middleware',
                        description: 'Set up authentication middleware',
                        enabled: true,
                        status: 'pending',
                    },
                    {
                        id: nanoid(),
                        title: 'Sessions',
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
                        title: 'Auth Forms',
                        description: 'Create login/signup forms',
                        enabled: true,
                        status: 'pending',
                    },
                    {
                        id: nanoid(),
                        title: 'Providers',
                        description: 'Add session provider to layout',
                        enabled: true,
                        status: 'pending',
                    },
                    {
                        id: nanoid(),
                        title: 'Protection',
                        description: 'Implement route protection',
                        enabled: true,
                        status: 'pending',
                    },
                    {
                        id: nanoid(),
                        title: 'User Profile',
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
                        title: 'Flow Test',
                        description: 'Test login/logout flow',
                        enabled: true,
                        status: 'pending',
                    },
                    {
                        id: nanoid(),
                        title: 'Route Test',
                        description: 'Test protected routes',
                        enabled: true,
                        status: 'pending',
                    },
                    {
                        id: nanoid(),
                        title: 'Persistence',
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
                        title: 'Linting',
                        description: 'Run linter and identify issues',
                        enabled: true,
                        status: 'pending',
                    },
                    {
                        id: nanoid(),
                        title: 'Deduplication',
                        description: 'Identify duplicate code',
                        enabled: true,
                        status: 'pending',
                    },
                    {
                        id: nanoid(),
                        title: 'Dependency Map',
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
                        title: 'Extraction',
                        description: 'Extract reusable components',
                        enabled: true,
                        status: 'pending',
                    },
                    {
                        id: nanoid(),
                        title: 'Shared Logic',
                        description: 'Move shared logic to utilities',
                        enabled: true,
                        status: 'pending',
                    },
                    {
                        id: nanoid(),
                        title: 'Conventions',
                        description: 'Apply consistent naming conventions',
                        enabled: true,
                        status: 'pending',
                    },
                    {
                        id: nanoid(),
                        title: 'Cleanup',
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
                        title: 'Unit Tests',
                        description: 'Run existing tests',
                        enabled: true,
                        status: 'pending',
                    },
                    {
                        id: nanoid(),
                        title: 'Manual QA',
                        description: 'Manual testing of affected features',
                        enabled: true,
                        status: 'pending',
                    },
                    {
                        id: nanoid(),
                        title: 'Performance',
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
                        title: 'Specs',
                        description: 'Write feature specifications',
                        enabled: true,
                        status: 'pending',
                    },
                    {
                        id: nanoid(),
                        title: 'Architecture',
                        description: 'Design component architecture',
                        enabled: true,
                        status: 'pending',
                    },
                    {
                        id: nanoid(),
                        title: 'Dependencies',
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
                        title: 'Components',
                        description: 'Create necessary components',
                        enabled: true,
                        status: 'pending',
                    },
                    {
                        id: nanoid(),
                        title: 'Logic',
                        description: 'Implement business logic',
                        enabled: true,
                        status: 'pending',
                    },
                    {
                        id: nanoid(),
                        title: 'API',
                        description: 'Add API endpoints if needed',
                        enabled: true,
                        status: 'pending',
                    },
                    {
                        id: nanoid(),
                        title: 'Styling',
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
                        title: 'Unit Tests',
                        description: 'Write unit tests',
                        enabled: true,
                        status: 'pending',
                    },
                    {
                        id: nanoid(),
                        title: 'Integration',
                        description: 'Write integration tests',
                        enabled: true,
                        status: 'pending',
                    },
                    {
                        id: nanoid(),
                        title: 'QA',
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
                    title: 'Review',
                    description: 'Review existing code',
                    enabled: true,
                    status: 'pending',
                },
                {
                    id: nanoid(),
                    title: 'Identification',
                    description: 'Identify affected files',
                    enabled: true,
                    status: 'pending',
                },
                {
                    id: nanoid(),
                    title: 'Planning',
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
                    title: 'Implementation',
                    description: 'Make necessary code changes',
                    enabled: true,
                    status: 'pending',
                },
                {
                    id: nanoid(),
                    title: 'Documentation',
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
                    title: 'Testing',
                    description: 'Test the changes',
                    enabled: true,
                    status: 'pending',
                },
                {
                    id: nanoid(),
                    title: 'Verification',
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
        architecture: selectedTemplate.architecture,
        database: selectedTemplate.database,
        api: selectedTemplate.api,
        techStack: selectedTemplate.techStack,
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
