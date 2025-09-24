import { IQuery } from '@nestjs/cqrs';

export class GetSalesAnalyticsQuery implements IQuery {
	constructor(
		public readonly startDate: Date,
		public readonly endDate: Date,
		public readonly groupBy: 'day' | 'week' | 'month' = 'day',
	) {}
}
