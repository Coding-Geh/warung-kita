import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('login')
	@ApiOperation({ summary: 'User login', description: 'Authenticate user and return JWT token' })
	@ApiBody({ type: LoginDto, description: 'Login credentials' })
	@ApiResponse({ status: 200, description: 'Login successful', schema: {
		type: 'object',
		properties: {
			success: { type: 'boolean', example: true },
			data: {
				type: 'object',
				properties: {
					accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
					user: {
						type: 'object',
						properties: {
							id: { type: 'number', example: 1 },
							username: { type: 'string', example: 'admin' },
							role: { type: 'string', enum: ['admin', 'cashier'], example: 'admin' }
						}
					}
				}
			}
		}
	}})
	@ApiResponse({ status: 401, description: 'Invalid credentials' })
	login(@Body() dto: LoginDto) {
		return this.authService.login(dto.username, dto.password);
	}
}
