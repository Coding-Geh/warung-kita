import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { GetProductsQuery } from '../queries/get-products.query';
import { ProductEntity } from '../../domain/entities/product.entity';

@QueryHandler(GetProductsQuery)
export class GetProductsHandler implements IQueryHandler<GetProductsQuery> {
	constructor(
		@InjectRepository(ProductEntity)
		private readonly productsRepo: Repository<ProductEntity>,
	) {}

	async execute(query: GetProductsQuery) {
		const { search, categoryId, isActive, page, limit } = query;
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

		const [items, total] = await this.productsRepo.findAndCount({
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
}
