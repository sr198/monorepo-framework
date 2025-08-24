#!/bin/bash

# Proto code generation script for Workalaya monorepo

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
PROTO_DIR="$ROOT_DIR/proto"
LIBS_DIR="$ROOT_DIR/libs"

echo "🚀 Generating gRPC code from proto files..."
echo "Root: $ROOT_DIR"
echo "Proto: $PROTO_DIR"

# Create output directories
mkdir -p "$LIBS_DIR/backend/grpc/generated"
mkdir -p "$LIBS_DIR/python/grpc/generated"

# Generate TypeScript/JavaScript code
echo "📦 Generating TypeScript gRPC code..."
npx ts-proto \
  --outputServices=grpc-js \
  --outputClientImpl=grpc-web \
  --env=node \
  --useOptionals=messages \
  --exportCommonSymbols=false \
  --outputDir="$LIBS_DIR/backend/grpc/generated" \
  "$PROTO_DIR"/**/*.proto

echo "✅ TypeScript gRPC code generated successfully!"

# Generate Python code
echo "🐍 Generating Python gRPC code..."
uv run python -m grpc_tools.protoc \
  --proto_path="$PROTO_DIR" \
  --python_out="$LIBS_DIR/python/grpc/generated" \
  --grpc_python_out="$LIBS_DIR/python/grpc/generated" \
  "$PROTO_DIR"/**/*.proto

echo "✅ Python gRPC code generated successfully!"

# Make Python generated code a proper package
echo "📦 Setting up Python packages..."
find "$LIBS_DIR/python/grpc/generated" -name "*.proto" -delete
find "$LIBS_DIR/python/grpc/generated" -type d -exec touch {}/__init__.py \;

echo "🎉 Proto code generation completed successfully!"
echo ""
echo "Generated files:"
echo "  - TypeScript: $LIBS_DIR/backend/grpc/generated/"
echo "  - Python: $LIBS_DIR/python/grpc/generated/"
echo ""
echo "To regenerate, run: pnpm proto:gen"