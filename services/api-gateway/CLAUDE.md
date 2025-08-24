# API Gateway Service

Node.js Fastify-based API Gateway that serves as the main entry point for the ticketing system, routing REST requests and webhooks to appropriate microservices via gRPC.

## 🎯 Purpose

This service acts as the central API gateway providing:

- **REST API endpoints** for frontend and external clients
- **Webhook handlers** for external monitoring services and integrations
- **gRPC routing** to internal microservices
- **Authentication & authorization** for all requests
- **Rate limiting** and request validation
- **API documentation** and monitoring

## 🛠️ Technology Stack

- **Fastify** - High-performance web framework
- **TypeScript** - Type safety and developer experience
- **gRPC-JS** - Internal service communication
- **Prisma** - Database ORM with type generation
- **Zod** - Runtime schema validation
- **JWT** - Authentication tokens
- **Prometheus** - Metrics collection

## 📁 Project Structure

```
src/
├── app/                    # Main Fastify application setup
├── routes/                 # REST API route handlers
├── webhooks/              # Webhook handlers
├── grpc/                  # gRPC client configurations
├── middleware/            # Custom middleware
├── schemas/               # Zod validation schemas
├── services/              # Business logic layer
├── types/                 # TypeScript definitions
├── utils/                 # Utility functions
└── config/                # Configuration management
```

## 🚀 Development

### Running the Service

```bash
# Development server (http://localhost:3001)
pnpm nx serve api-gateway

# Build for production
pnpm nx build api-gateway

# Run tests
pnpm nx test api-gateway

# Run with debugging
pnpm nx serve api-gateway --inspect
```

### Environment Variables

Create `.env.local` in the service root:

```env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://workalaya:workalaya123@localhost:5432/workalaya
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-jwt-secret-here
GRPC_TICKET_SERVICE=localhost:50051
GRPC_USER_SERVICE=localhost:50052
GRPC_NOTIFICATION_SERVICE=localhost:50053
```

## 🛣️ API Routes

### REST Endpoints

```typescript
// Health check
GET /health

// Authentication
POST /auth/login
POST /auth/refresh
GET /auth/profile

// Tickets (proxied to ticket-service via gRPC)
GET /api/v1/tickets              # List tickets with pagination
POST /api/v1/tickets             # Create new ticket
GET /api/v1/tickets/:id          # Get specific ticket
PUT /api/v1/tickets/:id          # Update ticket
DELETE /api/v1/tickets/:id       # Delete ticket

// Users (proxied to user-service via gRPC)
GET /api/v1/users               # List users
POST /api/v1/users              # Create user
GET /api/v1/users/:id           # Get user profile

// AI Integration (proxied to AI Gateway)
POST /api/v1/ai/analyze-ticket  # Analyze ticket content
POST /api/v1/ai/classify        # Classify ticket category
GET /api/v1/ai/insights         # Get AI insights dashboard

// Webhooks
POST /webhooks/monitoring/:type  # External monitoring webhooks
POST /webhooks/alerts/:source    # Alert system webhooks
```

### Webhook Handlers

```typescript
// Monitoring service webhooks
POST /webhooks/monitoring/zabbix     # Zabbix alerts
POST /webhooks/monitoring/nagios     # Nagios alerts
POST /webhooks/monitoring/prometheus # Prometheus alerts

// Integration webhooks
POST /webhooks/github/:repo          # GitHub webhook events
POST /webhooks/slack                 # Slack app webhooks
```

## 🔧 Fastify Configuration

### Application Setup

```typescript
// src/app/app.ts
import Fastify from 'fastify';

const app = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    prettyPrint: process.env.NODE_ENV === 'development',
  },
});

// Register plugins
await app.register(cors);
await app.register(helmet);
await app.register(rateLimit);
await app.register(authenticate);
```

### Plugin Configuration

```typescript
// CORS
await app.register(cors, {
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:4200'],
});

// Rate limiting
await app.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute',
});

// JWT Authentication
await app.register(jwt, {
  secret: process.env.JWT_SECRET!,
});
```

## 🔗 gRPC Integration

### Client Setup

```typescript
// src/grpc/clients.ts
import * as grpc from '@grpc/grpc-js';
import { TicketServiceClient } from '../../libs/backend/grpc/generated/ticketing/ticket_service';

export const ticketServiceClient = new TicketServiceClient(
  process.env.GRPC_TICKET_SERVICE!,
  grpc.credentials.createInsecure()
);
```

### Service Proxying

```typescript
// src/services/ticketService.ts
export class TicketService {
  async createTicket(request: CreateTicketRequest): Promise<Ticket> {
    return new Promise((resolve, reject) => {
      ticketServiceClient.createTicket(request, (error, response) => {
        if (error) reject(error);
        else resolve(response.ticket!);
      });
    });
  }
}
```

## 📋 Request Validation

### Zod Schemas

```typescript
// src/schemas/ticketSchemas.ts
import { z } from 'zod';

export const createTicketSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  tags: z.array(z.string()).optional(),
});
```

### Route Validation

```typescript
// src/routes/tickets.ts
app.post(
  '/api/v1/tickets',
  {
    schema: {
      body: createTicketSchema,
      response: {
        201: ticketResponseSchema,
      },
    },
  },
  async (request, reply) => {
    // Handler with validated request.body
  }
);
```

## 🔐 Authentication & Authorization

### JWT Middleware

```typescript
// src/middleware/auth.ts
app.addHook('onRequest', async (request, reply) => {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.send(err);
  }
});
```

### Role-Based Access

```typescript
// src/middleware/rbac.ts
const requireRole = (role: UserRole) => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user;
    if (!user.roles.includes(role)) {
      return reply.code(403).send({ error: 'Insufficient permissions' });
    }
  };
};
```

## 📊 Monitoring & Metrics

### Prometheus Metrics

```typescript
// src/utils/metrics.ts
import client from 'prom-client';

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'],
});

// Middleware to collect metrics
app.addHook('onResponse', (request, reply, done) => {
  const duration = Date.now() - request.startTime;
  httpRequestDuration
    .labels(request.method, request.routerPath, reply.statusCode.toString())
    .observe(duration / 1000);
  done();
});
```

### Health Checks

```typescript
// src/routes/health.ts
app.get('/health', async () => {
  const checks = await Promise.allSettled([
    checkDatabase(),
    checkRedis(),
    checkGrpcServices(),
  ]);

  return {
    status: checks.every(c => c.status === 'fulfilled')
      ? 'healthy'
      : 'unhealthy',
    checks: formatHealthChecks(checks),
    timestamp: new Date().toISOString(),
  };
});
```

## 🧪 Testing Strategy

### Unit Tests

```typescript
// src/routes/__tests__/tickets.test.ts
import { app } from '../app';

describe('Ticket Routes', () => {
  test('POST /api/v1/tickets creates ticket', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/tickets',
      headers: { authorization: `Bearer ${validToken}` },
      payload: { title: 'Test Ticket', description: 'Test' },
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toHaveProperty('id');
  });
});
```

### Integration Tests

```typescript
// src/__tests__/integration/grpc.test.ts
describe('gRPC Integration', () => {
  test('ticket service communication', async () => {
    const result = await ticketService.createTicket(mockTicketRequest);
    expect(result).toHaveProperty('id');
  });
});
```

## 🐛 Error Handling

### Global Error Handler

```typescript
// src/app/errorHandler.ts
app.setErrorHandler((error, request, reply) => {
  const statusCode = error.statusCode || 500;

  request.log.error(error);

  reply.status(statusCode).send({
    error: {
      message: error.message,
      statusCode,
      timestamp: new Date().toISOString(),
      path: request.url,
    },
  });
});
```

### gRPC Error Mapping

```typescript
// src/utils/grpcErrorMapper.ts
export const mapGrpcError = (grpcError: any): FastifyError => {
  switch (grpcError.code) {
    case grpc.status.NOT_FOUND:
      return createError(404, 'Resource not found');
    case grpc.status.ALREADY_EXISTS:
      return createError(409, 'Resource already exists');
    default:
      return createError(500, 'Internal server error');
  }
};
```

## 🚀 Deployment

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist/ ./dist/
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

### Environment Configuration

Production environment variables:

- `NODE_ENV=production`
- `LOG_LEVEL=warn`
- Database and Redis URLs
- gRPC service endpoints
- JWT secrets and API keys

## 🔧 Configuration Management

### Config Schema

```typescript
// src/config/index.ts
const configSchema = z.object({
  port: z.coerce.number().default(3000),
  database: z.object({
    url: z.string().url(),
  }),
  redis: z.object({
    url: z.string().url(),
  }),
  grpc: z.object({
    ticketService: z.string(),
    userService: z.string(),
  }),
});

export const config = configSchema.parse(process.env);
```

## 📋 TODOs

- [ ] Implement OpenAPI/Swagger documentation generation
- [ ] Add request/response caching with Redis
- [ ] Implement circuit breaker for gRPC calls
- [ ] Add distributed tracing with Jaeger
- [ ] Set up API versioning strategy
- [ ] Implement webhook signature validation
- [ ] Add bulk operations support

## 🔗 Related Services

- **Ticket Service**: `services/ticket-service/` - gRPC ticket management
- **User Service**: `services/user-service/` - gRPC user management
- **AI Gateway**: `apps/ai-service/gateway/` - AI service integration
- **Frontend**: `apps/ticketing/web/` - React client

## 📞 Service Support

For API Gateway specific questions:

1. Check this CLAUDE.md file
2. Review Fastify documentation for framework features
3. Check gRPC client patterns in existing code
4. Refer to shared backend libraries
