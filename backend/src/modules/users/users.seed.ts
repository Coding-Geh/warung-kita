import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersSeeder implements OnModuleInit {
	constructor(
		@InjectRepository(UserEntity)
		private readonly usersRepo: Repository<UserEntity>,
	) {}

	async onModuleInit() {
		const count = await this.usersRepo.count();
		if (count > 0) return;
		const adminHash = await bcrypt.hash('admin123', 10);
		const cashierHash = await bcrypt.hash('kasir123', 10);
		await this.usersRepo.save([
			{ username: 'admin', passwordHash: adminHash, role: 'admin' },
			{ username: 'kasir', passwordHash: cashierHash, role: 'cashier' },
		]);
	}
}
