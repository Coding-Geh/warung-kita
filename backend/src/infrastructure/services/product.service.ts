import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateProductCommand } from '../../application/commands/create-product.command';
import { GetProductsQuery } from '../../application/queries/get-products.query';
import { ProductEntity } from '../../domain/entities/product.entity';
import { ProductRepository } from '../repositories/product.repository';

@Injectable()
export class ProductService {
	constructor(
		private readonly productRepo: ProductRepository,
		private readonly commandBus: CommandBus,
		private readonly queryBus: QueryBus,
	) {}

	async findAll(search?: string, categoryId?: string, isActive?: boolean, page = 1, limit = 10) {
		return this.queryBus.execute(new GetProductsQuery(search, categoryId, isActive, page, limit));
	}

	async findById(id: string): Promise<ProductEntity> {
		const product = await this.productRepo.findById(id);
		if (!product) throw new NotFoundException('Product not found');
		return product;
	}

	async create(dto: {
		name: string;
		description?: string;
		price: number;
		stock: number;
		discount: number;
		categoryId?: string;
	}): Promise<ProductEntity> {
		if (dto.price < 0) throw new BadRequestException('Price cannot be negative');
		if (dto.stock < 0) throw new BadRequestException('Stock cannot be negative');
		if (dto.discount < 0) throw new BadRequestException('Discount cannot be negative');
		if (dto.discount > dto.price) throw new BadRequestException('Discount cannot exceed price');

		return this.commandBus.execute(
			new CreateProductCommand(dto.name, dto.price, dto.stock, dto.discount, dto.description, dto.categoryId),
		);
	}

	async update(id: string, dto: Partial<ProductEntity>): Promise<ProductEntity> {
		await this.findById(id); // Validate exists
		
		if (dto.price !== undefined && dto.price < 0) throw new BadRequestException('Price cannot be negative');
		if (dto.stock !== undefined && dto.stock < 0) throw new BadRequestException('Stock cannot be negative');
		if (dto.discount !== undefined && dto.discount < 0) throw new BadRequestException('Discount cannot be negative');
		if (dto.price !== undefined && dto.discount !== undefined && dto.discount > dto.price) {
			throw new BadRequestException('Discount cannot exceed price');
		}

		return this.productRepo.update(id, dto);
	}

	async delete(id: string): Promise<void> {
		await this.findById(id); // Validate exists
		await this.productRepo.delete(id);
	}

	async toggleActive(id: string): Promise<ProductEntity> {
		const product = await this.findById(id);
		return this.productRepo.update(id, { isActive: !product.isActive });
	}
}
