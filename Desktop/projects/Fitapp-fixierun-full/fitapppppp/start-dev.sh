#!/bin/bash
set -e

# Make scripts executable
chmod +x setup-backend.sh setup-frontend.sh setup-mobile.sh setup-blockchain.sh

# Run setup scripts if needed
./setup-backend.sh
./setup-frontend.sh
./setup-mobile.sh
./setup-blockchain.sh

# Start the Docker development environment
echo "Starting Docker development environment..."
docker-compose up -d

# Check if services are running
echo "Checking if services are running..."
sleep 10
docker-compose ps

echo "========================================================"
echo "Development environment is now running!"
echo "========================================================"
echo "- Backend services are available at:"
echo "  - Activity Tracking: http://localhost:3001"
echo "  - Rewards: http://localhost:3002"
echo "  - Analytics: http://localhost:3003"
echo "  - Challenges: http://localhost:3004"
echo "  - NFT Management: http://localhost:3005"
echo ""
echo "- Frontend web app is available at: http://localhost:3000"
echo ""
echo "- Database interfaces:"
echo "  - PostgreSQL: localhost:5432"
echo "  - MongoDB: localhost:27017"
echo "  - Redis: localhost:6379"
echo ""
echo "- Blockchain development node: http://localhost:8545"
echo "========================================================"

# Check dependencies
echo "Checking dependencies..."
node --version
npm --version
python --version
docker --version