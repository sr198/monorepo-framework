import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import * as fs from 'fs';
import path from 'path';

// Load proto files - find the correct path in both dev and prod
let PROTO_PATH: string;

// Start from the monorepo root
const monorepoRoot = path.resolve(__dirname, '../../../..');
const possiblePaths = [
  path.resolve(monorepoRoot, 'proto'), // From monorepo root
  path.resolve(__dirname, '../../../proto'), // From service directory
  path.resolve(process.cwd(), 'proto'), // From current working directory
  path.resolve(__dirname, '../../../../proto'), // From dist directory
  path.resolve(__dirname, '../../../../../proto'), // From nested dist directory
];

console.log('[Ticket Service] Looking for proto files...');
console.log('[Ticket Service] __dirname:', __dirname);
console.log('[Ticket Service] process.cwd():', process.cwd());

for (const p of possiblePaths) {
  try {
    const testFile = path.join(p, 'ticketing/ticket_service.proto');
    console.log('[Ticket Service] Checking:', testFile);
    if (fs.existsSync(testFile)) {
      PROTO_PATH = p;
      console.log('[Ticket Service] Found proto files at:', PROTO_PATH);
      break;
    }
  } catch (e) {
    console.log('[Ticket Service] Error checking path:', p, e);
  }
}

if (!PROTO_PATH!) {
  console.error(
    '[Ticket Service] Could not find proto files in any of these paths:'
  );
  possiblePaths.forEach(p => console.error('  -', p));
  throw new Error('Could not find proto files');
}

const ticketServiceProtoPath = path.resolve(
  PROTO_PATH,
  'ticketing/ticket_service.proto'
);

const packageDefinition = protoLoader.loadSync(ticketServiceProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
  includeDirs: [PROTO_PATH],
});

const ticketProto = grpc.loadPackageDefinition(packageDefinition) as any;

// In-memory ticket storage (replace with database in production)
const tickets: any[] = [];
let ticketCounter = 1;

// Mock AI service client (will be replaced with actual gRPC call)
const mockAnalyzeTicket = async (_title: string, _description: string) => {
  // Simulate AI analysis
  const categories = [
    'TECHNICAL_ISSUE',
    'BILLING_INQUIRY',
    'FEATURE_REQUEST',
    'COMPLAINT',
  ];
  const sentiments = ['POSITIVE', 'NEGATIVE', 'NEUTRAL'];

  return {
    category: categories[Math.floor(Math.random() * categories.length)],
    category_confidence: 0.85 + Math.random() * 0.15,
    sentiment: sentiments[Math.floor(Math.random() * sentiments.length)],
    sentiment_confidence: 0.8 + Math.random() * 0.2,
    detected_language: 'en',
    processing_time_ms: 150 + Math.floor(Math.random() * 100),
  };
};

// gRPC service implementation
const ticketServiceImpl = {
  Hello: (call: any, callback: any) => {
    const name = call.request.name || 'World';
    const response = {
      message: `Hello ${name} from Ticket Service!`,
      service: 'ticket-service',
      timestamp: {
        seconds: Math.floor(Date.now() / 1000),
        nanos: (Date.now() % 1000) * 1000000,
      },
    };
    callback(null, response);
  },

  CreateTicket: async (call: any, callback: any) => {
    try {
      const { title, description, priority, reporter_id, tags, due_date } =
        call.request;

      // Create ticket
      const ticket = {
        id: `ticket-${ticketCounter++}`,
        title,
        description,
        priority: priority || 'PRIORITY_MEDIUM',
        status: 'STATUS_OPEN',
        assignee_id: '',
        reporter_id: reporter_id || 'unknown',
        tags: tags || [],
        created_at: {
          seconds: Math.floor(Date.now() / 1000),
          nanos: (Date.now() % 1000) * 1000000,
        },
        updated_at: {
          seconds: Math.floor(Date.now() / 1000),
          nanos: (Date.now() % 1000) * 1000000,
        },
        due_date,
      };

      // Store ticket
      tickets.push(ticket);

      // Get AI analysis
      const aiAnalysis = await mockAnalyzeTicket(title, description);

      console.log(`[Ticket Service] Created ticket ${ticket.id}`);
      console.log(
        `[Ticket Service] AI Analysis: ${aiAnalysis.category} (${aiAnalysis.category_confidence}), ${aiAnalysis.sentiment} (${aiAnalysis.sentiment_confidence})`
      );

      // Include AI insights in response
      const response = {
        ticket: {
          ...ticket,
          ai_analysis: aiAnalysis,
        },
        error: null,
      };

      callback(null, response);
    } catch (error) {
      console.error('[Ticket Service] Error creating ticket:', error);
      callback(null, {
        ticket: null,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create ticket',
          details: [error instanceof Error ? error.message : 'Unknown error'],
        },
      });
    }
  },

  GetTicket: (call: any, callback: any) => {
    const { id } = call.request;
    const ticket = tickets.find(t => t.id === id);

    if (!ticket) {
      callback(null, {
        ticket: null,
        error: {
          code: 'NOT_FOUND',
          message: `Ticket with ID ${id} not found`,
          details: [],
        },
      });
      return;
    }

    callback(null, {
      ticket,
      error: null,
    });
  },

  ListTickets: (call: any, callback: any) => {
    const { pagination, status, priority, assignee_id } = call.request;
    let filteredTickets = tickets;

    // Apply filters
    if (status && status !== 'STATUS_UNKNOWN') {
      filteredTickets = filteredTickets.filter(t => t.status === status);
    }
    if (priority && priority !== 'PRIORITY_UNKNOWN') {
      filteredTickets = filteredTickets.filter(t => t.priority === priority);
    }
    if (assignee_id) {
      filteredTickets = filteredTickets.filter(
        t => t.assignee_id === assignee_id
      );
    }

    // Apply pagination
    const page = pagination?.page || 1;
    const pageSize = pagination?.page_size || 10;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedTickets = filteredTickets.slice(startIndex, endIndex);

    const response = {
      tickets: paginatedTickets,
      pagination: {
        total_count: filteredTickets.length,
        page,
        page_size: pageSize,
        total_pages: Math.ceil(filteredTickets.length / pageSize),
      },
      error: null,
    };

    callback(null, response);
  },

  UpdateTicket: (call: any, callback: any) => {
    const { id, ...updates } = call.request;
    const ticketIndex = tickets.findIndex(t => t.id === id);

    if (ticketIndex === -1) {
      callback(null, {
        ticket: null,
        error: {
          code: 'NOT_FOUND',
          message: `Ticket with ID ${id} not found`,
          details: [],
        },
      });
      return;
    }

    // Update ticket
    tickets[ticketIndex] = {
      ...tickets[ticketIndex],
      ...updates,
      updated_at: {
        seconds: Math.floor(Date.now() / 1000),
        nanos: (Date.now() % 1000) * 1000000,
      },
    };

    callback(null, {
      ticket: tickets[ticketIndex],
      error: null,
    });
  },
};

// Create and start gRPC server
export const createTicketGRPCServer = (port: number = 50051): grpc.Server => {
  const server = new grpc.Server();

  server.addService(
    ticketProto.workalaya.ticketing.TicketService.service,
    ticketServiceImpl
  );

  server.bindAsync(
    `0.0.0.0:${port}`,
    grpc.ServerCredentials.createInsecure(),
    (error, port) => {
      if (error) {
        console.error('[Ticket Service] Failed to start gRPC server:', error);
        return;
      }
      console.log(`[Ticket Service] gRPC server running on port ${port}`);
      server.start();
    }
  );

  return server;
};
