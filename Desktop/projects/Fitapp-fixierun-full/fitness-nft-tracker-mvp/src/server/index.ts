import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import morgan from 'morgan';

// Initialize Express app
const app = express();

// Initialize Prisma Client
const prisma = new PrismaClient();

// Type for custom error with status code
interface AppError extends Error {
statusCode?: number;
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev')); // Request logging

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err: AppError, req: Request, res: Response, next: NextFunction) => {
console.error(err.stack);
res.status(err.statusCode || 500).json({
    error: {
    message: err.message || 'Internal Server Error',
    status: err.statusCode || 500
    }
});
});

// 404 handler
app.use((req: Request, res: Response) => {
res.status(404).json({
    error: {
    message: 'Not Found',
    status: 404
    }
});
});

// Start server
const PORT = process.env.PORT || 3001;

if (require.main === module) {
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
}

// Graceful shutdown
process.on('SIGTERM', async () => {
console.log('SIGTERM received. Closing HTTP server...');
await prisma.$disconnect();
process.exit(0);
});

// Export for testing
export default app;
export { prisma };

