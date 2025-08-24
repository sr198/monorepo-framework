"""NLP Service - gRPC Server for text analysis

This is a placeholder file for the hello-world demo.
To make it functional:
1. Generate gRPC code from proto files: `pnpm proto:gen`
2. Uncomment the imports and service implementation
3. Install additional dependencies: grpcio, grpcio-tools
"""

import logging
import time

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def placeholder_service():
    """Placeholder function for the NLP service"""
    logger.info("[NLP Service] This is a placeholder - implement gRPC service here")
    time.sleep(1)


if __name__ == "__main__":
    logger.info("[NLP Service] Starting placeholder NLP service...")
    placeholder_service()
