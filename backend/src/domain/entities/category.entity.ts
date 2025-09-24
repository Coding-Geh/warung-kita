import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { ProductEntity } from './product.entity';

@Entity('categories')
export class CategoryEntity extends BaseEntity {
	@Column({ length: 60, unique: true })
	name: string;

	@Column({ type: 'text', nullable: true })
	description?: string;

	@Column({ type: 'boolean', default: true })
	isActive: boolean;

	@OneToMany(() => ProductEntity, (product) => product.category)
	products: ProductEntity[];
}
