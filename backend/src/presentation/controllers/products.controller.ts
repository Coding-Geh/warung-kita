import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth, ApiQuery, ApiBody } from '@nestjs/swagger';
import { ProductService } from '../../infrastructure/services/product.service';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt.guard';
import { Roles } from '../../infrastructure/auth/roles.decorator';
import { RolesGuard } from '../../infrastructure/auth/roles.guard';

@ApiTags('Products')
@ApiBearerAuth()
@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductsController {
	constructor(private readonly productService: ProductService) {}

	@Get()
	@ApiOperation({ summary: 'Get products with pagination', description: 'Retrieve products with search, category filter, and pagination' })
	@ApiQuery({ name: 'search', required: false, description: 'Search by product name', example: 'coffee' })
	@ApiQuery({ name: 'categoryId', required: false, description: 'Filter by category ID', example: '123e4567-e89b-12d3-a456-426614174000' })
	@ApiQuery({ name: 'isActive', required: false, description: 'Filter by active status', example: true })
	@ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
	@ApiQuery({ name: 'limit', required: false, description: 'Items per page', example: 10 })
	@ApiResponse({ status: 200, description: 'Products retrieved successfully' })
	findAll(
		@Query('search') search?: string,
		@Query('categoryId') categoryId?: string,
		@Query('isActive') isActive?: boolean,
		@Query('page') page = 1,
		@Query('limit') limit = 10,
	) {
		return this.productService.findAll(search, categoryId, isActive, Number(page), Number(limit));
	}

	@Get(':id')
	@ApiOperation({ summary: 'Get product by ID', description: 'Retrieve a specific product by its UUID' })
	@ApiParam({ name: 'id', description: 'Product ID (UUID)', example: '123e4567-e89b-12d3-a456-426614174000' })
	@ApiResponse({ status: 200, description: 'Product found' })
	@ApiResponse({ status: 404, description: 'Product not found' })
	findOne(@Param('id') id: string) {
		return this.productService.findById(id);
	}

	@Post()
	@Roles('admin')
	@ApiOperation({ summary: 'Create new product', description: 'Create a new product (Admin only)' })
	// Provide clear examples so Swagger auto-fills
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	@ApiBody({
		description: 'Product payload',
		schema: {
			type: 'object',
			properties: {
				name: { type: 'string', example: 'Kopi CodingGeh Premium' },
				description: { type: 'string', example: 'Signature blend coffee with rich aroma' },
				price: { type: 'number', example: 25000 },
				stock: { type: 'number', example: 100 },
				discount: { type: 'number', example: 0 },
				categoryId: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
			},
			required: ['name', 'price', 'stock'],
		},
	})
	@ApiResponse({ status: 201, description: 'Product created successfully' })
	@ApiResponse({ status: 400, description: 'Bad request - Invalid data' })
	@ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
	create(@Body() dto: {
		name: string;
		description?: string;
		price: number;
		stock: number;
		discount: number;
		categoryId?: string;
	}) {
		return this.productService.create(dto);
	}

	@Put(':id')
	@Roles('admin')
	@ApiOperation({ summary: 'Update product', description: 'Update an existing product (Admin only)' })
	@ApiParam({ name: 'id', description: 'Product ID (UUID)', example: '123e4567-e89b-12d3-a456-426614174000' })
	@ApiResponse({ status: 200, description: 'Product updated successfully' })
	@ApiResponse({ status: 404, description: 'Product not found' })
	@ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
	update(@Param('id') id: string, @Body() dto: Partial<{
		name: string;
		description: string;
		price: number;
		stock: number;
		discount: number;
		categoryId: string;
		isActive: boolean;
	}>) {
		return this.productService.update(id, dto);
	}

	@Delete(':id')
	@Roles('admin')
	@ApiOperation({ summary: 'Delete product', description: 'Delete a product (Admin only)' })
	@ApiParam({ name: 'id', description: 'Product ID (UUID)', example: '123e4567-e89b-12d3-a456-426614174000' })
	@ApiResponse({ status: 200, description: 'Product deleted successfully' })
	@ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
	remove(@Param('id') id: string) {
		return this.productService.delete(id);
	}

	@Put(':id/toggle')
	@Roles('admin')
	@ApiOperation({ summary: 'Toggle product active status', description: 'Toggle product active/inactive status (Admin only)' })
	@ApiParam({ name: 'id', description: 'Product ID (UUID)', example: '123e4567-e89b-12d3-a456-426614174000' })
	@ApiResponse({ status: 200, description: 'Product status toggled successfully' })
	@ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
	toggleActive(@Param('id') id: string) {
		return this.productService.toggleActive(id);
	}
}
