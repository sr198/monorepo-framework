import { grpcClients } from '../grpc/clients';

// Request/Response types
export interface CreateTicketRequest {
  title: string;
  description: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  reporter_id?: string;
  tags?: string[];
}

export interface TicketResponse {
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
  tickets: TicketResponse[];
  pagination: {
    total_count: number;
    page: number;
    page_size: number;
    total_pages: number;
  };
}

// Map priority strings to proto enum values
const priorityMap = {
  low: 'PRIORITY_LOW',
  medium: 'PRIORITY_MEDIUM',
  high: 'PRIORITY_HIGH',
  critical: 'PRIORITY_CRITICAL',
};

export class TicketService {
  async createTicket(request: CreateTicketRequest): Promise<TicketResponse> {
    return new Promise((resolve, reject) => {
      const grpcRequest = {
        title: request.title,
        description: request.description,
        priority: priorityMap[request.priority || 'medium'],
        reporter_id: request.reporter_id || 'anonymous',
        tags: request.tags || [],
        due_date: null, // Optional field
      };

      console.log('[API Gateway] Creating ticket via gRPC:', grpcRequest);

      const client = grpcClients.getTicketServiceClient();
      client.CreateTicket(grpcRequest, (error, response) => {
        if (error) {
          console.error('[API Gateway] gRPC Error creating ticket:', error);
          reject(new Error(`Failed to create ticket: ${error.message}`));
          return;
        }

        if (response.error && response.error.code) {
          console.error('[API Gateway] Service Error:', response.error);
          reject(new Error(`Service error: ${response.error.message}`));
          return;
        }

        const ticket = response.ticket;
        console.log('[API Gateway] Ticket created successfully:', ticket.id);

        // Transform gRPC response to REST format
        const restResponse: TicketResponse = {
          id: ticket.id,
          title: ticket.title,
          description: ticket.description,
          priority: ticket.priority.replace('PRIORITY_', '').toLowerCase(),
          status: ticket.status.replace('STATUS_', '').toLowerCase(),
          assignee_id: ticket.assignee_id,
          reporter_id: ticket.reporter_id,
          tags: ticket.tags,
          created_at: new Date(ticket.created_at.seconds * 1000).toISOString(),
          updated_at: new Date(ticket.updated_at.seconds * 1000).toISOString(),
        };

        // Include AI analysis if present
        if (ticket.ai_analysis) {
          restResponse.ai_analysis = {
            category: ticket.ai_analysis.category,
            category_confidence: ticket.ai_analysis.category_confidence,
            sentiment: ticket.ai_analysis.sentiment,
            sentiment_confidence: ticket.ai_analysis.sentiment_confidence,
            detected_language: ticket.ai_analysis.detected_language,
            processing_time_ms: ticket.ai_analysis.processing_time_ms,
          };
        }

        resolve(restResponse);
      });
    });
  }

  async getTicket(id: string): Promise<TicketResponse> {
    return new Promise((resolve, reject) => {
      const grpcRequest = { id };

      console.log('[API Gateway] Getting ticket via gRPC:', id);

      const client = grpcClients.getTicketServiceClient();
      client.GetTicket(grpcRequest, (error, response) => {
        if (error) {
          console.error('[API Gateway] gRPC Error getting ticket:', error);
          reject(new Error(`Failed to get ticket: ${error.message}`));
          return;
        }

        if (response.error && response.error.code) {
          if (response.error.code === 'NOT_FOUND') {
            reject(new Error(`Ticket with ID ${id} not found`));
          } else {
            reject(new Error(`Service error: ${response.error.message}`));
          }
          return;
        }

        const ticket = response.ticket;
        const restResponse: TicketResponse = {
          id: ticket.id,
          title: ticket.title,
          description: ticket.description,
          priority: ticket.priority.replace('PRIORITY_', '').toLowerCase(),
          status: ticket.status.replace('STATUS_', '').toLowerCase(),
          assignee_id: ticket.assignee_id,
          reporter_id: ticket.reporter_id,
          tags: ticket.tags,
          created_at: new Date(ticket.created_at.seconds * 1000).toISOString(),
          updated_at: new Date(ticket.updated_at.seconds * 1000).toISOString(),
        };

        resolve(restResponse);
      });
    });
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
    return new Promise((resolve, reject) => {
      const grpcRequest = {
        pagination: {
          page: options.page || 1,
          page_size: options.page_size || 10,
          sort_by: 'created_at',
          sort_order: 'desc',
        },
        status: options.status
          ? `STATUS_${options.status.toUpperCase()}`
          : undefined,
        priority: options.priority
          ? `PRIORITY_${options.priority.toUpperCase()}`
          : undefined,
        assignee_id: options.assignee_id || undefined,
      };

      console.log('[API Gateway] Listing tickets via gRPC');

      const client = grpcClients.getTicketServiceClient();
      client.ListTickets(grpcRequest, (error, response) => {
        if (error) {
          console.error('[API Gateway] gRPC Error listing tickets:', error);
          reject(new Error(`Failed to list tickets: ${error.message}`));
          return;
        }

        if (response.error && response.error.code) {
          reject(new Error(`Service error: ${response.error.message}`));
          return;
        }

        const tickets = response.tickets.map((ticket: any) => ({
          id: ticket.id,
          title: ticket.title,
          description: ticket.description,
          priority: ticket.priority.replace('PRIORITY_', '').toLowerCase(),
          status: ticket.status.replace('STATUS_', '').toLowerCase(),
          assignee_id: ticket.assignee_id,
          reporter_id: ticket.reporter_id,
          tags: ticket.tags,
          created_at: new Date(ticket.created_at.seconds * 1000).toISOString(),
          updated_at: new Date(ticket.updated_at.seconds * 1000).toISOString(),
        }));

        const restResponse: ListTicketsResponse = {
          tickets,
          pagination: {
            total_count: response.pagination.total_count,
            page: response.pagination.page,
            page_size: response.pagination.page_size,
            total_pages: response.pagination.total_pages,
          },
        };

        resolve(restResponse);
      });
    });
  }

  async testConnection(): Promise<string> {
    return new Promise((resolve, reject) => {
      const grpcRequest = { name: 'API Gateway' };

      console.log('[API Gateway] Testing gRPC connection to Ticket Service');

      const client = grpcClients.getTicketServiceClient();
      client.Hello(grpcRequest, (error, response) => {
        if (error) {
          console.error('[API Gateway] gRPC Connection Error:', error);
          reject(new Error(`Connection failed: ${error.message}`));
          return;
        }

        console.log(
          '[API Gateway] gRPC Connection successful:',
          response.message
        );
        resolve(response.message);
      });
    });
  }
}
