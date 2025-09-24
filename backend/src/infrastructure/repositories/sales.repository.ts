import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SaleEntity } from '../../domain/entities/sale.entity';
import { SaleItemEntity } from '../../domain/entities/saleItem.entity';

export interface ISalesRepository {
	findAll(page?: number, limit?: number): Promise<{ items: SaleEntity[]; meta: any }>;
	findById(id: string): Promise<SaleEntity | null>;
	create(sale: Partial<SaleEntity>): Promise<SaleEntity>;
	exportCsv(): Promise<string>;
}

@Injectable()
export class SalesRepository implements ISalesRepository {
	constructor(
		@InjectRepository(SaleEntity)
		private readonly salesRepo: Repository<SaleEntity>,
		@InjectRepository(SaleItemEntity)
		private readonly saleItemsRepo: Repository<SaleItemEntity>,
	) {}

	async findAll(page = 1, limit = 10) {
		const skip = (page - 1) * limit;
		const [items, total] = await this.salesRepo.findAndCount({
			relations: ['items'],
			order: { createdAt: 'DESC' },
			skip,
			take: limit,
		});

		return {
			items,
			meta: {
				page,
				limit,
				total,
				pages: Math.ceil(total / limit),
			},
		};
	}

	async findById(id: string): Promise<SaleEntity | null> {
		return this.salesRepo.findOne({ where: { id }, relations: ['items'] });
	}

	async create(sale: Partial<SaleEntity>): Promise<SaleEntity> {
		const entity = this.salesRepo.create(sale);
		return this.salesRepo.save(entity);
	}

	async exportCsv(): Promise<string> {
		const sales = await this.salesRepo.find({ relations: ['items'], order: { createdAt: 'DESC' } });
		
		// CSV Headers
		const headers = [
			'ID Transaksi',
			'Tanggal',
			'Waktu',
			'Metode Pembayaran',
			'Status',
			'Total Harga',
			'Diskon',
			'Total Akhir',
			'Nama Produk',
			'Harga Satuan',
			'Diskon Produk',
			'Jumlah',
			'Subtotal',
			'Catatan'
		];

		// CSV Rows
		const rows = [headers];
		
		for (const sale of sales) {
			const saleDate = new Date(sale.createdAt);
			const dateStr = saleDate.toLocaleDateString('id-ID');
			const timeStr = saleDate.toLocaleTimeString('id-ID');
			
			// Format currency
			const formatCurrency = (amount: number) => {
				return new Intl.NumberFormat('id-ID', {
					style: 'currency',
					currency: 'IDR',
					minimumFractionDigits: 0,
					maximumFractionDigits: 0,
				}).format(amount);
			};

			// Format payment method
			const formatPaymentMethod = (method: string) => {
				const methods: { [key: string]: string } = {
					'cash': 'Tunai',
					'card': 'Kartu',
					'qris': 'QRIS'
				};
				return methods[method] || method;
			};

			// Format status
			const formatStatus = (status: string) => {
				const statuses: { [key: string]: string } = {
					'completed': 'Selesai',
					'pending': 'Menunggu',
					'cancelled': 'Dibatalkan'
				};
				return statuses[status] || status;
			};

			// Add sale items
			for (const item of sale.items) {
				rows.push([
					sale.id,
					dateStr,
					timeStr,
					formatPaymentMethod(sale.paymentMethod),
					formatStatus(sale.status),
					formatCurrency(sale.totalAmount),
					formatCurrency(sale.discountAmount),
					formatCurrency(sale.finalAmount),
					item.productName,
					formatCurrency(item.unitPrice),
					formatCurrency(item.discount),
					item.quantity.toString(),
					formatCurrency(item.lineTotal),
					sale.notes || ''
				]);
			}

			// If no items, add sale summary row
			if (sale.items.length === 0) {
				rows.push([
					sale.id,
					dateStr,
					timeStr,
					formatPaymentMethod(sale.paymentMethod),
					formatStatus(sale.status),
					formatCurrency(sale.totalAmount),
					formatCurrency(sale.discountAmount),
					formatCurrency(sale.finalAmount),
					'',
					'',
					'',
					'',
					sale.notes || ''
				]);
			}
		}
		
		// Convert to CSV with proper escaping
		const csvContent = rows.map(row => 
			row.map(cell => {
				// Escape quotes and wrap in quotes if contains comma, newline, or quote
				const escaped = String(cell).replace(/"/g, '""');
				if (escaped.includes(',') || escaped.includes('\n') || escaped.includes('"')) {
					return `"${escaped}"`;
				}
				return escaped;
			}).join(',')
		).join('\n');

		// Add BOM for proper Excel encoding
		const BOM = '\uFEFF';
		return BOM + csvContent;
	}
}
