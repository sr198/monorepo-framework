import { FastifyPluginAsync } from 'fastify';
import { TicketService } from '../../services/ticketService';

// Initialize ticket service
const ticketService = new TicketService();

// Request/Response schemas
const createTicketSchema = {
  body: {
    type: 'object',
    required: ['title', 'description'],
    properties: {
      title: { type: 'string', minLength: 1, maxLength: 200 },
      description: { type: 'string', minLength: 1, maxLength: 2000 },
      priority: {
        type: 'string',
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium',
      },
      reporter_id: { type: 'string' },
      tags: {
        type: 'array',
        items: { type: 'string' },
        maxItems: 10,
      },
    },
  },
  response: {
    201: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        title: { type: 'string' },
        description: { type: 'string' },
        priority: { type: 'string' },
        status: { type: 'string' },
        assignee_id: { type: 'string' },
        reporter_id: { type: 'string' },
        tags: { type: 'array', items: { type: 'string' } },
        created_at: { type: 'string' },
        updated_at: { type: 'string' },
        ai_analysis: {
          type: 'object',
          properties: {
            category: { type: 'string' },
            category_confidence: { type: 'number' },
            sentiment: { type: 'string' },
            sentiment_confidence: { type: 'number' },
            detected_language: { type: 'string' },
            processing_time_ms: { type: 'number' },
          },
        },
      },
    },
  },
};

const getTicketSchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string' },
    },
  },
};

const listTicketsSchema = {
  querystring: {
    type: 'object',
    properties: {
      page: { type: 'integer', minimum: 1, default: 1 },
      page_size: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
      status: {
        type: 'string',
        enum: ['open', 'in_progress', 'resolved', 'closed'],
      },
      priority: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
      assignee_id: { type: 'string' },
    },
  },
};

const ticketRoutes: FastifyPluginAsync = async function (fastify) {
  // Test gRPC connection
  fastify.get('/api/v1/tickets/test', async function (request, reply) {
    try {
      const message = await ticketService.testConnection();
      return {
        status: 'success',
        message,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      reply.code(500);
      return {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  });

  // Create a new ticket
  fastify.post(
    '/api/v1/tickets',
    { schema: createTicketSchema },
    async function (request, reply) {
      try {
        const body = request.body as {
          title: string;
          description: string;
          priority?: 'low' | 'medium' | 'high' | 'critical';
          reporter_id?: string;
          tags?: string[];
        };

        console.log('[API Gateway] Creating ticket:', body.title);

        const ticket = await ticketService.createTicket(body);

        reply.code(201);
        return ticket;
      } catch (error) {
        console.error('[API Gateway] Error creating ticket:', error);
        reply.code(500);
        return {
          error: 'Failed to create ticket',
          message: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString(),
        };
      }
    }
  );

  // Get a specific ticket
  fastify.get(
    '/api/v1/tickets/:id',
    { schema: getTicketSchema },
    async function (request, reply) {
      try {
        const params = request.params as { id: string };
        const ticket = await ticketService.getTicket(params.id);

        return ticket;
      } catch (error) {
        console.error('[API Gateway] Error getting ticket:', error);

        if (error instanceof Error && error.message.includes('not found')) {
          reply.code(404);
          return {
            error: 'Ticket not found',
            message: error.message,
            timestamp: new Date().toISOString(),
          };
        }

        reply.code(500);
        return {
          error: 'Failed to get ticket',
          message: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString(),
        };
      }
    }
  );

  // List tickets with pagination and filtering
  fastify.get(
    '/api/v1/tickets',
    { schema: listTicketsSchema },
    async function (request, reply) {
      try {
        const query = request.query as {
          page?: number;
          page_size?: number;
          status?: string;
          priority?: string;
          assignee_id?: string;
        };

        console.log('[API Gateway] Listing tickets with filters:', query);

        const result = await ticketService.listTickets(query);

        return result;
      } catch (error) {
        console.error('[API Gateway] Error listing tickets:', error);
        reply.code(500);
        return {
          error: 'Failed to list tickets',
          message: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString(),
        };
      }
    }
  );

  // Health check for tickets API
  fastify.get('/api/v1/tickets/health', async function (request, reply) {
    try {
      // Test both the API Gateway and gRPC connection
      const grpcMessage = await ticketService.testConnection();

      return {
        status: 'healthy',
        service: 'tickets-api',
        grpc_connection: 'connected',
        grpc_message: grpcMessage,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      reply.code(503);
      return {
        status: 'unhealthy',
        service: 'tickets-api',
        grpc_connection: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  });
};

export default ticketRoutes;
