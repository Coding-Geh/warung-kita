import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { ProductEntity } from '../../domain/entities/product.entity';

export interface IProductRepository {
	findAll(search?: string, categoryId?: string, isActive?: boolean, page?: number, limit?: number): Promise<{ items: ProductEntity[]; meta: any }>;
	findById(id: string): Promise<ProductEntity | null>;
	create(product: Partial<ProductEntity>): Promise<ProductEntity>;
	update(id: string, product: Partial<ProductEntity>): Promise<ProductEntity>;
	delete(id: string): Promise<void>;
	findByCategory(categoryId: string): Promise<ProductEntity[]>;
}

@Injectable()
export class ProductRepository implements IProductRepository {
	constructor(
		@InjectRepository(ProductEntity)
		private readonly repo: Repository<ProductEntity>,
	) {}

	async findAll(search?: string, categoryId?: string, isActive?: boolean, page = 1, limit = 10) {
		const skip = (page - 1) * limit;
		const whereConditions: any = {};
		
		if (search) {
			whereConditions.name = ILike(`%${search}%`);
		}
		if (categoryId) {
			whereConditions.categoryId = categoryId;
		}
		if (isActive !== undefined) {
			whereConditions.isActive = isActive;
		}

		const [items, total] = await this.repo.findAndCount({
			where: whereConditions,
			relations: ['category'],
			order: { name: 'ASC' },
			skip,
			take: limit,
		});

		return {
			items,
			meta: {
				page,
				limit,
				total,
				pages: Math.ceil(total / limit),
			},
		};
	}

	async findById(id: string): Promise<ProductEntity | null> {
		return this.repo.findOne({ where: { id }, relations: ['category'] });
	}

	async create(product: Partial<ProductEntity>): Promise<ProductEntity> {
		const entity = this.repo.create(product);
		return this.repo.save(entity);
	}

	async update(id: string, product: Partial<ProductEntity>): Promise<ProductEntity> {
		await this.repo.update(id, product);
		return this.findById(id) as Promise<ProductEntity>;
	}

	async delete(id: string): Promise<void> {
		await this.repo.delete(id);
	}

	async findByCategory(categoryId: string): Promise<ProductEntity[]> {
		return this.repo.find({ where: { categoryId, isActive: true } });
	}
}
