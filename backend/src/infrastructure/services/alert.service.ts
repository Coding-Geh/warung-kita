import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { AlertEntity, AlertType, AlertStatus } from '../../domain/entities/alert.entity';
import { ProductEntity } from '../../domain/entities/product.entity';
import { logger } from '../../common/logger/winston';

@Injectable()
export class AlertService {
	constructor(
		@InjectRepository(AlertEntity)
		private readonly alertRepo: Repository<AlertEntity>,
		@InjectRepository(ProductEntity)
		private readonly productRepo: Repository<ProductEntity>,
	) {}

	async checkLowStockProducts(threshold: number = 10): Promise<void> {
		try {
			const lowStockProducts = await this.productRepo.find({
				where: { 
					stock: LessThan(threshold),
					isActive: true 
				},
			});

			for (const product of lowStockProducts) {
				await this.createLowStockAlert(product, threshold);
			}

			logger.info(`Low stock check completed`, {
				threshold,
				productsChecked: lowStockProducts.length,
			});
		} catch (error) {
			logger.error('Failed to check low stock products', error);
		}
	}

	async createLowStockAlert(product: ProductEntity, threshold: number): Promise<AlertEntity> {
		// Check if alert already exists for this product
		const existingAlert = await this.alertRepo.findOne({
			where: {
				productId: product.id,
				type: AlertType.LOW_STOCK,
				status: AlertStatus.ACTIVE,
			},
		});

		if (existingAlert) {
			// Update existing alert
			existingAlert.message = `Product "${product.name}" has low stock: ${product.stock} units (threshold: ${threshold})`;
			existingAlert.metadata = {
				...existingAlert.metadata,
				currentStock: product.stock,
				threshold,
				lastUpdated: new Date(),
			};
			return this.alertRepo.save(existingAlert);
		}

		// Create new alert
		const alert = this.alertRepo.create({
			type: AlertType.LOW_STOCK,
			title: 'Low Stock Alert',
			message: `Product "${product.name}" has low stock: ${product.stock} units (threshold: ${threshold})`,
			action: 'Consider restocking this product',
			productId: product.id,
			metadata: {
				currentStock: product.stock,
				threshold,
				productName: product.name,
				createdAt: new Date(),
			},
		});

		return this.alertRepo.save(alert);
	}

	async createOutOfStockAlert(product: ProductEntity): Promise<AlertEntity> {
		// Check if alert already exists for this product
		const existingAlert = await this.alertRepo.findOne({
			where: {
				productId: product.id,
				type: AlertType.OUT_OF_STOCK,
				status: AlertStatus.ACTIVE,
			},
		});

		if (existingAlert) {
			return existingAlert;
		}

		// Create new alert
		const alert = this.alertRepo.create({
			type: AlertType.OUT_OF_STOCK,
			title: 'Out of Stock Alert',
			message: `Product "${product.name}" is out of stock`,
			action: 'Urgent restocking required',
			productId: product.id,
			metadata: {
				currentStock: product.stock,
				productName: product.name,
				createdAt: new Date(),
			},
		});

		return this.alertRepo.save(alert);
	}

	async getActiveAlerts(): Promise<AlertEntity[]> {
		return this.alertRepo.find({
			where: { status: AlertStatus.ACTIVE },
			relations: ['product'],
			order: { createdAt: 'DESC' },
		});
	}

	async acknowledgeAlert(alertId: string): Promise<AlertEntity> {
		const alert = await this.alertRepo.findOne({ where: { id: alertId } });
		if (!alert) {
			throw new Error('Alert not found');
		}

		alert.status = AlertStatus.ACKNOWLEDGED;
		alert.acknowledgedAt = new Date();
		alert.isRead = true;

		return this.alertRepo.save(alert);
	}

	async resolveAlert(alertId: string): Promise<AlertEntity> {
		const alert = await this.alertRepo.findOne({ where: { id: alertId } });
		if (!alert) {
			throw new Error('Alert not found');
		}

		alert.status = AlertStatus.RESOLVED;
		alert.resolvedAt = new Date();
		alert.isRead = true;

		return this.alertRepo.save(alert);
	}

	async markAsRead(alertId: string): Promise<AlertEntity> {
		const alert = await this.alertRepo.findOne({ where: { id: alertId } });
		if (!alert) {
			throw new Error('Alert not found');
		}

		alert.isRead = true;
		return this.alertRepo.save(alert);
	}

	async getUnreadAlertsCount(): Promise<number> {
		return this.alertRepo.count({
			where: { isRead: false, status: AlertStatus.ACTIVE },
		});
	}

	async cleanupResolvedAlerts(daysOld: number = 30): Promise<void> {
		const cutoffDate = new Date();
		cutoffDate.setDate(cutoffDate.getDate() - daysOld);

		await this.alertRepo.delete({
			status: AlertStatus.RESOLVED,
			resolvedAt: LessThan(cutoffDate),
		});

		logger.info(`Cleaned up resolved alerts older than ${daysOld} days`);
	}
}
