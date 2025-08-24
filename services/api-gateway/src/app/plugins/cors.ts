import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import cors from '@fastify/cors';

/**
 * This plugin enables CORS support for cross-origin requests
 *
 * @see https://github.com/fastify/fastify-cors
 */
export default fp(async function (fastify: FastifyInstance) {
  await fastify.register(cors, {
    origin: [
      'http://localhost:4200', // React frontend
      'http://localhost:3000', // Backup frontend port
      'http://127.0.0.1:4200', // Alternative localhost
      'http://127.0.0.1:3000', // Alternative localhost
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'Origin',
      'User-Agent',
    ],
  });
});
