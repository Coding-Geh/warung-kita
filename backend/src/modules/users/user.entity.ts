import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export type UserRole = 'admin' | 'cashier';

@Entity('users')
export class UserEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ unique: true, length: 60 })
	username: string;

	@Column({ select: false })
	passwordHash: string;

	@Column({ type: 'text' })
	role: UserRole;

	@Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
	createdAt: Date;
}
