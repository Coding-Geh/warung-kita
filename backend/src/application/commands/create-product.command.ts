import { ICommand } from '@nestjs/cqrs';

export class CreateProductCommand implements ICommand {
	constructor(
		public readonly name: string,
		public readonly price: number,
		public readonly stock: number,
		public readonly discount: number,
		public readonly description?: string,
		public readonly categoryId?: string,
	) {}
}
