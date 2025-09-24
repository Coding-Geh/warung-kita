import { Body, Controller, Get, Post, Query, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { SalesService } from '../../infrastructure/services/sales.service';
import { CreateSaleCommand } from '../../application/commands/create-sale.command';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt.guard';
import { Roles } from '../../infrastructure/auth/roles.decorator';
import { RolesGuard } from '../../infrastructure/auth/roles.guard';
import { Response } from 'express';

@ApiTags('Sales')
@ApiBearerAuth()
@Controller('sales')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SalesController {
	constructor(private readonly salesService: SalesService) {}

	@Get()
	@ApiOperation({ summary: 'Get sales with pagination', description: 'Retrieve sales transactions with pagination' })
	@ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
	@ApiQuery({ name: 'limit', required: false, description: 'Items per page', example: 10 })
	@ApiResponse({ status: 200, description: 'Sales retrieved successfully' })
	findAll(@Query('page') page = 1, @Query('limit') limit = 10) {
		return this.salesService.findAll(Number(page), Number(limit));
	}

	@Post()
	@Roles('admin', 'cashier')
	@ApiOperation({ summary: 'Create new sale', description: 'Create a new sale transaction (Admin/Cashier)' })
	// @ts-ignore
	@ApiBody({
		description: 'Sale payload',
		schema: {
			type: 'object',
			properties: {
				items: {
					type: 'array',
					items: {
						type: 'object',
						properties: {
							productId: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
							quantity: { type: 'number', example: 2 },
							discount: { type: 'number', example: 0 },
						},
						required: ['productId', 'quantity'],
					},
					example: [
						{ productId: '123e4567-e89b-12d3-a456-426614174000', quantity: 1 },
						{ productId: '223e4567-e89b-12d3-a456-426614174000', quantity: 2, discount: 1000 },
					],
				},
				discountAmount: { type: 'number', example: 0 },
				paymentMethod: { type: 'string', enum: ['cash', 'card', 'qris'], example: 'cash' },
				notes: { type: 'string', example: 'Terima kasih' },
			},
			required: ['items'],
		},
	})
	@ApiResponse({ status: 201, description: 'Sale created successfully' })
	@ApiResponse({ status: 400, description: 'Bad request - Invalid data or insufficient stock' })
	@ApiResponse({ status: 403, description: 'Forbidden - Admin/Cashier access required' })
	create(@Body() dto: any) {
		const command = new CreateSaleCommand(
			dto.items,
			dto.discountAmount || 0,
			dto.paymentMethod || 'cash',
			dto.notes,
		);
		return this.salesService.createSale(command);
	}

	@Get('export')
	@Roles('admin')
	@ApiOperation({ summary: 'Export sales to CSV', description: 'Export all sales data to CSV format (Admin only)' })
	@ApiResponse({ status: 200, description: 'CSV file downloaded' })
	@ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
	async exportCsv(@Res() res: Response) {
		const csv = await this.salesService.exportCsv();
		res.setHeader('Content-Type', 'text/csv');
		res.setHeader('Content-Disposition', 'attachment; filename="sales.csv"');
		res.send(csv);
	}
}
