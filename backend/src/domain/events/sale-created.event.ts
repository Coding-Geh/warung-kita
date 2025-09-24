import { IEvent } from '@nestjs/cqrs';
import { SaleEntity } from '../entities/sale.entity';

export class SaleCreatedEvent implements IEvent {
	constructor(public readonly sale: SaleEntity) {}
}
