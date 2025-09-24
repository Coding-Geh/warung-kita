import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { CreateSaleCommand } from '../commands/create-sale.command';
import { SaleEntity, PaymentMethod, SaleStatus } from '../../domain/entities/sale.entity';
import { SaleItemEntity } from '../../domain/entities/saleItem.entity';
import { ProductEntity } from '../../domain/entities/product.entity';
import { SaleCreatedEvent } from '../../domain/events/sale-created.event';
import { ProductStockUpdatedEvent } from '../../domain/events/product-stock-updated.event';
import { BadRequestException } from '@nestjs/common';

@CommandHandler(CreateSaleCommand)
export class CreateSaleHandler implements ICommandHandler<CreateSaleCommand> {
	constructor(
		@InjectRepository(SaleEntity)
		private readonly salesRepo: Repository<SaleEntity>,
		@InjectRepository(SaleItemEntity)
		private readonly saleItemsRepo: Repository<SaleItemEntity>,
		@InjectRepository(ProductEntity)
		private readonly productsRepo: Repository<ProductEntity>,
		private readonly eventBus: EventBus,
	) {}

	async execute(command: CreateSaleCommand): Promise<SaleEntity> {
		const { items, discountAmount, paymentMethod, notes } = command;

		// Validate products exist and have sufficient stock
		const productIds = items.map((i) => i.productId);
		const products = await this.productsRepo.findBy({ id: In(productIds) });
		const idToProduct = new Map(products.map((p) => [p.id, p] as const));

		const saleItems: SaleItemEntity[] = [];
		let totalAmount = 0;

		for (const item of items) {
			const product = idToProduct.get(item.productId);
			if (!product) throw new BadRequestException(`Product ${item.productId} not found`);
			if (!product.isActive) throw new BadRequestException(`Product ${product.name} is not active`);
			if (product.stock < item.quantity) throw new BadRequestException(`Insufficient stock for ${product.name}`);

			const lineTotal = (product.price - (item.discount || 0)) * item.quantity;
			totalAmount += lineTotal;

			saleItems.push(
				this.saleItemsRepo.create({
					productId: product.id,
					productName: product.name,
					unitPrice: product.price,
					discount: item.discount || 0,
					quantity: item.quantity,
					lineTotal,
				}),
			);
		}

		const finalAmount = totalAmount - discountAmount;

		// Create sale
		const sale = this.salesRepo.create({
			totalAmount,
			discountAmount,
			finalAmount,
			paymentMethod: paymentMethod as PaymentMethod,
			status: SaleStatus.COMPLETED,
			notes,
			items: saleItems,
		});

		const savedSale = await this.salesRepo.save(sale);

		// Update product stock
		for (const item of items) {
			const product = idToProduct.get(item.productId)!;
			const oldStock = product.stock;
			const newStock = oldStock - item.quantity;
			await this.productsRepo.update(product.id, { stock: newStock });

			// Emit stock updated event
			this.eventBus.publish(
				new ProductStockUpdatedEvent(product.id, oldStock, newStock, -item.quantity),
			);
		}

		// Emit sale created event
		this.eventBus.publish(new SaleCreatedEvent(savedSale));

		return savedSale;
	}
}
