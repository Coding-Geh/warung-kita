import { Body, Controller, Post, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from '../../infrastructure/services/auth.service';
import { LoginDto } from '../../modules/auth/dto/login.dto';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt.guard';
import { ChangePasswordDto } from '../../common/dto/password-validation.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('login')
	@ApiOperation({ summary: 'User login', description: 'Authenticate user and return JWT token' })
	@ApiBody({
		description: 'Login credentials',
		schema: {
			type: 'object',
			properties: {
				username: { type: 'string', example: 'admin' },
				password: { type: 'string', example: 'admin123' },
			},
			required: ['username', 'password'],
		},
		examples: {
			admin: { value: { username: 'admin', password: 'admin123' } },
			cashier: { value: { username: 'kasir', password: 'kasir123' } },
		},
	})
	@ApiResponse({ status: 200, description: 'Login successful', schema: {
		type: 'object',
		properties: {
			success: { type: 'boolean', example: true },
			data: {
				type: 'object',
				properties: {
					accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
					refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
					user: {
						type: 'object',
						properties: {
							id: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
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

	@Post('refresh')
	@ApiOperation({ summary: 'Refresh access token', description: 'Get new access token using refresh token' })
	@ApiBody({
		description: 'Refresh token',
		schema: {
			type: 'object',
			properties: {
				refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
			},
			required: ['refreshToken']
		}
	})
	@ApiResponse({ status: 200, description: 'Token refreshed successfully', schema: {
		type: 'object',
		properties: {
			success: { type: 'boolean', example: true },
			data: {
				type: 'object',
				properties: {
					accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
				}
			}
		}
	}})
	@ApiResponse({ status: 401, description: 'Invalid refresh token' })
	refreshToken(@Body() body: { refreshToken: string }) {
		return this.authService.refreshToken(body.refreshToken);
	}

	@Post('logout')
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'User logout', description: 'Logout user and invalidate refresh token' })
	@ApiResponse({ status: 200, description: 'Logout successful', schema: {
		type: 'object',
		properties: {
			success: { type: 'boolean', example: true },
			data: {
				type: 'object',
				properties: {
					message: { type: 'string', example: 'Logged out successfully' }
				}
			}
		}
	}})
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	logout(@Request() req: any) {
		return this.authService.logout(req.user.userId);
	}

	@Post('change-password')
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Change password', description: 'Change user password with current password verification' })
	@ApiBody({
		description: 'Change password data',
		schema: {
			type: 'object',
			properties: {
				currentPassword: { type: 'string', example: 'OldPass123!' },
				password: { type: 'string', example: 'NewPass123!' }
			},
			required: ['currentPassword', 'password']
		}
	})
	@ApiResponse({ status: 200, description: 'Password changed successfully', schema: {
		type: 'object',
		properties: {
			success: { type: 'boolean', example: true },
			data: {
				type: 'object',
				properties: {
					message: { type: 'string', example: 'Password changed successfully' }
				}
			}
		}
	}})
	@ApiResponse({ status: 400, description: 'Invalid password or current password incorrect' })
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	changePassword(@Request() req: any, @Body() changePasswordDto: ChangePasswordDto) {
		return this.authService.changePassword(req.user.userId, changePasswordDto);
	}
}
