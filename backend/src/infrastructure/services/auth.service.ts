import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { UserEntity } from '../../domain/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { PasswordValidationDto, ChangePasswordDto } from '../../common/dto/password-validation.dto';

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
			.andWhere('u.isActive = :isActive', { isActive: true })
			.getOne();
			
		if (!user) throw new UnauthorizedException('Invalid credentials');
		
		const ok = await bcrypt.compare(password, user.passwordHash);
		if (!ok) throw new UnauthorizedException('Invalid credentials');
		
		return { id: user.id, username: user.username, role: user.role } as const;
	}

	async login(username: string, password: string) {
		const user = await this.validateUser(username, password);
		const payload = { sub: user.id, username: user.username, role: user.role };
		
		// Generate access token (15 minutes)
		const accessToken = await this.jwtService.signAsync(payload, { expiresIn: '15m' });
		
		// Generate refresh token (7 days)
		const refreshToken = await this.jwtService.signAsync(
			{ sub: user.id, type: 'refresh' },
			{ expiresIn: '7d' }
		);
		
		// Store refresh token in user entity (in production, use Redis)
		await this.usersRepo.update(user.id, { 
			refreshToken: await bcrypt.hash(refreshToken, 10) 
		});
		
		return { 
			accessToken, 
			refreshToken, 
			user: { id: user.id, username: user.username, role: user.role }
		};
	}

	async refreshToken(refreshToken: string) {
		try {
			const payload = await this.jwtService.verifyAsync(refreshToken);
			
			if (payload.type !== 'refresh') {
				throw new UnauthorizedException('Invalid token type');
			}
			
			const user = await this.usersRepo.findOne({ 
				where: { id: payload.sub, isActive: true } 
			});
			
			if (!user || !user.refreshToken) {
				throw new UnauthorizedException('User not found or token invalid');
			}
			
			// Verify refresh token
			const isValid = await bcrypt.compare(refreshToken, user.refreshToken);
			if (!isValid) {
				throw new UnauthorizedException('Invalid refresh token');
			}
			
			// Generate new access token
			const newPayload = { sub: user.id, username: user.username, role: user.role };
			const newAccessToken = await this.jwtService.signAsync(newPayload, { expiresIn: '15m' });
			
			return { accessToken: newAccessToken };
		} catch (error) {
			throw new UnauthorizedException('Invalid refresh token');
		}
	}

	async logout(userId: string) {
		// Invalidate refresh token
		await this.usersRepo.update(userId, { refreshToken: null });
		return { message: 'Logged out successfully' };
	}

	async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
		const user = await this.usersRepo
			.createQueryBuilder('u')
			.addSelect('u.passwordHash')
			.where('u.id = :userId', { userId })
			.andWhere('u.isActive = :isActive', { isActive: true })
			.getOne();

		if (!user) {
			throw new UnauthorizedException('User not found');
		}

		// Verify current password
		const isCurrentPasswordValid = await bcrypt.compare(changePasswordDto.currentPassword, user.passwordHash);
		if (!isCurrentPasswordValid) {
			throw new BadRequestException('Current password is incorrect');
		}

		// Check if new password is different from current
		const isSamePassword = await bcrypt.compare(changePasswordDto.password, user.passwordHash);
		if (isSamePassword) {
			throw new BadRequestException('New password must be different from current password');
		}

		// Hash new password with higher rounds for better security
		const newPasswordHash = await bcrypt.hash(changePasswordDto.password, 12);

		// Update password and invalidate refresh token
		await this.usersRepo.update(userId, { 
			passwordHash: newPasswordHash,
			refreshToken: null // Force re-login
		});

		return { message: 'Password changed successfully' };
	}

	async resetPassword(userId: string, newPassword: string) {
		// Hash password with higher rounds for better security
		const passwordHash = await bcrypt.hash(newPassword, 12);

		// Update password and invalidate refresh token
		await this.usersRepo.update(userId, { 
			passwordHash,
			refreshToken: null // Force re-login
		});

		return { message: 'Password reset successfully' };
	}
}
