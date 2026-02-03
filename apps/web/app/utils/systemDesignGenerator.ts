/**
 * System Design Generator Utility
 * Integrates with the backend API to generate system architecture
 */

import { apiClient, type SystemDesignResponse } from './apiClient';

export interface SystemDesignPlan {
  architecture: SystemDesignResponse['architecture'];
  summary: {
    systemType: string;
    scalability: string;
    complexity: string;
    estimatedCost: string;
  };
}

/**
 * Generate a complete system design architecture
 */
export async function generateSystemDesign(userPrompt: string): Promise<SystemDesignPlan> {
  try {
    // Call the backend API to generate architecture
    const response = await apiClient.generateArchitecture(userPrompt);
    
    // Generate summary based on the architecture
    const summary = generateSummary(response.architecture);
    
    return {
      architecture: response.architecture,
      summary,
    };
  } catch (error) {
    console.error('Failed to generate system design:', error);
    throw new Error(
      error instanceof Error 
        ? error.message 
        : 'Failed to generate system design. Please try again.'
    );
  }
}

/**
 * Generate a summary of the system design
 */
function generateSummary(architecture: SystemDesignResponse['architecture']) {
  const serviceCount = architecture.application_layer.services.length;
  const hasRealTime = architecture.application_layer.services.some(
    s => s.name.toLowerCase().includes('websocket')
  );
  const dbType = architecture.data_layer.primary_database.type;
  
  // Determine system type
  let systemType = 'Web Application';
  if (hasRealTime) systemType = 'Real-time Application';
  if (serviceCount > 3) systemType = 'Microservices Architecture';
  
  // Determine scalability
  const rps = architecture.problem_context.scale_assumptions.requests_per_second;
  let scalability = 'Low to Medium';
  if (rps.includes('10K') || rps.includes('50K')) scalability = 'High';
  if (rps.includes('100K')) scalability = 'Very High';
  
  // Determine complexity
  let complexity = 'Medium';
  if (serviceCount <= 2) complexity = 'Low';
  if (serviceCount > 4 || hasRealTime) complexity = 'High';
  
  // Estimate cost (rough estimate)
  let estimatedCost = '$500-2000/month';
  if (scalability === 'High') estimatedCost = '$2000-10000/month';
  if (scalability === 'Very High') estimatedCost = '$10000+/month';
  
  return {
    systemType,
    scalability,
    complexity,
    estimatedCost,
  };
}

/**
 * Format architecture for display
 */
export function formatArchitectureForDisplay(architecture: SystemDesignResponse['architecture']) {
  return {
    overview: {
      title: 'System Overview',
      items: [
        { label: 'Use Case', value: architecture.problem_context.use_case },
        { label: 'Expected Users', value: architecture.problem_context.scale_assumptions.users },
        { label: 'Peak RPS', value: architecture.problem_context.scale_assumptions.requests_per_second },
        { label: 'Data Growth', value: architecture.problem_context.scale_assumptions.data_growth },
      ],
    },
    infrastructure: {
      title: 'Infrastructure',
      items: [
        { label: 'CDN', value: architecture.entry_layer.cdn.provider },
        { label: 'Load Balancer', value: architecture.traffic_management.load_balancer.tool },
        { label: 'Rate Limiting', value: architecture.traffic_management.rate_limiter.strategy },
        { label: 'Cache', value: architecture.caching_layer.tool },
      ],
    },
    services: {
      title: 'Application Services',
      items: architecture.application_layer.services.map(s => ({
        label: s.name,
        value: s.responsibility,
      })),
    },
    database: {
      title: 'Data Layer',
      items: [
        { label: 'Database Type', value: architecture.data_layer.primary_database.type },
        { label: 'Database', value: architecture.data_layer.primary_database.tool },
        { label: 'Replication', value: architecture.data_layer.primary_database.replication },
        { label: 'Read Replicas', value: `${architecture.data_layer.read_replicas.count} replicas` },
      ],
    },
    observability: {
      title: 'Observability',
      items: [
        { label: 'Logging', value: architecture.observability.logging },
        { label: 'Metrics', value: architecture.observability.metrics },
        { label: 'Tracing', value: architecture.observability.tracing },
        { label: 'Alerting', value: architecture.observability.alerting },
      ],
    },
  };
}

/**
 * Extract key technologies from architecture
 */
export function extractTechStack(architecture: SystemDesignResponse['architecture']): string[] {
  const technologies = new Set<string>();
  
  // Add infrastructure
  technologies.add(architecture.entry_layer.cdn.provider.split('/')[0].trim());
  technologies.add(architecture.traffic_management.load_balancer.tool.split('/')[0].trim());
  technologies.add(architecture.caching_layer.tool.split(' ')[0]);
  
  // Add database
  technologies.add(architecture.data_layer.primary_database.tool.split('/')[0].trim());
  
  // Add message queue
  technologies.add(architecture.background_processing.message_queue.tool.split('/')[0].trim());
  
  // Add observability tools
  technologies.add(architecture.observability.logging.split(' ')[0]);
  technologies.add(architecture.observability.metrics.split(' ')[0]);
  
  return Array.from(technologies);
}
