# FIXIE Microservices Architecture

**Dernière mise à jour : 2025-05-02**

## Overview

The FIXIE application is built using a microservices architecture to ensure scalability, resilience, and maintainability. Each microservice is responsible for a specific domain of functionality and communicates with other services through well-defined APIs.

## Microservices

### Activity Tracking Service

**Purpose**: Manages user fitness activities and related data.

**Responsibilities**:
- Track user fitness activities (running, cycling, walking)
- Store GPS data and route information
- Calculate activity metrics (distance, calories, pace)
- Provide activity history and statistics

**Tech Stack**:
- NestJS (Node.js)
- TypeORM
- PostgreSQL

**API Endpoints**: See [Activity Tracking API](../backend/services/activity-tracking/README.md)

### Rewards Service

**Purpose**: Manages the tokenization of physical activities and reward distribution.

**Responsibilities**:
- Calculate token rewards based on activity metrics
- Track user streaks and achievements
- Handle token distribution
- Integrate with blockchain for token minting

**Tech Stack**:
- NestJS (Node.js)
- TypeORM
- PostgreSQL
- Ethers.js

**API Endpoints**: To be documented

### Analytics Service

**Purpose**: Provides data analysis and business intelligence.

**Responsibilities**:
- Generate user activity reports
- Track platform-wide metrics
- Provide insights on user behavior
- Support data visualization

**Tech Stack**:
- NestJS (Node.js)
- MongoDB
- Apache Spark (for big data processing)

**API Endpoints**: To be documented

### Challenges Service

**Purpose**: Manages fitness challenges and competitions.

**Responsibilities**:
- Create and manage challenges (daily, weekly, monthly)
- Handle user challenge participation
- Track challenge progress and completion
- Distribute rewards for challenge completion

**Tech Stack**:
- NestJS (Node.js)
- TypeORM
- PostgreSQL
- Redis (for leaderboards)

**API Endpoints**: To be documented

### NFT Management Service

**Purpose**: Manages NFT badges, collectibles, and marketplace.

**Responsibilities**:
- Create and distribute NFT badges for achievements
- Handle NFT metadata and storage
- Manage marketplace listings
- Process NFT transactions

**Tech Stack**:
- NestJS (Node.js)
- TypeORM
- PostgreSQL
- IPFS (for NFT metadata)
- Ethers.js

**API Endpoints**: To be documented

## Service Communication

Services communicate primarily through:

1. **HTTP/REST** - For synchronous request/response patterns
2. **Message Queue** - For asynchronous communication (using RabbitMQ)
3. **Webhooks** - For event notifications to external systems

## Deployment

Each microservice is containerized using Docker and deployed using Kubernetes. See the deployment architecture for more details.

## Monitoring and Observability

All microservices implement:

- Health check endpoints
- Prometheus metrics
- Structured logging
- Distributed tracing (using OpenTelemetry)

## Adding New Microservices

When adding a new microservice:

1. Follow the established project structure
2. Implement the required health and monitoring endpoints
3. Document the API using OpenAPI/Swagger
4. Add integration tests to verify communication with other services
5. Update this document with the new service details

## Service Discovery

Service discovery is handled through Kubernetes DNS for internal services. For service-to-service communication, services reference each other using their service names.
