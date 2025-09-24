import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { CategoryService } from '../../infrastructure/services/category.service';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt.guard';
import { Roles } from '../../infrastructure/auth/roles.decorator';
import { RolesGuard } from '../../infrastructure/auth/roles.guard';

@ApiTags('Categories')
@ApiBearerAuth()
@Controller('categories')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CategoryController {
	constructor(private readonly categoryService: CategoryService) {}

	@Get()
	@ApiOperation({ summary: 'Get all categories', description: 'Retrieve all active categories' })
	@ApiResponse({ status: 200, description: 'Categories retrieved successfully' })
	findAll() {
		return this.categoryService.findAll();
	}

	@Get(':id')
	@ApiOperation({ summary: 'Get category by ID', description: 'Retrieve a specific category by its ID' })
	@ApiParam({ name: 'id', description: 'Category ID (UUID)', example: '123e4567-e89b-12d3-a456-426614174000' })
	@ApiResponse({ status: 200, description: 'Category found' })
	@ApiResponse({ status: 404, description: 'Category not found' })
	findOne(@Param('id') id: string) {
		return this.categoryService.findById(id);
	}

	@Post()
	@Roles('admin')
	@ApiOperation({ summary: 'Create new category', description: 'Create a new category (Admin only)' })
	// @ts-ignore
	@ApiBody({
		description: 'Category payload',
		schema: {
			type: 'object',
			properties: {
				name: { type: 'string', example: 'Minuman' },
				description: { type: 'string', example: 'Berbagai jenis minuman' },
			},
			required: ['name'],
		},
	})
	@ApiResponse({ status: 201, description: 'Category created successfully' })
	@ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
	create(@Body() dto: { name: string; description?: string }) {
		return this.categoryService.create(dto);
	}

	@Put(':id')
	@Roles('admin')
	@ApiOperation({ summary: 'Update category', description: 'Update an existing category (Admin only)' })
	@ApiParam({ name: 'id', description: 'Category ID (UUID)', example: '123e4567-e89b-12d3-a456-426614174000' })
	@ApiResponse({ status: 200, description: 'Category updated successfully' })
	@ApiResponse({ status: 404, description: 'Category not found' })
	@ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
	update(@Param('id') id: string, @Body() dto: { name?: string; description?: string }) {
		return this.categoryService.update(id, dto);
	}

	@Delete(':id')
	@Roles('admin')
	@ApiOperation({ summary: 'Delete category', description: 'Delete a category (Admin only)' })
	@ApiParam({ name: 'id', description: 'Category ID (UUID)', example: '123e4567-e89b-12d3-a456-426614174000' })
	@ApiResponse({ status: 200, description: 'Category deleted successfully' })
	@ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
	remove(@Param('id') id: string) {
		return this.categoryService.delete(id);
	}
}
