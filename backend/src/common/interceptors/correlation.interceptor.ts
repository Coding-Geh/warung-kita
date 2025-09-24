import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { logWithContext } from '../logger/winston';

@Injectable()
export class CorrelationInterceptor implements NestInterceptor {
	intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
		const ctx = context.switchToHttp();
		const request = ctx.getRequest<Request>();
		const response = ctx.getResponse<Response>();

		// Generate or extract correlation ID
		const correlationId = request.headers['x-correlation-id'] as string || uuidv4();
		
		// Add correlation ID to request and response
		request['correlationId'] = correlationId;
		response.setHeader('x-correlation-id', correlationId);

		// Create logger with context
		const logger = logWithContext(correlationId, request);

		// Log request start
		logger.info('Request started', {
			method: request.method,
			url: request.url,
			userAgent: request.headers['user-agent'],
			ip: request.ip,
		});

		const startTime = Date.now();

		return next.handle().pipe(
			tap({
				next: (data) => {
					const duration = Date.now() - startTime;
					logger.info('Request completed', {
						statusCode: response.statusCode,
						duration: `${duration}ms`,
						responseSize: JSON.stringify(data).length,
					});
				},
				error: (error) => {
					const duration = Date.now() - startTime;
					logger.error('Request failed', error, {
						statusCode: error.status || 500,
						duration: `${duration}ms`,
					});
				},
			}),
		);
	}
}
