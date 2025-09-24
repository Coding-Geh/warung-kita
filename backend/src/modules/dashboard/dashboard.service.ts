import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { SaleEntity } from '../sales/sale.entity';
import { ProductEntity } from '../products/product.entity';

@Injectable()
export class DashboardService {
	constructor(
		@InjectRepository(SaleEntity)
		private readonly saleRepository: Repository<SaleEntity>,
		@InjectRepository(ProductEntity)
		private readonly productRepository: Repository<ProductEntity>,
	) {}

	async getStats() {
		try {
			// Get total sales count
			const totalSales = await this.saleRepository.count();

			// Get total revenue
			const totalRevenue = await this.saleRepository
				.createQueryBuilder('sale')
				.select('SUM(sale.totalAmount)', 'total')
				.getRawOne();

			// Get total products
			const totalProducts = await this.productRepository.count();

			// Get low stock products (less than 10)
			const lowStockProducts = await this.productRepository.count({
				where: { stock: LessThan(10) },
			});

			// Get daily sales for last 7 days
			const dailySales = await this.saleRepository
				.createQueryBuilder('sale')
				.select('DATE(sale.createdAt)', 'date')
				.addSelect('COUNT(*)', 'count')
				.addSelect('SUM(sale.totalAmount)', 'revenue')
				.where('sale.createdAt >= :startDate', {
					startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
				})
				.groupBy('DATE(sale.createdAt)')
				.orderBy('date', 'ASC')
				.getRawMany();

			// Get top products by sales (simplified)
			const topProducts = await this.saleRepository
				.createQueryBuilder('sale')
				.leftJoinAndSelect('sale.items', 'item')
				.select('item.productName', 'name')
				.addSelect('SUM(item.quantity)', 'totalSold')
				.addSelect('SUM(item.lineTotal)', 'revenue')
				.groupBy('item.productName')
				.orderBy('totalSold', 'DESC')
				.limit(5)
				.getRawMany();

			return {
				stats: {
					totalSales,
					totalRevenue: totalRevenue?.total || 0,
					totalProducts,
					lowStockProducts,
				},
				charts: {
					dailySales: dailySales.map((item) => ({
						date: item.date,
						sales: parseInt(item.count),
						revenue: parseFloat(item.revenue || '0'),
					})),
					topProducts: topProducts.map((item) => ({
						name: item.name,
						sold: parseInt(item.totalSold || '0'),
						revenue: parseFloat(item.revenue || '0'),
					})),
					paymentMethods: [
						{ method: 'cash', count: totalSales, total: totalRevenue?.total || 0 },
					],
				},
			};
		} catch (error) {
			console.error('Dashboard service error:', error);
			throw error;
		}
	}
}
