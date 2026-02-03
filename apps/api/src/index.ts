import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import clarifyRoute from './routes/clarify';
import architectureRoute from './routes/architecture';

const app = new Hono();

// Middleware
app.use('*', logger());
app.use(
    '*',
    cors({
        origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
        allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowHeaders: ['Content-Type', 'Authorization'],
    })
);

// Health check
app.get('/api/health', (c) => {
    return c.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '0.1.0',
    });
});

// Routes
app.route('/api/clarify', clarifyRoute);
app.route('/api/architecture', architectureRoute);

// 404 handler
app.notFound((c) => {
    return c.json({ error: 'Not Found' }, 404);
});

// Error handler
app.onError((err, c) => {
    console.error('Server error:', err);
    return c.json({ error: 'Internal Server Error' }, 500);
});

const port = process.env.PORT || 3001;

console.log(`🚀 API Server running on http://localhost:${port}`);

export default {
    port,
    fetch: app.fetch,
};
