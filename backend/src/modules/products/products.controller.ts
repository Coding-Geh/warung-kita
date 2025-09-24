import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { Roles } from '../../common/roles/roles.decorator';
import { RolesGuard } from '../../common/roles/roles.guard';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

@ApiTags('Products')
@ApiBearerAuth()
@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductsController {
	constructor(private readonly productsService: ProductsService) {}

	@Get()
	@ApiOperation({ summary: 'Get products with pagination and search', description: 'Retrieve products with optional search and pagination' })
	@ApiQuery({ name: 'q', required: false, description: 'Search query for product name or description' })
	@ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
	@ApiQuery({ name: 'limit', required: false, description: 'Items per page', example: 10 })
	@ApiResponse({ status: 200, description: 'Products retrieved successfully' })
	findAll(@Query() query: PaginationQueryDto) {
		return this.productsService.findAll(query);
	}

	@Get(':id')
	@ApiOperation({ summary: 'Get product by ID', description: 'Retrieve a specific product by its ID' })
	@ApiParam({ name: 'id', description: 'Product ID', example: 1 })
	@ApiResponse({ status: 200, description: 'Product found' })
	@ApiResponse({ status: 404, description: 'Product not found' })
	findOne(@Param('id', ParseIntPipe) id: number) {
		return this.productsService.findOne(id);
	}

	@Post()
	@Roles('admin')
	@ApiOperation({ summary: 'Create new product', description: 'Create a new product (Admin only)' })
	@ApiResponse({ status: 201, description: 'Product created successfully' })
	@ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
	create(@Body() dto: CreateProductDto) {
		return this.productsService.create(dto);
	}

	@Put(':id')
	@Roles('admin')
	@ApiOperation({ summary: 'Update product', description: 'Update an existing product (Admin only)' })
	@ApiParam({ name: 'id', description: 'Product ID', example: 1 })
	@ApiResponse({ status: 200, description: 'Product updated successfully' })
	@ApiResponse({ status: 404, description: 'Product not found' })
	@ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
	update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProductDto) {
		return this.productsService.update(id, dto);
	}

	@Delete(':id')
	@Roles('admin')
	@ApiOperation({ summary: 'Delete product', description: 'Delete a product (Admin only)' })
	@ApiParam({ name: 'id', description: 'Product ID', example: 1 })
	@ApiResponse({ status: 200, description: 'Product deleted successfully' })
	@ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
	remove(@Param('id', ParseIntPipe) id: number) {
		return this.productsService.remove(id);
	}
}
