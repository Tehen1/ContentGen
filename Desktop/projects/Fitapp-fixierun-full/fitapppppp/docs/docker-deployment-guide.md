# Docker Deployment Guide for Fitness App

This guide explains how to deploy and manage the Docker containers for all microservices in the Fitness App.

## Prerequisites

- Docker and Docker Compose installed
- Git repository cloned locally

## Overview of Services

The application consists of the following containerized services:

1. **Activity Tracking Service**: Tracks user fitness activities
2. **Analytics Service**: Processes and analyzes user data
3. **Challenges Service**: Manages fitness challenges and goals
4. **NFT Management Service**: Handles NFT creation and trading
5. **Rewards Service**: Manages token rewards for achievements

## Starting All Services

The easiest way to start all services is using Docker Compose:

```bash
cd /Users/devtehen/seo/fitapppppp
docker-compose up -d
```

The `-d` flag runs containers in the background (detached mode).

## Starting Individual Services

If you need to run services individually:

```bash
cd /Users/devtehen/seo/fitapppppp/backend/services/[service-name]
docker build -t fitness-app/[service-name] .
docker run -d -p [host-port]:[container-port] --name [service-name] fitness-app/[service-name]
```

Replace `[service-name]`, `[host-port]`, and `[container-port]` with appropriate values.

## Viewing Logs

To view logs for all services:

```bash
docker-compose logs -f
```

To view logs for a specific service:

```bash
docker-compose logs -f [service-name]
```

## Stopping Services

To stop all services:

```bash
docker-compose down
```

To stop a specific service:

```bash
docker-compose stop [service-name]
```

## Development Workflow

1. Make changes to service code
2. Rebuild and restart the affected service:
   ```bash
   docker-compose up -d --build [service-name]
   ```

## Troubleshooting

### Container Won't Start

1. Check logs: `docker-compose logs [service-name]`
2. Verify port availability: `lsof -i :[port]`
3. Check Docker status: `docker info`

### Network Issues

1. Inspect Docker networks: `docker network ls`
2. Check network connections: `docker network inspect fitness-network`

### Database Connection Issues

1. Verify environment variables in docker-compose.yml
2. Check database service is running: `docker-compose ps`
3. Inspect database logs: `docker-compose logs database`

## Production Deployment

For production deployment, use the production configuration:

```bash
docker-compose -f docker-compose.yml -f infrastructure/docker-compose.prod.yml up -d
```

## Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)