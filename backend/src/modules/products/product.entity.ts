import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('products')
export class ProductEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ length: 120 })
	name: string;

	@Column({ type: 'text', nullable: true })
	description?: string;

	@Column({ type: 'integer', default: 0 })
	stock: number;

	@Column({ type: 'real' })
	price: number;
}
