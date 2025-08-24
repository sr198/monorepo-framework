# Workalaya Monorepo

Welcome to the Workalaya monorepo! This is the comprehensive enterprise platform consisting of a **Ticketing System** with React frontends, Node.js microservices, and a separate **AI Service** collection built with Python FastAPI microservices.

## 🏗️ Architecture Overview

This monorepo contains:

- **Ticketing System**: React frontend, Node.js API Gateway, microservices
- **AI Services**: Python FastAPI microservices with ML/NLP capabilities
- **Shared Infrastructure**: Common libraries, tooling, and configurations

## 📁 Directory Structure

```
workalaya/
├── apps/                    # Applications
│   ├── ticketing/web/       # React frontend (Vite + Tailwind)
│   └── ai-service/          # Python AI microservices
├── services/                # Node.js backend services
│   └── api-gateway/         # Main API Gateway (Fastify)
├── libs/                    # Shared libraries
│   ├── shared/              # Frontend shared code
│   ├── backend/             # Node.js shared code
│   └── python/              # Python shared code
├── proto/                   # gRPC protocol definitions
├── infrastructure/          # Docker, K8s, Terraform
├── tools/                   # Build tools and scripts
└── docs/                    # Documentation
```

## 🛠️ Technology Stack

### Frontend

- **React 19** with TypeScript
- **Vite** bundler with HMR
- **Tailwind CSS** for styling
- **Zustand** for state management
- **React Router** for routing

### Backend (Node.js)

- **Fastify** framework
- **TypeScript** with strict typing
- **Prisma** ORM for database
- **gRPC** for internal communication
- **Zod** for validation

### AI Services (Python)

- **FastAPI** with asyncio
- **Pydantic** models
- **SQLAlchemy** for database
- **gRPC** for internal communication
- **pytest** for testing

### Infrastructure

- **PostgreSQL** - Primary database
- **MongoDB** - Audit logs
- **Redis** - Caching and sessions
- **MinIO** - Object storage (S3-compatible)
- **Qdrant** - Vector/semantic search
- **Apache Kafka** - Message queue
- **Prometheus + Grafana** - Monitoring

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Python 3.11+
- Docker & Docker Compose
- pnpm (for Node.js packages)
- uv (for Python packages)

### Development Setup

1. **Install dependencies:**

   ```bash
   pnpm install           # Node.js dependencies
   uv sync                # Python dependencies
   ```

2. **Start infrastructure:**

   ```bash
   docker-compose up -d postgres redis mongodb minio qdrant kafka prometheus grafana
   ```

3. **Generate gRPC code:**

   ```bash
   pnpm proto:gen
   ```

4. **Start development servers:**

   ```bash
   # Frontend (http://localhost:4200)
   pnpm nx serve ticketing-web

   # API Gateway (http://localhost:3001)
   pnpm nx serve api-gateway

   # AI Gateway (http://localhost:8000)
   cd apps/ai-service/gateway && uvicorn src.main:app --reload
   ```

## 🧪 Testing

```bash
# Frontend tests
pnpm nx test ticketing-web

# Backend tests
pnpm nx test api-gateway

# Python tests
cd apps/ai-service/gateway && pytest

# E2E tests
pnpm nx e2e ticketing-web-e2e
```

## 📜 Available Scripts

- `pnpm dev` - Start development servers
- `pnpm build` - Build all applications
- `pnpm test` - Run all tests
- `pnpm lint` - Lint all code
- `pnpm format` - Format all code
- `pnpm proto:gen` - Generate gRPC code

## 🔗 Communication Patterns

### External APIs

- **REST APIs** via API Gateway for frontend/external clients
- **Webhooks** for external monitoring services

### Internal Communication

- **gRPC** between all microservices
- **Kafka** for async event processing
- **Redis** for caching and session management

## 📚 Component Documentation

Each component has its own `CLAUDE.md` file with specific instructions:

- [Ticketing Web App](./apps/ticketing/web/CLAUDE.md)
- [API Gateway](./services/api-gateway/CLAUDE.md)
- [AI Gateway](./apps/ai-service/gateway/CLAUDE.md)

## 🎯 Development Principles

1. **Hello-World First**: Every component starts with working examples
2. **Type Safety**: End-to-end TypeScript + Pydantic validation
3. **gRPC Internal**: All microservice communication via gRPC
4. **REST External**: Public APIs use REST + webhooks
5. **Monitoring Built-in**: Prometheus metrics in all services
6. **Test Coverage**: Unit, integration, and E2E testing

## 🔧 Troubleshooting

### Common Issues

1. **gRPC code not generated**: Run `pnpm proto:gen`
2. **Database connection errors**: Ensure `docker-compose up -d postgres`
3. **Port conflicts**: Check if services are running on expected ports

### Useful Commands

```bash
# Check service status
docker-compose ps

# View logs
docker-compose logs -f [service-name]

# Reset database
docker-compose down -v && docker-compose up -d postgres

# Clean rebuild
pnpm nx reset && pnpm install
```

## 🤝 Contributing

1. Each component maintains its own development guidelines
2. Follow established patterns for new services
3. Update component-specific CLAUDE.md files
4. Ensure all tests pass before committing
5. Use conventional commit messages

## 📞 Support

For component-specific questions, refer to individual `CLAUDE.md` files in each service directory.
