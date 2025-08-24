import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';

// Load proto files
const PROTO_PATH = path.join(__dirname, '../../proto');

const ticketServiceProtoPath = path.join(
  PROTO_PATH,
  'ticketing/ticket_service.proto'
);
const nlpServiceProtoPath = path.join(PROTO_PATH, 'ai/nlp_service.proto');

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
    private ticketServiceAddress = 'localhost:50051',
    private nlpServiceAddress = 'localhost:50061'
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
