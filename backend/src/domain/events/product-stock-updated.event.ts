import { IEvent } from '@nestjs/cqrs';
import { ProductEntity } from '../entities/product.entity';

export class ProductStockUpdatedEvent implements IEvent {
	constructor(
		public readonly productId: string,
		public readonly oldStock: number,
		public readonly newStock: number,
		public readonly change: number,
	) {}
}
