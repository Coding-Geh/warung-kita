import { Body, Controller, Get, Post, Query, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { Roles } from '../../common/roles/roles.decorator';
import { RolesGuard } from '../../common/roles/roles.guard';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
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
	findAll(@Query() query: PaginationQueryDto) {
		return this.salesService.findAll(query);
	}

	@Post()
	@Roles('admin', 'cashier')
	@ApiOperation({ summary: 'Create new sale', description: 'Create a new sale transaction (Admin/Cashier)' })
	@ApiResponse({ status: 201, description: 'Sale created successfully' })
	@ApiResponse({ status: 400, description: 'Bad request - Invalid data or insufficient stock' })
	@ApiResponse({ status: 403, description: 'Forbidden - Admin/Cashier access required' })
	create(@Body() dto: CreateSaleDto) {
		return this.salesService.createSale(dto);
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
