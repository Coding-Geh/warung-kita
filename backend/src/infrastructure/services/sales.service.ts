import { Inject, Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CreateSaleCommand } from '../../application/commands/create-sale.command';
import { SaleEntity } from '../../domain/entities/sale.entity';
import { ISalesRepository, SalesRepository } from '../repositories/sales.repository';

@Injectable()
export class SalesService {
	constructor(
		@Inject(SalesRepository) private readonly salesRepo: ISalesRepository,
		private readonly commandBus: CommandBus,
	) {}

	async findAll(page = 1, limit = 10) {
		return this.salesRepo.findAll(page, limit);
	}

	async findById(id: string): Promise<SaleEntity> {
		const sale = await this.salesRepo.findById(id);
		if (!sale) throw new Error('Sale not found');
		return sale;
	}

	async createSale(command: CreateSaleCommand): Promise<SaleEntity> {
		return this.commandBus.execute(command);
	}

	async exportCsv(): Promise<string> {
		return this.salesRepo.exportCsv();
	}
}
