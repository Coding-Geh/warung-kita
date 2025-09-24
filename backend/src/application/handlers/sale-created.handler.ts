import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { SaleCreatedEvent } from '../../domain/events/sale-created.event';

@EventsHandler(SaleCreatedEvent)
export class SaleCreatedHandler implements IEventHandler<SaleCreatedEvent> {
	handle(event: SaleCreatedEvent) {
		console.log(`[SALE_CREATED] Sale ${event.sale.id} created with total: ${event.sale.finalAmount}`);
		// Here you can add:
		// - Send notification
		// - Update analytics
		// - Send to external systems
		// - Log to audit trail
	}
}
