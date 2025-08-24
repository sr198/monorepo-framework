import Fastify from 'fastify';
import { app } from './app/app';
import { createTicketGRPCServer } from './grpc/server';

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;
const grpcPort = process.env.GRPC_PORT ? Number(process.env.GRPC_PORT) : 50051;

// Instantiate Fastify with some config
const server = Fastify({
  logger: true,
});

// Register your application as a normal plugin.
server.register(app);

// Start gRPC server
console.log('[Ticket Service] Starting gRPC server...');
const grpcServer = createTicketGRPCServer(grpcPort);

// Start HTTP server
server.listen({ port, host }, err => {
  if (err) {
    server.log.error(err);
    process.exit(1);
  } else {
    console.log(`[Ticket Service] HTTP server ready at http://${host}:${port}`);
    console.log(`[Ticket Service] gRPC server ready at ${host}:${grpcPort}`);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[Ticket Service] Shutting down...');
  grpcServer.tryShutdown(error => {
    if (error) {
      console.error('[Ticket Service] Error shutting down gRPC server:', error);
    } else {
      console.log('[Ticket Service] gRPC server shut down successfully');
    }
  });
  server.close();
});
