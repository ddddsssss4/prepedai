/**
 * API Client for PrepedAI Backend
 * Handles communication with the architecture generation API
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface SystemDesignRequest {
  prompt: string;
}

export interface SystemDesignResponse {
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
        enabled: true;
        provider: string;
        cached_assets: string[];
      };
      tls_termination: string;
    };
    traffic_management: {
      load_balancer: {
        type: 'L4' | 'L7';
        tool: string;
      };
      rate_limiter: {
        enabled: true;
        strategy: 'token_bucket' | 'leaky_bucket' | 'fixed_window';
        location: 'cdn' | 'gateway' | 'app';
      };
    };
    api_gateway: {
      enabled: true;
      responsibilities: string[];
    };
    application_layer: {
      services: Array<{
        name: string;
        responsibility: string;
        scaling: 'horizontal' | 'vertical';
      }>;
    };
    background_processing: {
      message_queue: {
        tool: string;
        use_cases: string[];
      };
      cron_jobs: Array<{
        name: string;
        schedule: string;
        task: string;
      }>;
    };
    caching_layer: {
      tool: string;
      use_cases: string[];
      eviction_policy: 'LRU' | 'LFU';
    };
    data_layer: {
      primary_database: {
        type: 'SQL' | 'NoSQL';
        tool: string;
        replication: string;
        sharding: string;
      };
      read_replicas: {
        enabled: true;
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
        at_rest: true;
        in_transit: true;
      };
    };
    failure_handling: {
      circuit_breaker: true;
      retries: {
        enabled: true;
        strategy: string;
      };
      fallbacks: string[];
    };
    mermaid_diagram: string;
    tradeoffs: Array<{
      decision: string;
      reason: string;
    }>;
  };
}

export class APIClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  /**
   * Generate system architecture based on user prompt
   */
  async generateArchitecture(prompt: string): Promise<SystemDesignResponse> {
    const response = await fetch(`${this.baseURL}/api/architecture/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Check API health status
   */
  async healthCheck(): Promise<{ status: string; timestamp: string; service: string }> {
    const response = await fetch(`${this.baseURL}/api/architecture/health`);

    if (!response.ok) {
      throw new Error(`Health check failed: ${response.statusText}`);
    }

    return response.json();
  }
}

// Export singleton instance
export const apiClient = new APIClient();
