import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import clarifyRouter from './routes/clarify';
import architectureRouter from './routes/architecture';
import databaseRouter from './routes/database';
import apiDesignRouter from './routes/api-design';
import { blueprintRouter } from './routes/blueprint';

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Request logging
app.use((req: Request, _res: Response, next: NextFunction) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '0.3.0',
        features: ['streaming', 'stepwise-generation', 'blueprint'],
    });
});

// Routes
app.use('/api/clarify', clarifyRouter);
app.use('/api/architecture', architectureRouter);
app.use('/api/database', databaseRouter);
app.use('/api/api-design', apiDesignRouter);
app.use('/api/blueprint', blueprintRouter);

// 404 handler
app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: 'Not Found' });
});

// Error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

app.listen(port, () => {
    console.log(`🚀 API Server running on http://localhost:${port}`);
    console.log(`📡 LLM endpoint: ${process.env.LLM_BASE_URL || 'http://localhost:1234'}`);
    console.log(`✨ Features: Streaming SSE, Stepwise Generation, Blueprint`);
});

export default app;
