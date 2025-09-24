import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { SaleItemEntity } from './saleItem.entity';

export enum PaymentMethod {
	CASH = 'cash',
	CARD = 'card',
	QRIS = 'qris',
}

export enum SaleStatus {
	PENDING = 'pending',
	COMPLETED = 'completed',
	CANCELLED = 'cancelled',
}

@Entity('sales')
export class SaleEntity extends BaseEntity {
	@Column({ type: 'real' })
	totalAmount: number;

	@Column({ type: 'real', default: 0 })
	discountAmount: number;

	@Column({ type: 'real' })
	finalAmount: number;

	@Column({ type: 'text', enum: PaymentMethod, default: PaymentMethod.CASH })
	paymentMethod: PaymentMethod;

	@Column({ type: 'text', enum: SaleStatus, default: SaleStatus.COMPLETED })
	status: SaleStatus;

	@Column({ type: 'text', nullable: true })
	notes?: string;

	@OneToMany(() => SaleItemEntity, (item) => item.sale, { cascade: true })
	items: SaleItemEntity[];
}
