import { Controller, Get, Post, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AlertService } from '../../infrastructure/services/alert.service';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt.guard';
import { RolesGuard } from '../../infrastructure/auth/roles.guard';
import { Roles } from '../../common/roles/roles.decorator';

@ApiTags('Alerts')
@Controller('alerts')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AlertsController {
	constructor(private readonly alertService: AlertService) {}

	@Get()
	@Roles('admin', 'cashier')
	@ApiOperation({ summary: 'Get active alerts', description: 'Get all active alerts for the system' })
	@ApiResponse({ status: 200, description: 'Alerts retrieved successfully', schema: {
		type: 'object',
		properties: {
			success: { type: 'boolean', example: true },
			data: {
				type: 'array',
				items: {
					type: 'object',
					properties: {
						id: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
						type: { type: 'string', enum: ['low_stock', 'out_of_stock', 'reorder_required'] },
						status: { type: 'string', enum: ['active', 'acknowledged', 'resolved'] },
						title: { type: 'string', example: 'Low Stock Alert' },
						message: { type: 'string', example: 'Product "Kopi CodingGeh" has low stock: 5 units' },
						action: { type: 'string', example: 'Consider restocking this product' },
						isRead: { type: 'boolean', example: false },
						createdAt: { type: 'string', format: 'date-time' },
						product: {
							type: 'object',
							properties: {
								id: { type: 'string' },
								name: { type: 'string' },
								stock: { type: 'number' }
							}
						}
					}
				}
			}
		}
	}})
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	async getActiveAlerts() {
		const alerts = await this.alertService.getActiveAlerts();
		return { success: true, data: alerts };
	}

	@Get('unread-count')
	@Roles('admin', 'cashier')
	@ApiOperation({ summary: 'Get unread alerts count', description: 'Get count of unread alerts' })
	@ApiResponse({ status: 200, description: 'Unread count retrieved successfully', schema: {
		type: 'object',
		properties: {
			success: { type: 'boolean', example: true },
			data: {
				type: 'object',
				properties: {
					count: { type: 'number', example: 5 }
				}
			}
		}
	}})
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	async getUnreadCount() {
		const count = await this.alertService.getUnreadAlertsCount();
		return { success: true, data: { count } };
	}

	@Post(':id/acknowledge')
	@Roles('admin')
	@ApiOperation({ summary: 'Acknowledge alert', description: 'Acknowledge an alert (Admin only)' })
	@ApiResponse({ status: 200, description: 'Alert acknowledged successfully', schema: {
		type: 'object',
		properties: {
			success: { type: 'boolean', example: true },
			data: {
				type: 'object',
				properties: {
					message: { type: 'string', example: 'Alert acknowledged successfully' }
				}
			}
		}
	}})
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
	async acknowledgeAlert(@Param('id') alertId: string) {
		await this.alertService.acknowledgeAlert(alertId);
		return { success: true, data: { message: 'Alert acknowledged successfully' } };
	}

	@Post(':id/resolve')
	@Roles('admin')
	@ApiOperation({ summary: 'Resolve alert', description: 'Resolve an alert (Admin only)' })
	@ApiResponse({ status: 200, description: 'Alert resolved successfully', schema: {
		type: 'object',
		properties: {
			success: { type: 'boolean', example: true },
			data: {
				type: 'object',
				properties: {
					message: { type: 'string', example: 'Alert resolved successfully' }
				}
			}
		}
	}})
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
	async resolveAlert(@Param('id') alertId: string) {
		await this.alertService.resolveAlert(alertId);
		return { success: true, data: { message: 'Alert resolved successfully' } };
	}

	@Post(':id/read')
	@Roles('admin', 'cashier')
	@ApiOperation({ summary: 'Mark alert as read', description: 'Mark an alert as read' })
	@ApiResponse({ status: 200, description: 'Alert marked as read successfully', schema: {
		type: 'object',
		properties: {
			success: { type: 'boolean', example: true },
			data: {
				type: 'object',
				properties: {
					message: { type: 'string', example: 'Alert marked as read successfully' }
				}
			}
		}
	}})
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	async markAsRead(@Param('id') alertId: string) {
		await this.alertService.markAsRead(alertId);
		return { success: true, data: { message: 'Alert marked as read successfully' } };
	}
}
