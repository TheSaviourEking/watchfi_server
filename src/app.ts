import fastify, { FastifyReply, FastifyRequest } from 'fastify';
import multipart from "@fastify/multipart";
import prisma from './lib/prisma.js';
import productRoutes from './modules/products/product.route.js';
import bookingRoutes from './modules/bookings/booking.route.js';
import customerRoutes from './modules/customer/customer.route.js';
import filterRoutes from './modules/filter/filter.route.js';
import brandRoutes from './modules/brand/brands.route.js';
import colorRoutes from './modules/colors/color.route.js';
import conceptRoutes from './modules/concepts/concepts.route.js';
import categoriesRoutes from './modules/categories/categories.route.js';
import materialRoutes from './modules/materials/materials.route.js';

const server = fastify({
    logger: {
        level: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
    }
});

await server.register(multipart, {
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Register CORS plugin
// await server.register(import('@fastify/cors'), {
//     origin: process.env.NODE_ENV === 'production'
//         ? ['https://watchfi-server.onrender.com', 'https://watchfi-prod.onrender.com', "https://watchfi-client.vercel.app"]
//         : true,
//     credentials: true,
// });

// await server.register(import('@fastify/cors'), {
//     origin: process.env.NODE_ENV === 'production'
//         ? ['http://18.205.156.100', "https://watchfi.app", "https://www.watchfi.app", 'https://watchfi-server.onrender.com', 'https://watchfi-prod.onrender.com', "https://watchfi-client.vercel.app"] : true,
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Include PUT
//     allowedHeaders: ['Content-Type', 'Authorization'], // Include headers used in your requests
//     credentials: true, // If your frontend sends cookies or auth headers
//     preflight: true, // Enable preflight handling
// });


server.setSerializerCompiler(() => {
    return (data) => JSON.stringify(data, (key, value) => {
        if (typeof value === 'bigint') {
            return Number(value); // or value.toString() for string
        }
        return value;
    });
});

// Health check endpoint
server.get('/api/v1/health', async (_, reply: FastifyReply) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        return {
            status: 'healthy',
            database: 'connected',
            environment: process.env.NODE_ENV || 'development',
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        reply.status(500).send({
            error: 'Database connection failed',
            details: error.message
        });
    }
});


// Register API routes - MOVED BEFORE setNotFoundHandler
server.register(productRoutes, { prefix: '/api/v1/collections' });
server.register(brandRoutes, { prefix: '/api/v1/brands' });
server.register(colorRoutes, { prefix: '/api/v1/colors' });
server.register(conceptRoutes, { prefix: '/api/v1/concepts' });
server.register(categoriesRoutes, { prefix: '/api/v1/categories' });
server.register(materialRoutes, { prefix: '/api/v1/materials' });
server.register(bookingRoutes, { prefix: '/api/v1/bookings' });
server.register(customerRoutes, { prefix: '/api/v1/customers' });
server.register(filterRoutes, { prefix: '/api/v1/filter' });

// Handle SPA routing: Serve index.html for all non-API routes
// server.setNotFoundHandler(async (request: FastifyRequest, reply: FastifyReply) => {
//     // Skip API routes - let them return 404 naturally
//     if (request.url.startsWith('/api')) {
//         return reply.status(404).send({ error: 'API endpoint not found' });
//     }
// });

// Start the server
const start = async () => {
    try {
        const port = Number(process.env.PORT) || 5000;
        const host = process.env.HOST || '0.0.0.0';

        server.log.info(`Starting server on ${host}:${port}`);
        server.log.info(`Environment: ${process.env.NODE_ENV || 'development'}`);

        await server.listen({ port, host });

        server.log.info(`🚀 Server running at http://${host}:${port}`);
    } catch (err) {
        server.log.error(err);
        await prisma.$disconnect();
        process.exit(1);
    }
};

// Graceful shutdown handlers
const gracefulShutdown = async (signal: string) => {
    server.log.info(`Received ${signal}. Performing graceful shutdown...`);
    try {
        await server.close();
        await prisma.$disconnect();
        process.exit(0);
    } catch (error) {
        server.log.error('Error during shutdown:', error);
        process.exit(1);
    }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.log(error)
    server.log.error('Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    server.log.error('Unhandled Rejection at:', promise, 'reason:', reason);
    console.error('Detailed Unhandled Rejection:', { promise, reason, stack: reason.stack });
    process.exit(1);
});

start();