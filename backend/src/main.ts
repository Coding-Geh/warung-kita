import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';
import { ValidationPipe } from '@nestjs/common';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { CorrelationInterceptor } from './common/interceptors/correlation.interceptor';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import * as compression from 'compression';
import rateLimit from 'express-rate-limit';
import { ConfigService } from '@nestjs/config';
import { logger } from './common/logger/winston';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	const configService = app.get(ConfigService);
	const port = configService.get<number>('port') ?? 3000;
	const corsOrigin = configService.get<string>('corsOrigin') ?? '*';
	const swaggerEnabled = configService.get<boolean>('swagger.enabled') ?? true;
	const swaggerTitle = configService.get<string>('swagger.title') ?? 'POS API - CodingGeh';
	const swaggerPath = configService.get<string>('swagger.path') ?? 'docs';

	app.setGlobalPrefix('api');
	app.enableCors({ origin: corsOrigin === '*' ? true : corsOrigin.split(',').map((s) => s.trim()), credentials: true });
	app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
	app.useGlobalInterceptors(new CorrelationInterceptor(), new TransformInterceptor());
	app.useGlobalFilters(new AllExceptionsFilter());

	app.use(helmet());
	app.use(compression());
	app.use(rateLimit({ windowMs: 60 * 1000, max: 120 }));

	if (swaggerEnabled) {
		const config = new DocumentBuilder()
			.setTitle(swaggerTitle)
			.setVersion('1.0.0')
			.setDescription('POS API documentation. Use the example bodies in each endpoint form to try requests.')
			.addServer('http://localhost:' + String(port))
			.addBearerAuth()
			.build();
		const document = SwaggerModule.createDocument(app, config);
		SwaggerModule.setup(swaggerPath, app, document);
	}

	await app.listen(port);
	logger.info('POS Backend started successfully', {
		port,
		swaggerPath,
		environment: process.env.NODE_ENV || 'development'
	});
	console.log(`🚀 POS Backend running on http://localhost:${port}`);
	console.log(`📚 Swagger docs available at http://localhost:${port}/${swaggerPath}`);
	console.log(`🏷️ Example POS by CodingGeh`);
}
bootstrap();
