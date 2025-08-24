const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3003';

export interface CreateTicketRequest {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  reporter_id?: string;
  tags?: string[];
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  assignee_id?: string;
  reporter_id: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  ai_analysis?: {
    category: string;
    category_confidence: number;
    sentiment: string;
    sentiment_confidence: number;
    detected_language: string;
    processing_time_ms: number;
  };
}

export interface ListTicketsResponse {
  tickets: Ticket[];
  pagination: {
    total_count: number;
    page: number;
    page_size: number;
    total_pages: number;
  };
}

export interface ApiError {
  error: string;
  message: string;
  timestamp: string;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || `HTTP error! status: ${response.status}`
        );
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Ticket API methods
  async createTicket(ticket: CreateTicketRequest): Promise<Ticket> {
    return this.request<Ticket>('/api/v1/tickets', {
      method: 'POST',
      body: JSON.stringify(ticket),
    });
  }

  async getTicket(id: string): Promise<Ticket> {
    return this.request<Ticket>(`/api/v1/tickets/${id}`);
  }

  async listTickets(
    options: {
      page?: number;
      page_size?: number;
      status?: string;
      priority?: string;
      assignee_id?: string;
    } = {}
  ): Promise<ListTicketsResponse> {
    const params = new URLSearchParams();

    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });

    const query = params.toString();
    const endpoint = `/api/v1/tickets${query ? `?${query}` : ''}`;

    return this.request<ListTicketsResponse>(endpoint);
  }

  async testConnection(): Promise<{ status: string; message: string }> {
    return this.request<{ status: string; message: string }>(
      '/api/v1/tickets/test'
    );
  }
}

export const apiClient = new ApiClient();
