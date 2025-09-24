import { createLogger, format, transports } from 'winston';
import { v4 as uuidv4 } from 'uuid';

// Custom format untuk correlation ID
const correlationIdFormat = format((info) => {
	info.correlationId = info.correlationId || uuidv4();
	return info;
});

// Custom format untuk request context
const requestContextFormat = format((info) => {
	if (info.req) {
		const req = info.req as any;
		info.httpRequest = {
			requestMethod: req.method,
			requestUrl: req.url,
			requestSize: req.headers?.['content-length'],
			userAgent: req.headers?.['user-agent'],
			remoteIp: req.ip || req.connection?.remoteAddress,
			referer: req.headers?.referer,
		};
		delete info.req;
	}
	return info;
});

export const createWinstonLogger = () => {
	return createLogger({
		level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
		format: format.combine(
			format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
			format.errors({ stack: true }),
			correlationIdFormat(),
			requestContextFormat(),
			format.json(),
		),
		defaultMeta: { 
			service: 'pos-backend',
			version: process.env.npm_package_version || '1.0.0',
			environment: process.env.NODE_ENV || 'development'
		},
		transports: [
			new transports.Console({
				format: format.combine(
					format.colorize({ all: true }),
					format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
					format.printf(({ timestamp, level, message, correlationId, ...meta }) => {
						const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
						return `${timestamp} [${correlationId}] ${level}: ${message} ${metaStr}`;
					}),
				),
			}),
		],
		// Handle uncaught exceptions
		exceptionHandlers: [
			new transports.Console({
				format: format.combine(
					format.colorize(),
					format.timestamp(),
					format.printf(({ timestamp, level, message, stack }) => {
						return `${timestamp} ${level}: ${message}\n${stack}`;
					}),
				),
			}),
		],
		// Handle unhandled promise rejections
		rejectionHandlers: [
			new transports.Console({
				format: format.combine(
					format.colorize(),
					format.timestamp(),
					format.printf(({ timestamp, level, message, stack }) => {
						return `${timestamp} ${level}: ${message}\n${stack}`;
					}),
				),
			}),
		],
	});
};

// Logger instance
export const logger = createWinstonLogger();

// Helper functions untuk structured logging
export const logWithContext = (correlationId: string, req?: any) => {
	return {
		info: (message: string, meta?: any) => logger.info(message, { correlationId, req, ...meta }),
		error: (message: string, error?: Error, meta?: any) => logger.error(message, { 
			correlationId, 
			req, 
			error: error?.message, 
			stack: error?.stack,
			...meta 
		}),
		warn: (message: string, meta?: any) => logger.warn(message, { correlationId, req, ...meta }),
		debug: (message: string, meta?: any) => logger.debug(message, { correlationId, req, ...meta }),
	};
};
