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

console.log('[API Gateway] Looking for proto files...');
console.log('[API Gateway] __dirname:', __dirname);
console.log('[API Gateway] process.cwd():', process.cwd());

for (const p of possiblePaths) {
  try {
    const testFile = path.join(p, 'ticketing/ticket_service.proto');
    console.log('[API Gateway] Checking:', testFile);
    if (fs.existsSync(testFile)) {
      PROTO_PATH = p;
      console.log('[API Gateway] Found proto files at:', PROTO_PATH);
      break;
    }
  } catch (e) {
    console.log('[API Gateway] Error checking path:', p, e);
  }
}

if (!PROTO_PATH!) {
  console.error(
    '[API Gateway] Could not find proto files in any of these paths:'
  );
  possiblePaths.forEach(p => console.error('  -', p));
  throw new Error('Could not find proto files');
}

const ticketServiceProtoPath = path.resolve(
  PROTO_PATH,
  'ticketing/ticket_service.proto'
);
const nlpServiceProtoPath = path.resolve(PROTO_PATH, 'ai/nlp_service.proto');

// Package definitions
const ticketPackageDefinition = protoLoader.loadSync(ticketServiceProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
  includeDirs: [PROTO_PATH],
});

const nlpPackageDefinition = protoLoader.loadSync(nlpServiceProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
  includeDirs: [PROTO_PATH],
});

// Proto objects
const ticketProto = grpc.loadPackageDefinition(ticketPackageDefinition) as any;
const nlpProto = grpc.loadPackageDefinition(nlpPackageDefinition) as any;

// Service client types
export interface TicketServiceClient extends grpc.Client {
  Hello(
    request: any,
    callback: (error: grpc.ServiceError | null, response: any) => void
  ): void;
  CreateTicket(
    request: any,
    callback: (error: grpc.ServiceError | null, response: any) => void
  ): void;
  GetTicket(
    request: any,
    callback: (error: grpc.ServiceError | null, response: any) => void
  ): void;
  ListTickets(
    request: any,
    callback: (error: grpc.ServiceError | null, response: any) => void
  ): void;
  UpdateTicket(
    request: any,
    callback: (error: grpc.ServiceError | null, response: any) => void
  ): void;
}

export interface NLPServiceClient extends grpc.Client {
  Hello(
    request: any,
    callback: (error: grpc.ServiceError | null, response: any) => void
  ): void;
  AnalyzeText(
    request: any,
    callback: (error: grpc.ServiceError | null, response: any) => void
  ): void;
  TranslateText(
    request: any,
    callback: (error: grpc.ServiceError | null, response: any) => void
  ): void;
}

// Client factory
export class GRPCClients {
  private ticketClient?: TicketServiceClient;
  private nlpClient?: NLPServiceClient;

  constructor(
    private ticketServiceAddress = process.env.GRPC_TICKET_SERVICE ||
      'localhost:50056',
    private nlpServiceAddress = process.env.GRPC_NLP_SERVICE ||
      'localhost:50061'
  ) {}

  getTicketServiceClient(): TicketServiceClient {
    if (!this.ticketClient) {
      this.ticketClient = new ticketProto.workalaya.ticketing.TicketService(
        this.ticketServiceAddress,
        grpc.credentials.createInsecure()
      ) as TicketServiceClient;
    }
    return this.ticketClient;
  }

  getNLPServiceClient(): NLPServiceClient {
    if (!this.nlpClient) {
      this.nlpClient = new nlpProto.workalaya.ai.NLPService(
        this.nlpServiceAddress,
        grpc.credentials.createInsecure()
      ) as NLPServiceClient;
    }
    return this.nlpClient;
  }

  close(): void {
    this.ticketClient?.close();
    this.nlpClient?.close();
  }
}

// Default instance
export const grpcClients = new GRPCClients();
