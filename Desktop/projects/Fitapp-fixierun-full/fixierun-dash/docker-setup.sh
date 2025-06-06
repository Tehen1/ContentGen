#!/bin/bash

# Make the script executable
chmod +x docker-setup.sh

# Create .env file from example if it doesn't exist
if [ ! -f .env ]; then
  cp .env.example .env
  echo "Created .env file from .env.example"
fi

# Build and start the Docker containers
docker-compose up -d

# Display container status
docker-compose ps

echo ""
echo "Fixie.Run Docker setup complete!"
echo "The application is running at: http://localhost:3000"
echo "PgAdmin is available at: http://localhost:5050"
echo "  - Email: admin@fixierun.com"
echo "  - Password: admin"
echo ""
echo "To connect to the database in PgAdmin:"
echo "  1. Add a new server"
echo "  2. Name: fixierun"
echo "  3. Connection tab:"
echo "     - Host: postgres"
echo "     - Port: 5432"
echo "     - Database: fixierun"
echo "     - Username: fixierun"
echo "     - Password: fixierun"
echo ""
echo "To view logs: docker-compose logs -f app"
echo "To stop the containers: docker-compose down"
