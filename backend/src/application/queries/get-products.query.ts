import { IQuery } from '@nestjs/cqrs';

export class GetProductsQuery implements IQuery {
	constructor(
		public readonly search?: string,
		public readonly categoryId?: string,
		public readonly isActive?: boolean,
		public readonly page: number = 1,
		public readonly limit: number = 10,
	) {}
}
