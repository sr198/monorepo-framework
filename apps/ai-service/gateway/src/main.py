"""AI Service Gateway - FastAPI Application"""

import logging
from contextlib import asynccontextmanager
from typing import Dict

import uvicorn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel


class HealthResponse(BaseModel):
    """Health check response model"""

    status: str
    message: str
    version: str


class HelloWorldResponse(BaseModel):
    """Hello World response model"""

    message: str
    service: str
    timestamp: str


@asynccontextmanager
async def lifespan(app: FastAPI):
    """FastAPI lifespan context manager"""
    # Startup
    logging.info("AI Gateway starting up...")
    yield
    # Shutdown
    logging.info("AI Gateway shutting down...")


# Create FastAPI app
app = FastAPI(
    title="Workalaya AI Service Gateway",
    description="API Gateway for AI microservices with gRPC backend integration",
    version="0.1.0",
    lifespan=lifespan,
)


@app.get("/")
async def root() -> Dict[str, str]:
    """Root endpoint"""
    return {"message": "Workalaya AI Service Gateway", "status": "active"}


@app.get("/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    """Health check endpoint"""
    return HealthResponse(
        status="healthy", message="AI Gateway is running", version="0.1.0"
    )


@app.get("/hello", response_model=HelloWorldResponse)
async def hello_world() -> HelloWorldResponse:
    """Hello World endpoint for testing"""
    from datetime import datetime

    return HelloWorldResponse(
        message="Hello from AI Service Gateway!",
        service="ai-gateway",
        timestamp=datetime.now().isoformat(),
    )


@app.post("/webhooks/{webhook_type}")
async def webhook_handler(webhook_type: str, payload: Dict) -> Dict[str, str]:
    """Webhook handler for external monitoring services"""
    # TODO: Implement webhook processing logic
    logging.info(f"Received webhook: {webhook_type}")
    return {
        "status": "received",
        "webhook_type": webhook_type,
        "message": "Webhook processed successfully",
    }


@app.get("/api/v1/nlp/hello")
async def nlp_hello() -> Dict[str, str]:
    """Hello endpoint that will proxy to NLP service via gRPC"""
    # TODO: Implement gRPC call to NLP service
    return {
        "message": "Hello from NLP service (via gRPC - to be implemented)",
        "service": "nlp-service",
    }


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True, log_level="info")
