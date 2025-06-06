#!/bin/bash
set -e

# Create microservices structure if it doesn't exist
mkdir -p backend/services/activity-tracking
mkdir -p backend/services/rewards
mkdir -p backend/services/analytics
mkdir -p backend/services/challenges
mkdir -p backend/services/nft-management

# Initialize activity tracking service
if [ ! -f backend/services/activity-tracking/package.json ]; then
  echo "Initializing activity tracking service..."
  cd backend/services/activity-tracking
  npm init -y
  npm install express mongoose dotenv cors helmet winston
  npm install --save-dev nodemon typescript ts-node @types/express @types/node
  
  # Create basic typescript config
  echo '{
  "compilerOptions": {
    "target": "es2018",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "**/*.test.ts"]
}' > tsconfig.json
  
  # Create basic service structure
  mkdir -p src/controllers src/models src/routes src/services src/config
  
  # Create main app file
  mkdir -p src
  echo 'import express from "express";
import cors from "cors";
import helmet from "helmet";
import routes from "./routes";

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use("/api", routes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Activity tracking service running on port ${PORT}`);
});

export default app;' > src/app.ts

  # Create index file
  echo 'import app from "./app";

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});' > src/index.ts

  # Create basic routes file
  echo 'import { Router } from "express";

const router = Router();

router.get("/activities", (req, res) => {
  res.json({ message: "Activities endpoint" });
});

export default router;' > src/routes.ts

  # Create Dockerfile
  echo 'FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3001

CMD ["node", "dist/index.js"]' > Dockerfile

  # Update package.json scripts
  npm pkg set scripts.dev="nodemon --exec ts-node src/index.ts"
  npm pkg set scripts.build="tsc"
  npm pkg set scripts.start="node dist/index.js"
  
  cd ../../..
fi

# Note: You would repeat similar setup for other services
# For brevity, I've only included the activity tracking service setup

echo "Backend services structure initialized!"