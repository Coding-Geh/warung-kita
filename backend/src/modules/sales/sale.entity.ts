import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { SaleItemEntity } from './saleItem.entity';

@Entity('sales')
export class SaleEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
	createdAt: Date;

	@Column({ type: 'real' })
	totalAmount: number;

	@OneToMany(() => SaleItemEntity, (item) => item.sale, { cascade: true })
	items: SaleItemEntity[];
}
