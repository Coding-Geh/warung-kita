import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { ProductEntity } from './product.entity';

export enum AlertType {
	LOW_STOCK = 'low_stock',
	OUT_OF_STOCK = 'out_of_stock',
	REORDER_REQUIRED = 'reorder_required',
}

export enum AlertStatus {
	ACTIVE = 'active',
	ACKNOWLEDGED = 'acknowledged',
	RESOLVED = 'resolved',
}

@Entity('alerts')
export class AlertEntity extends BaseEntity {
	@Column({ type: 'text', enum: AlertType })
	type: AlertType;

	@Column({ type: 'text', enum: AlertStatus, default: AlertStatus.ACTIVE })
	status: AlertStatus;

	@Column({ type: 'text' })
	title: string;

	@Column({ type: 'text' })
	message: string;

	@Column({ type: 'text', nullable: true })
	action?: string;

	@Column({ type: 'boolean', default: false })
	isRead: boolean;

	@Column({ type: 'timestamp', nullable: true })
	acknowledgedAt?: Date;

	@Column({ type: 'timestamp', nullable: true })
	resolvedAt?: Date;

	@ManyToOne(() => ProductEntity, { nullable: true })
	product?: ProductEntity;

	@Column({ type: 'uuid', nullable: true })
	productId?: string;

	@Column({ type: 'json', nullable: true })
	metadata?: Record<string, any>;
}
