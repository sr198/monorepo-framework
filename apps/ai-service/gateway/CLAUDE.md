# AI Service Gateway

Python FastAPI-based gateway for the AI service collection, providing REST APIs for external access and gRPC communication with specialized AI microservices.

## 🎯 Purpose

This service serves as the entry point for all AI capabilities:

- **REST API endpoints** for AI features consumption
- **Webhook handlers** for external monitoring and alert processing
- **gRPC routing** to specialized AI microservices (NLP, ML, GenAI, etc.)
- **Request aggregation** and response normalization
- **AI model management** and routing decisions

## 🛠️ Technology Stack

- **FastAPI** - Modern, fast Python web framework
- **Pydantic** - Data validation and serialization
- **asyncio** - Asynchronous programming support
- **gRPC/grpcio** - Internal service communication
- **SQLAlchemy** - Database ORM with async support
- **Redis** - Caching and session management
- **Prometheus** - Metrics and monitoring

## 📁 Project Structure

```
src/
├── main.py                 # FastAPI application entry point
├── api/                    # REST API route handlers
├── webhooks/              # Webhook processing
├── grpc/                  # gRPC client configurations
├── models/                # Pydantic data models
├── services/              # Business logic layer
├── core/                  # Core functionality (auth, config)
├── utils/                 # Utility functions
└── tests/                 # Test suite
```

## 🚀 Development

### Running the Service

```bash
# Development server (http://localhost:8000)
cd apps/ai-service/gateway
uvicorn src.main:app --reload --port 8000

# With auto-reload and debug logging
uvicorn src.main:app --reload --port 8000 --log-level debug

# Run tests
pytest

# Run tests with coverage
pytest --cov=src --cov-report=html
```

### Environment Variables

Create `.env` in this directory:

```env
ENVIRONMENT=development
POSTGRES_URL=postgresql+asyncpg://workalaya:workalaya123@localhost:5432/workalaya
REDIS_URL=redis://localhost:6379
QDRANT_URL=http://localhost:6333
KAFKA_BOOTSTRAP_SERVERS=localhost:9092
GRPC_NLP_SERVICE=localhost:50061
GRPC_ML_SERVICE=localhost:50062
GRPC_GENAI_SERVICE=localhost:50063
```

## 🛣️ API Routes

### REST Endpoints

```python
# Health and status
GET /health
GET /

# Text Analysis (via NLP service)
POST /api/v1/nlp/analyze           # Comprehensive text analysis
POST /api/v1/nlp/classify          # Text classification only
POST /api/v1/nlp/sentiment         # Sentiment analysis only
POST /api/v1/nlp/translate         # Language translation

# Machine Learning (via ML service)
POST /api/v1/ml/predict            # Generic prediction endpoint
POST /api/v1/ml/train              # Trigger model training
GET /api/v1/ml/models              # List available models

# Generative AI (via GenAI service)
POST /api/v1/genai/complete        # Text completion
POST /api/v1/genai/chat            # Chat conversation
POST /api/v1/genai/summarize       # Text summarization

# Batch Processing
POST /api/v1/batch/analyze         # Batch text analysis
GET /api/v1/batch/jobs/:id         # Get batch job status

# Vector Search (via Qdrant)
POST /api/v1/search/similar        # Semantic similarity search
POST /api/v1/search/index          # Index documents
```

### Webhook Handlers

```python
# Monitoring webhooks
POST /webhooks/monitoring/{webhook_type}  # Generic monitoring webhook
POST /webhooks/alerts/prometheus          # Prometheus alerts
POST /webhooks/alerts/grafana            # Grafana alerts

# Data ingestion webhooks
POST /webhooks/data/tickets               # New ticket data for training
POST /webhooks/data/feedback             # User feedback for model improvement
```

## 🔧 FastAPI Configuration

### Application Setup

```python
# src/main.py
from fastapi import FastAPI
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize gRPC clients, database connections
    await startup_event()
    yield
    # Shutdown: Cleanup resources
    await shutdown_event()

app = FastAPI(
    title="Workalaya AI Service Gateway",
    description="AI/ML capabilities gateway with gRPC backend integration",
    version="0.1.0",
    lifespan=lifespan
)
```

### Middleware Configuration

```python
from fastapi.middleware.cors import CORSMiddleware
from fastify.middleware.trustedhost import TrustedHostMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 🔗 gRPC Integration

### Client Setup

```python
# src/grpc/clients.py
import grpc
from libs.python.grpc.generated.ai.nlp_service_pb2_grpc import NLPServiceStub

class GRPCClients:
    def __init__(self):
        self.nlp_channel = grpc.aio.insecure_channel(
            os.getenv('GRPC_NLP_SERVICE', 'localhost:50061')
        )
        self.nlp_client = NLPServiceStub(self.nlp_channel)

    async def close(self):
        await self.nlp_channel.close()

grpc_clients = GRPCClients()
```

### Service Integration

```python
# src/services/nlp_service.py
class NLPService:
    def __init__(self, grpc_client):
        self.grpc_client = grpc_client

    async def analyze_text(self, request: TextAnalysisRequest) -> TextAnalysisResponse:
        try:
            grpc_request = self._to_grpc_request(request)
            grpc_response = await self.grpc_client.AnalyzeText(grpc_request)
            return self._from_grpc_response(grpc_response)
        except grpc.RpcError as e:
            raise HTTPException(status_code=500, detail=f"NLP service error: {e}")
```

## 📋 Request/Response Models

### Pydantic Models

```python
# src/models/nlp.py
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class TextAnalysisRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=10000)
    language: Optional[str] = Field(default="auto", description="Language code")
    include_sentiment: bool = Field(default=True)
    include_classification: bool = Field(default=True)
    include_entities: bool = Field(default=False)

class Entity(BaseModel):
    text: str
    type: str
    confidence: float
    start_pos: int
    end_pos: int

class TextAnalysisResponse(BaseModel):
    sentiment: Optional[str] = None
    sentiment_confidence: Optional[float] = None
    category: Optional[str] = None
    category_confidence: Optional[float] = None
    entities: List[Entity] = []
    detected_language: Optional[str] = None
    processing_time_ms: int
    timestamp: datetime
```

## 🔄 Async Processing

### Background Tasks

```python
# src/services/batch_processor.py
from fastapi import BackgroundTasks
import asyncio

class BatchProcessor:
    async def process_batch_analysis(self, texts: List[str], job_id: str):
        try:
            results = []
            for text in texts:
                result = await self.nlp_service.analyze_text(
                    TextAnalysisRequest(text=text)
                )
                results.append(result)

            # Store results in database/cache
            await self.store_batch_results(job_id, results)
        except Exception as e:
            await self.mark_job_failed(job_id, str(e))

# Usage in endpoint
@app.post("/api/v1/batch/analyze")
async def batch_analyze(
    request: BatchAnalysisRequest,
    background_tasks: BackgroundTasks
):
    job_id = generate_job_id()
    background_tasks.add_task(
        batch_processor.process_batch_analysis,
        request.texts,
        job_id
    )
    return {"job_id": job_id, "status": "processing"}
```

### Redis Caching

```python
# src/core/cache.py
import aioredis
import json
from typing import Optional, Any

class CacheService:
    def __init__(self, redis_url: str):
        self.redis = aioredis.from_url(redis_url)

    async def get(self, key: str) -> Optional[Any]:
        value = await self.redis.get(key)
        return json.loads(value) if value else None

    async def set(self, key: str, value: Any, ttl: int = 3600):
        await self.redis.setex(key, ttl, json.dumps(value, default=str))
```

## 📊 Monitoring & Logging

### Prometheus Metrics

```python
# src/core/metrics.py
from prometheus_client import Counter, Histogram, generate_latest
from fastapi import Response

REQUEST_COUNT = Counter('http_requests_total', 'Total HTTP requests', ['method', 'endpoint'])
REQUEST_DURATION = Histogram('http_request_duration_seconds', 'HTTP request duration')
AI_PROCESSING_TIME = Histogram('ai_processing_duration_seconds', 'AI processing time', ['service', 'operation'])

@app.middleware("http")
async def add_metrics(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)

    REQUEST_COUNT.labels(
        method=request.method,
        endpoint=request.url.path
    ).inc()

    REQUEST_DURATION.observe(time.time() - start_time)
    return response

@app.get("/metrics")
async def metrics():
    return Response(generate_latest(), media_type="text/plain")
```

### Structured Logging

```python
# src/core/logging.py
import logging
import structlog
from pythonjsonlogger import jsonlogger

structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
        structlog.processors.JSONRenderer()
    ],
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger()
```

## 🧪 Testing Strategy

### Unit Tests

```python
# src/tests/test_nlp_api.py
import pytest
from httpx import AsyncClient
from src.main import app

@pytest.mark.asyncio
async def test_analyze_text():
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post(
            "/api/v1/nlp/analyze",
            json={"text": "This is a test message", "include_sentiment": True}
        )

    assert response.status_code == 200
    data = response.json()
    assert "sentiment" in data
    assert "timestamp" in data
```

### Integration Tests

```python
# src/tests/test_grpc_integration.py
@pytest.mark.asyncio
async def test_grpc_nlp_service():
    request = TextAnalysisRequest(text="Hello world")
    response = await nlp_service.analyze_text(request)

    assert response.processing_time_ms > 0
    assert response.detected_language is not None
```

### Mock gRPC Services

```python
# src/tests/mocks/grpc_mocks.py
class MockNLPService:
    async def AnalyzeText(self, request):
        return TextAnalysisResponse(
            sentiment="positive",
            sentiment_confidence=0.85,
            category="general",
            category_confidence=0.90,
            detected_language="en"
        )
```

## 🔐 Security & Authentication

### JWT Validation

```python
# src/core/auth.py
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer
import jwt

security = HTTPBearer()

async def verify_token(token: str = Depends(security)):
    try:
        payload = jwt.decode(token.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )
```

### Rate Limiting

```python
# src/core/rate_limit.py
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.post("/api/v1/nlp/analyze")
@limiter.limit("100/minute")
async def analyze_text(request: Request, data: TextAnalysisRequest):
    # Endpoint logic
```

## 🚀 Deployment

### Docker

```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY pyproject.toml ./
RUN pip install -e .

COPY src/ ./src/
EXPOSE 8000

CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Health Checks

```python
@app.get("/health")
async def health_check():
    checks = {
        "database": await check_database(),
        "redis": await check_redis(),
        "qdrant": await check_qdrant(),
        "grpc_services": await check_grpc_services()
    }

    all_healthy = all(checks.values())
    status_code = 200 if all_healthy else 503

    return Response(
        content=json.dumps({
            "status": "healthy" if all_healthy else "unhealthy",
            "checks": checks,
            "timestamp": datetime.utcnow().isoformat()
        }),
        status_code=status_code,
        media_type="application/json"
    )
```

## 📋 TODOs

- [ ] Implement request/response caching with Redis
- [ ] Add circuit breaker pattern for gRPC calls
- [ ] Set up distributed tracing with Jaeger
- [ ] Implement streaming responses for long-running tasks
- [ ] Add API versioning strategy
- [ ] Implement webhook signature validation
- [ ] Add model A/B testing capabilities
- [ ] Set up automated model retraining pipelines

## 🔗 Related Services

- **NLP Service**: `apps/ai-service/nlp-service/` - Text processing microservice
- **ML Service**: `apps/ai-service/ml-service/` - Machine learning microservice
- **GenAI Service**: `apps/ai-service/genai-service/` - Generative AI microservice
- **API Gateway**: `services/api-gateway/` - Main system gateway

## 📞 Service Support

For AI Gateway specific questions:

1. Check this CLAUDE.md file
2. Review FastAPI documentation for framework features
3. Check gRPC patterns in Python shared libraries
4. Refer to AI service architecture documentation
