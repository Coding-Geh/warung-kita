import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CategoryEntity } from '../../domain/entities/category.entity';
import { CategoryRepository } from '../repositories/category.repository';

@Injectable()
export class CategoryService {
	constructor(private readonly categoryRepo: CategoryRepository) {}

	async findAll(): Promise<CategoryEntity[]> {
		return this.categoryRepo.findAll();
	}

	async findById(id: string): Promise<CategoryEntity> {
		const category = await this.categoryRepo.findById(id);
		if (!category) throw new NotFoundException('Category not found');
		return category;
	}

	async create(dto: { name: string; description?: string }): Promise<CategoryEntity> {
		if (!dto.name?.trim()) throw new BadRequestException('Category name is required');
		
		return this.categoryRepo.create({
			name: dto.name.trim(),
			description: dto.description?.trim(),
			isActive: true,
		});
	}

	async update(id: string, dto: Partial<CategoryEntity>): Promise<CategoryEntity> {
		await this.findById(id); // Validate exists
		
		if (dto.name !== undefined && !dto.name?.trim()) {
			throw new BadRequestException('Category name cannot be empty');
		}

		return this.categoryRepo.update(id, dto);
	}

	async delete(id: string): Promise<void> {
		await this.findById(id); // Validate exists
		await this.categoryRepo.delete(id);
	}
}
