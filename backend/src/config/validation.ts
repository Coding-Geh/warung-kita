import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
	NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
	PORT: Joi.number().default(3000),
	DATABASE_PATH: Joi.string().default('pos.sqlite'),
	JWT_SECRET: Joi.string().default('dev-secret'),
	JWT_EXPIRES_IN: Joi.string().default('1d'),
	CORS_ORIGIN: Joi.string().default('*'),
	SWAGGER_ENABLED: Joi.boolean().default(true),
	SWAGGER_TITLE: Joi.string().default('POS API - CodingGeh'),
	SWAGGER_PATH: Joi.string().default('docs'),
});
