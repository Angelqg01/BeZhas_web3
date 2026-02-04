#!/bin/bash
# Local development setup script

set -e

echo "===================================================="
echo "BeZhas Web3 - Local Development Setup"
echo "===================================================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
    echo ""
    echo "⚠️  Please edit .env file with your actual values before starting!"
    echo ""
    read -p "Press Enter to continue after editing .env..."
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Error: Docker is not installed"
    echo "Please install Docker from: https://docs.docker.com/get-docker/"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "Error: docker-compose is not installed"
    echo "Please install it from: https://docs.docker.com/compose/install/"
    exit 1
fi

# Start services
echo "Starting Docker containers..."
docker-compose up -d

echo ""
echo "Waiting for services to be ready..."
sleep 10

# Check service status
echo ""
echo "Service Status:"
docker-compose ps

echo ""
echo "===================================================="
echo "Development environment is ready!"
echo "===================================================="
echo ""
echo "Application: http://localhost:3000"
echo "MongoDB: mongodb://localhost:27017"
echo ""
echo "Useful commands:"
echo "  docker-compose logs -f          # View logs"
echo "  docker-compose down             # Stop services"
echo "  docker-compose restart          # Restart services"
echo "  docker-compose exec app sh      # Access app container"
echo ""
