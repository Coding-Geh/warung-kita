import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateProductCommand } from '../commands/create-product.command';
import { ProductEntity } from '../../domain/entities/product.entity';
import { IProductRepository, ProductRepository } from '../../infrastructure/repositories/product.repository';

@CommandHandler(CreateProductCommand)
export class CreateProductHandler implements ICommandHandler<CreateProductCommand> {
	constructor(@Inject(ProductRepository) private readonly productRepo: IProductRepository) {}

	async execute(command: CreateProductCommand): Promise<ProductEntity> {
		const { name, description, price, stock, discount, categoryId } = command;

		return this.productRepo.create({
			name,
			description,
			price,
			stock,
			discount,
			categoryId,
			isActive: true,
		});
	}
}
