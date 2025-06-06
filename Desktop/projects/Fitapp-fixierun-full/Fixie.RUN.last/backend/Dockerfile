FROM node:18-alpine

WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript code
RUN npm run build

# Expose API port
EXPOSE 3001

# Start the application
CMD ["node", "dist/server.js"]
