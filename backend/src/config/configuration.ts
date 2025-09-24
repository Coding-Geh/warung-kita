export default () => ({
	port: parseInt(process.env.PORT || '3000', 10),
	database: {
		path: process.env.DATABASE_PATH || 'pos.sqlite',
	},
	jwt: {
		secret: process.env.JWT_SECRET || 'dev-secret',
		expiresIn: process.env.JWT_EXPIRES_IN || '1d',
	},
	corsOrigin: process.env.CORS_ORIGIN || '*',
	swagger: {
		enabled: process.env.SWAGGER_ENABLED !== 'false',
		title: process.env.SWAGGER_TITLE || 'POS API - CodingGeh',
		path: process.env.SWAGGER_PATH || 'docs',
	},
});
