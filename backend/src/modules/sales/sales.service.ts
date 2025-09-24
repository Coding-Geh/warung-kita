import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { SaleEntity } from './sale.entity';
import { SaleItemEntity } from './saleItem.entity';
import { CreateSaleDto } from './dto/create-sale.dto';
import { ProductEntity } from '../products/product.entity';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

@Injectable()
export class SalesService {
	constructor(
		@InjectRepository(SaleEntity)
		private readonly salesRepo: Repository<SaleEntity>,
		@InjectRepository(SaleItemEntity)
		private readonly saleItemsRepo: Repository<SaleItemEntity>,
		@InjectRepository(ProductEntity)
		private readonly productsRepo: Repository<ProductEntity>,
	) {}

	async createSale(dto: CreateSaleDto) {
		const productIds = dto.items.map((i) => i.productId);
		const products = await this.productsRepo.findBy({ id: In(productIds) });

		const idToProduct = new Map(products.map((p) => [p.id, p] as const));

		const items: SaleItemEntity[] = [];
		let computedTotal = 0;
		for (const item of dto.items) {
			const product = idToProduct.get(item.productId);
			if (!product) throw new BadRequestException(`Product ${item.productId} not found`);
			if (product.stock < item.quantity) throw new BadRequestException(`Insufficient stock for ${product.name}`);
			const lineTotal = product.price * item.quantity;
			computedTotal += lineTotal;
			items.push(
				this.saleItemsRepo.create({
					productId: product.id,
					productName: product.name,
					unitPrice: product.price,
					quantity: item.quantity,
					lineTotal,
				}),
			);
		}

		if (Math.abs(computedTotal - dto.totalAmount) > 0.001) {
			throw new BadRequestException('Total mismatch');
		}

		const sale = this.salesRepo.create({ totalAmount: dto.totalAmount, items });
		const saved = await this.salesRepo.save(sale);

		for (const it of dto.items) {
			await this.productsRepo.decrement({ id: it.productId }, 'stock', it.quantity);
		}

		return saved;
	}

	async findAll(query: PaginationQueryDto) {
		const page = query.page ?? 1;
		const limit = query.limit ?? 10;
		const [items, total] = await this.salesRepo.findAndCount({ relations: ['items'], order: { id: 'DESC' }, skip: (page - 1) * limit, take: limit });
		return { items, meta: { page, limit, total, pages: Math.ceil(total / limit) } };
	}

	async exportCsv(): Promise<string> {
		const sales = await this.salesRepo.find({ relations: ['items'], order: { id: 'DESC' } });
		const rows = [
			['sale_id', 'created_at', 'product_name', 'unit_price', 'quantity', 'line_total', 'total_amount'],
		];
		for (const s of sales) {
			for (const i of s.items) {
				rows.push([
					String(s.id),
					s.createdAt.toISOString(),
					i.productName,
					String(i.unitPrice),
					String(i.quantity),
					String(i.lineTotal),
					String(s.totalAmount),
				]);
			}
		}
		return rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
	}
}
