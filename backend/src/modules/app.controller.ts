import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Health')
@Controller()
export class AppController {
	@Get()
	@ApiOperation({ summary: 'Health check', description: 'Check if the API is running' })
	@ApiResponse({ status: 200, description: 'API is healthy', schema: {
		type: 'object',
		properties: {
			success: { type: 'boolean', example: true },
			data: {
				type: 'object',
				properties: {
					status: { type: 'string', example: 'ok' },
					service: { type: 'string', example: 'pos-backend' },
					brand: { type: 'string', example: 'CodingGeh' }
				}
			}
		}
	}})
	health() {
		return { status: 'ok', service: 'pos-backend', brand: 'CodingGeh' };
	}
}
