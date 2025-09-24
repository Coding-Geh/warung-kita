import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoryEntity } from '../../domain/entities/category.entity';

export interface ICategoryRepository {
	findAll(): Promise<CategoryEntity[]>;
	findById(id: string): Promise<CategoryEntity | null>;
	create(category: Partial<CategoryEntity>): Promise<CategoryEntity>;
	update(id: string, category: Partial<CategoryEntity>): Promise<CategoryEntity>;
	delete(id: string): Promise<void>;
}

@Injectable()
export class CategoryRepository implements ICategoryRepository {
	constructor(
		@InjectRepository(CategoryEntity)
		private readonly repo: Repository<CategoryEntity>,
	) {}

	async findAll(): Promise<CategoryEntity[]> {
		return this.repo.find({ where: { isActive: true }, order: { name: 'ASC' } });
	}

	async findById(id: string): Promise<CategoryEntity | null> {
		return this.repo.findOne({ where: { id } });
	}

	async create(category: Partial<CategoryEntity>): Promise<CategoryEntity> {
		const entity = this.repo.create(category);
		return this.repo.save(entity);
	}

	async update(id: string, category: Partial<CategoryEntity>): Promise<CategoryEntity> {
		await this.repo.update(id, category);
		return this.findById(id) as Promise<CategoryEntity>;
	}

	async delete(id: string): Promise<void> {
		await this.repo.delete(id);
	}
}
