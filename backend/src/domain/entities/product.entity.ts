import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { CategoryEntity } from './category.entity';
import { SaleItemEntity } from './saleItem.entity';

@Entity('products')
export class ProductEntity extends BaseEntity {
	@Column({ length: 120 })
	name: string;

	@Column({ type: 'text', nullable: true })
	description?: string;

	@Column({ type: 'integer', default: 0 })
	stock: number;

	@Column({ type: 'real' })
	price: number;

	@Column({ type: 'real', default: 0 })
	discount: number;

	@Column({ type: 'boolean', default: true })
	isActive: boolean;

	@ManyToOne(() => CategoryEntity, (category) => category.products)
	category: CategoryEntity;

	@Column({ type: 'uuid', nullable: true })
	categoryId?: string;

	@OneToMany(() => SaleItemEntity, (item) => item.product)
	saleItems: SaleItemEntity[];
}
