import { Column, Entity } from 'typeorm';
import { BaseEntity } from './base.entity';

export type UserRole = 'admin' | 'cashier';

@Entity('users')
export class UserEntity extends BaseEntity {
	@Column({ unique: true, length: 60 })
	username: string;

	@Column({ select: false })
	passwordHash: string;

	@Column({ type: 'text' })
	role: UserRole;

	@Column({ type: 'boolean', default: true })
	isActive: boolean;

	@Column({ type: 'text', nullable: true, select: false })
	refreshToken?: string;
}
