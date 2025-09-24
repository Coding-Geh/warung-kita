import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../users/user.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
	constructor(
		@InjectRepository(UserEntity)
		private readonly usersRepo: Repository<UserEntity>,
		private readonly jwtService: JwtService,
	) {}

	async validateUser(username: string, password: string) {
		const user = await this.usersRepo
			.createQueryBuilder('u')
			.addSelect('u.passwordHash')
			.where('u.username = :username', { username })
			.getOne();
		if (!user) throw new UnauthorizedException('Invalid credentials');
		const ok = await bcrypt.compare(password, user.passwordHash);
		if (!ok) throw new UnauthorizedException('Invalid credentials');
		return { id: user.id, username: user.username, role: user.role } as const;
	}

	async login(username: string, password: string) {
		const user = await this.validateUser(username, password);
		const payload = { sub: user.id, username: user.username, role: user.role };
		const accessToken = await this.jwtService.signAsync(payload);
		return { accessToken, user };
	}
}
