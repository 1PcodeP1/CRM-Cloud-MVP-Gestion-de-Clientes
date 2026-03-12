import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

// Middleware for HTTPS redirect
function HttpsRedirectMiddleware(req: Request, res: Response, next: NextFunction) {
    if (process.env.NODE_ENV === 'production' && req.headers['x-forwarded-proto'] !== 'https') {
        return res.redirect(301, `https://${req.hostname}${req.originalUrl}`);
    }
    next();
}

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // HTTPS Redirect middleware (as requested)
    app.use(HttpsRedirectMiddleware);

    // CORS Configuration
    app.enableCors({
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
    });

    // Global validation pipe
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            transform: true,
            forbidNonWhitelisted: true,
        }),
    );

    const port = process.env.PORT || 3000;
    await app.listen(port);
    console.log(`Backend is running on: http://localhost:${port}`);
}

bootstrap();
