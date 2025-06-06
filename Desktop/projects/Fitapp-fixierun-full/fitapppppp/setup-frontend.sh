#!/bin/bash
set -e

# Check if package.json exists in frontend directory
if [ ! -f frontend/package.json ]; then
  echo "Initializing Next.js frontend..."
  
  # Create Next.js app with TypeScript
  npx create-next-app@latest frontend --typescript --eslint --tailwind --app --src-dir --import-alias "@/*"
  
  cd frontend
  
  # Install additional dependencies
  npm install axios react-query @headlessui/react chart.js react-chartjs-2 web3 ethers @web3modal/ethereum @web3modal/react
  
  # Create basic project structure if it doesn't exist
  mkdir -p components/layout components/ui components/dashboard components/activity components/rewards
  mkdir -p contexts hooks
  
  # Create basic .env file
  echo 'NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_BLOCKCHAIN_NETWORK=development' > .env.local
  
  # Create Docker file
  echo 'FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects anonymous telemetry data, we disable it
ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]' > Dockerfile
  
  cd ..
fi

echo "Frontend setup completed!"