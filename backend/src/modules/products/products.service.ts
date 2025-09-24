import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { ProductEntity } from './product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

@Injectable()
export class ProductsService {
	constructor(
		@InjectRepository(ProductEntity)
		private readonly productsRepo: Repository<ProductEntity>,
	) {}

	async findAll(query: PaginationQueryDto) {
		const page = query.page ?? 1;
		const limit = query.limit ?? 10;
		const where = query.q ? [{ name: ILike(`%${query.q}%`) }, { description: ILike(`%${query.q}%`) }] : undefined;
		const [items, total] = await this.productsRepo.findAndCount({
			where,
			order: { name: 'ASC' },
			skip: (page - 1) * limit,
			take: limit,
		});
		return { items, meta: { page, limit, total, pages: Math.ceil(total / limit) } };
	}

	async findOne(id: number): Promise<ProductEntity> {
		const product = await this.productsRepo.findOne({ where: { id } });
		if (!product) throw new NotFoundException('Product not found');
		return product;
	}

	create(dto: CreateProductDto): Promise<ProductEntity> {
		const entity = this.productsRepo.create(dto);
		return this.productsRepo.save(entity);
	}

	async update(id: number, dto: UpdateProductDto): Promise<ProductEntity> {
		const product = await this.findOne(id);
		Object.assign(product, dto);
		return this.productsRepo.save(product);
	}

	async remove(id: number): Promise<void> {
		await this.productsRepo.delete(id);
	}
}
