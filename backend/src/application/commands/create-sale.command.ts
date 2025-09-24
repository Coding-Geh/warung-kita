import { ICommand } from '@nestjs/cqrs';

export class CreateSaleItemDto {
	productId: string;
	quantity: number;
	discount?: number;
}

export class CreateSaleCommand implements ICommand {
	constructor(
		public readonly items: CreateSaleItemDto[],
		public readonly discountAmount: number,
		public readonly paymentMethod: string,
		public readonly notes?: string,
	) {}
}
