import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { ProductStockUpdatedEvent } from '../../domain/events/product-stock-updated.event';
import { AlertService } from '../../infrastructure/services/alert.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductEntity } from '../../domain/entities/product.entity';
import { logger } from '../../common/logger/winston';

@EventsHandler(ProductStockUpdatedEvent)
export class ProductStockUpdatedHandler implements IEventHandler<ProductStockUpdatedEvent> {
	constructor(
		private readonly alertService: AlertService,
		@InjectRepository(ProductEntity)
		private readonly productRepo: Repository<ProductEntity>,
	) {}

	async handle(event: ProductStockUpdatedEvent) {
		logger.info('Product stock updated', {
			productId: event.productId,
			oldStock: event.oldStock,
			newStock: event.newStock,
			change: event.change,
		});
		
		try {
			// Get product details
			const product = await this.productRepo.findOne({
				where: { id: event.productId },
			});

			if (!product) {
				logger.warn('Product not found for stock update', { productId: event.productId });
				return;
			}

			// Check if stock is out
			if (event.newStock <= 0) {
				await this.alertService.createOutOfStockAlert(product);
				logger.warn('Out of stock alert created', {
					productId: event.productId,
					productName: product.name,
					stock: event.newStock,
				});
			}
			// Check if stock is low (below threshold)
			else if (event.newStock <= 10) {
				await this.alertService.createLowStockAlert(product, 10);
				logger.warn('Low stock alert created', {
					productId: event.productId,
					productName: product.name,
					stock: event.newStock,
					threshold: 10,
				});
			}
		} catch (error) {
			logger.error('Failed to process stock update alert', error, {
				productId: event.productId,
				oldStock: event.oldStock,
				newStock: event.newStock,
			});
		}
	}
}
