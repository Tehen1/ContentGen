#!/bin/bash

# Navigate to the project directory
cd /Users/devtehen/seo/fitapppppp

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo "Docker is not running. Please start Docker and try again."
  exit 1
fi

echo "Starting all microservices..."

# Build and start all services defined in docker-compose.yml
docker-compose up --build -d

# Check if services started successfully
if [ $? -eq 0 ]; then
  echo "All services started successfully!"
  echo "Service status:"
  docker-compose ps
else
  echo "Error starting services. See logs below:"
  docker-compose logs
  exit 1
fi

echo "You can view logs with: docker-compose logs -f [service_name]"