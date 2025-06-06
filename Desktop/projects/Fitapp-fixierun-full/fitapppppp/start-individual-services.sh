#!/bin/bash

# Navigate to the project directory
cd /Users/devtehen/seo/fitapppppp

# Array of service directories
services=(
  "backend/services/activity-tracking"
  "backend/services/analytics"
  "backend/services/challenges"
  "backend/services/nft-management"
  "backend/services/rewards"
)

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo "Docker is not running. Please start Docker and try again."
  exit 1
fi

# Build and start each service
for service in "${services[@]}"; do
  service_name=$(basename "$service")
  echo "Building and starting $service_name..."
  
  # Navigate to service directory
  cd "/Users/devtehen/seo/fitapppppp/$service"
  
  # Build Docker image
  docker build -t "fitness-app/$service_name" .
  
  # Run container
  docker run -d --name "$service_name" "fitness-app/$service_name"
  
  # Return to project root
  cd /Users/devtehen/seo/fitapppppp
done

echo "All services started. Container status:"
docker ps