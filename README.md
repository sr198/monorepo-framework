# 🎫 Workalaya Ticketing System - Full-Stack Monorepo Starter

<div align="center">

[![Nx](https://raw.githubusercontent.com/nrwl/nx/master/images/nx-logo.png)](https://nx.dev)

**Modern full-stack starter project demonstrating microservices architecture with React, Node.js, and AI integration**

</div>

## 🎯 Project Overview

This is a complete full-stack monorepo starter that demonstrates enterprise-grade architecture patterns for building scalable applications. It showcases a **Ticketing System** with AI-powered analysis, featuring modern microservices communication patterns, real-time UI updates, and production-ready tooling.

### Why This Starter Was Created

- **Enterprise Architecture**: Demonstrates proper separation of concerns with API Gateway pattern, microservices, and frontend separation
- **Modern Tech Stack**: Uses latest React 19, Node.js with Fastify, TypeScript throughout, and Tailwind CSS
- **gRPC Communication**: Shows internal service communication using Protocol Buffers and gRPC for performance
- **AI Integration**: Includes mock AI services for ticket classification and sentiment analysis
- **Development Experience**: Optimized for developer productivity with hot reload, comprehensive tooling, and clear documentation
- **Production Ready**: CORS handling, error management, logging, and proper build processes

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │    │                 │
│  React Frontend │◄──►│   API Gateway   │◄──►│ Ticket Service  │
│  (Port 4200)    │    │   (Port 3003)   │    │   (Port 3006)   │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
        │                        │                        │
        │                        │                        ▼
        │              ┌─────────────────┐    ┌─────────────────┐
        │              │                 │    │                 │
        └─────────────►│     REST API    │    │  gRPC Service   │
                       │   (HTTP/JSON)   │    │  (Port 50056)   │
                       │                 │    │                 │
                       └─────────────────┘    └─────────────────┘
                                                         │
                                                         ▼
                                              ┌─────────────────┐
                                              │                 │
                                              │  Mock AI Engine │
                                              │  (In-Process)   │
                                              │                 │
                                              └─────────────────┘
```

### Communication Patterns

- **Frontend ↔ API Gateway**: REST API over HTTP with proper CORS support
- **API Gateway ↔ Services**: gRPC for high-performance internal communication
- **Data Flow**: JSON for external APIs, Protocol Buffers for internal services
- **AI Integration**: Embedded mock AI analysis for ticket categorization and sentiment

## 🛠️ Technology Stack

### Frontend

- **React 19** - Latest React with modern hooks and concurrent features
- **TypeScript** - Full type safety throughout the application
- **Vite** - Ultra-fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework for rapid UI development
- **Zustand** - Lightweight state management for React

### Backend Services

- **Node.js 18+** - Modern JavaScript runtime
- **Fastify** - High-performance web framework (chosen over Express for speed)
- **TypeScript** - Type-safe server-side development
- **gRPC + Protocol Buffers** - Efficient inter-service communication
- **@grpc/grpc-js** - Pure JavaScript gRPC implementation

### Development Tools

- **Nx Monorepo** - Advanced build system and workspace management
- **pnpm** - Fast, efficient package manager
- **ESBuild** - Extremely fast bundler for production builds
- **Hot Module Replacement** - Instant development feedback

### Infrastructure (Ready for)

- **PostgreSQL** - Primary database (configured, not yet connected)
- **Redis** - Caching and session management
- **MongoDB** - Audit logging and document storage
- **MinIO** - S3-compatible object storage
- **Kafka** - Event streaming and message queues

## 📁 Project Structure

```
monorepo/
├── apps/
│   └── ticketing/
│       └── web/                    # React frontend application
│           ├── src/
│           │   ├── components/     # Reusable UI components
│           │   ├── pages/         # Route components
│           │   ├── services/      # API client and business logic
│           │   ├── stores/        # Zustand state management
│           │   └── types/         # TypeScript type definitions
│           └── CLAUDE.md          # Detailed component documentation
│
├── services/
│   ├── api-gateway/               # Main API Gateway service
│   │   ├── src/
│   │   │   ├── app/              # Fastify application setup
│   │   │   ├── routes/           # REST API endpoints
│   │   │   ├── grpc/             # gRPC client configurations
│   │   │   └── services/         # Business logic layer
│   │   └── CLAUDE.md             # API Gateway documentation
│   │
│   └── ticket-service/           # Ticket management microservice
│       ├── src/
│       │   ├── grpc/            # gRPC server implementation
│       │   ├── app/             # Service application logic
│       │   └── main.ts          # Service entry point
│       └── CLAUDE.md            # Service-specific documentation
│
├── proto/                        # Protocol Buffer definitions
│   ├── ticketing/
│   │   └── ticket_service.proto  # Ticket service gRPC contract
│   └── ai/
│       └── nlp_service.proto     # AI service contract (for future use)
│
├── libs/                         # Shared libraries (future extensibility)
├── tools/                        # Build and development tools
└── README.md                     # This comprehensive guide
```

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** (recommend using [fnm](https://github.com/Schniz/fnm) or nvm)
- **pnpm 8+** (install with `npm install -g pnpm`)

### Installation & Setup

1. **Clone and Install**

   ```bash
   git clone <your-repo-url>
   cd workalaya-monorepo
   pnpm install
   ```

2. **Start All Services** (3 terminal windows)

   **Terminal 1: Ticket Service**

   ```bash
   PORT=3006 GRPC_PORT=50056 pnpm nx serve ticket-service
   ```

   **Terminal 2: API Gateway**

   ```bash
   PORT=3003 pnpm nx serve api-gateway
   ```

   **Terminal 3: React Frontend**

   ```bash
   pnpm nx serve ticketing-web
   ```

3. **Open Your Browser**
   Navigate to http://localhost:4200

### Alternative: One-Command Development

```bash
# Run all services in parallel (requires tmux or similar)
./dev-server.js  # Custom script to run all services
```

## 🎯 Live Demo Flow

Once all services are running, test the complete flow:

### 1. Frontend Interface

- **URL**: http://localhost:4200
- **Features**: Create tickets, view ticket list, see AI analysis results
- **UI**: Modern React interface with Tailwind styling

### 2. API Testing

```bash
# Create a ticket via REST API
curl -X POST http://localhost:3003/api/v1/tickets \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Integration",
    "description": "Testing the complete stack",
    "priority": "high",
    "reporter_id": "demo-user",
    "tags": ["demo", "integration"]
  }'

# List all tickets
curl http://localhost:3003/api/v1/tickets
```

### 3. Expected AI Analysis

Each ticket automatically gets AI-powered analysis:

- **Category Classification**: TECHNICAL_ISSUE, BILLING_INQUIRY, FEATURE_REQUEST, COMPLAINT
- **Sentiment Analysis**: POSITIVE, NEGATIVE, NEUTRAL
- **Confidence Scores**: 80%+ accuracy simulation
- **Processing Time**: ~150ms simulation

## 🔧 Service Details

### React Frontend (`apps/ticketing/web`)

- **Port**: 4200
- **Features**: Ticket CRUD, Real-time updates, Modern UI components
- **State Management**: Zustand for simplicity and performance
- **Styling**: Tailwind CSS with custom component patterns
- **API Integration**: Axios-based client with error handling

### API Gateway (`services/api-gateway`)

- **Port**: 3003
- **Purpose**: Single entry point for all frontend requests
- **Features**: REST to gRPC translation, CORS handling, Request validation
- **Performance**: Fastify for high throughput
- **Security**: CORS configured for development and production

### Ticket Service (`services/ticket-service`)

- **HTTP Port**: 3006 (health checks, admin)
- **gRPC Port**: 50056 (internal communication)
- **Features**: CRUD operations, AI integration, Data persistence
- **Storage**: In-memory (easily replaceable with PostgreSQL)
- **AI Integration**: Mock analysis with realistic response times

## 🧪 Development Features

### Hot Reload

- **Frontend**: Instant React component updates
- **Backend**: Automatic service restart on file changes
- **gRPC**: Proto file changes trigger rebuilds

### Type Safety

- **Shared Types**: Common interfaces between services
- **gRPC Types**: Auto-generated from Protocol Buffers
- **API Contracts**: Validated request/response schemas

### Development Tools

```bash
# Build all services
pnpm nx run-many --target=build

# Run tests (when implemented)
pnpm nx run-many --target=test

# Lint all projects
pnpm nx run-many --target=lint

# Visualize project dependencies
pnpm nx graph
```

## 🏭 Production Considerations

### Environment Configuration

```bash
# API Gateway Environment
NODE_ENV=production
PORT=3003
GRPC_TICKET_SERVICE=ticket-service:50051
CORS_ORIGINS=https://yourapp.com,https://admin.yourapp.com

# Ticket Service Environment
NODE_ENV=production
PORT=3006
GRPC_PORT=50051
DATABASE_URL=postgresql://user:pass@db:5432/workalaya
REDIS_URL=redis://redis:6379
```

### Docker Deployment

Each service includes Docker configuration:

```dockerfile
# Example: services/api-gateway/Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY dist/ ./
EXPOSE 3003
CMD ["node", "main.js"]
```

### Scaling Considerations

- **Load Balancing**: API Gateway can be horizontally scaled
- **Database**: Replace in-memory storage with PostgreSQL
- **Caching**: Add Redis for session and data caching
- **Monitoring**: Add Prometheus metrics and health checks

## 🚧 Future Enhancements

### Immediate Next Steps

- [ ] **Database Integration**: Connect PostgreSQL for persistent storage
- [ ] **Authentication**: Add JWT-based user authentication
- [ ] **Real-time Updates**: WebSocket support for live ticket updates
- [ ] **Testing**: Unit and integration test suites

### Advanced Features

- [ ] **AI Gateway**: Separate Python-based AI service with FastAPI
- [ ] **Event Streaming**: Kafka for event-driven architecture
- [ ] **API Versioning**: Support multiple API versions
- [ ] **Monitoring**: Prometheus + Grafana dashboard

### Infrastructure

- [ ] **Kubernetes**: Deployment manifests and Helm charts
- [ ] **CI/CD**: GitHub Actions or GitLab CI pipelines
- [ ] **Logging**: Structured logging with ELK stack
- [ ] **Tracing**: Distributed tracing with Jaeger

## 🤝 Contributing

This starter is designed for easy extension:

1. **Adding Services**: Follow the pattern in `services/` directory
2. **New Protocols**: Add `.proto` files and regenerate types
3. **Frontend Pages**: Use existing component patterns
4. **API Endpoints**: Follow REST conventions in API Gateway

### Code Style

- **TypeScript**: Strict mode enabled
- **ESLint**: Configured for all projects
- **Prettier**: Auto-formatting on save
- **Naming**: camelCase for variables, PascalCase for components

## 📚 Documentation

Each major component includes detailed documentation:

- `services/api-gateway/CLAUDE.md` - API Gateway patterns and usage
- `services/ticket-service/CLAUDE.md` - Service implementation details
- `apps/ticketing/web/CLAUDE.md` - React component architecture

## 🔍 Troubleshooting

### Common Issues

**Port Conflicts**

```bash
# Check what's using port 4200
lsof -i :4200
# Kill process if needed
kill -9 <PID>
```

**gRPC Connection Failures**

- Verify ticket service is running on correct gRPC port
- Check firewall settings
- Ensure proto files are properly compiled

**CORS Errors**

- Verify API Gateway CORS configuration
- Check frontend is calling correct API Gateway port
- Clear browser cache and cookies

**Build Failures**

```bash
# Clear Nx cache
pnpm nx reset
# Reinstall dependencies
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

## 📞 Support

For questions about this starter project:

1. Check the detailed `CLAUDE.md` files in each service
2. Review the architecture diagram and data flow
3. Examine the working example implementations
4. Extend patterns shown in the existing code

---

**Built with ❤️ using Nx, React, Node.js, and modern development practices**

This starter demonstrates enterprise-ready patterns while remaining approachable for development teams of all sizes.
