import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { SaleEntity } from './sale.entity';

@Entity('sale_items')
export class SaleItemEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => SaleEntity, (sale) => sale.items, { onDelete: 'CASCADE' })
	sale: SaleEntity;

	@Column('integer')
	productId: number;

	@Column({ type: 'text' })
	productName: string;

	@Column({ type: 'real' })
	unitPrice: number;

	@Column('integer')
	quantity: number;

	@Column({ type: 'real' })
	lineTotal: number;
}
