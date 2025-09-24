import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { SaleEntity } from './sale.entity';
import { ProductEntity } from './product.entity';

@Entity('sale_items')
export class SaleItemEntity extends BaseEntity {
	@ManyToOne(() => SaleEntity, (sale) => sale.items, { onDelete: 'CASCADE' })
	sale: SaleEntity;

	@Column('uuid')
	saleId: string;

	@ManyToOne(() => ProductEntity, (product) => product.saleItems)
	product: ProductEntity;

	@Column('uuid')
	productId: string;

	@Column({ type: 'text' })
	productName: string;

	@Column({ type: 'real' })
	unitPrice: number;

	@Column({ type: 'real', default: 0 })
	discount: number;

	@Column('integer')
	quantity: number;

	@Column({ type: 'real' })
	lineTotal: number;
}
