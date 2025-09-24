import { Repository } from 'typeorm';
import { AuthService } from './auth.service';
import { UserEntity } from '../../domain/entities/user.entity';
import { JwtService } from '@nestjs/jwt';

jest.mock('bcrypt', () => ({ compare: jest.fn() }));
import * as bcrypt from 'bcrypt';

function createRepoMock<T>() {
	const qb = {
		addSelect: jest.fn().mockReturnThis(),
		where: jest.fn().mockReturnThis(),
		andWhere: jest.fn().mockReturnThis(),
		getOne: jest.fn(),
	};
	const repo = {
		createQueryBuilder: jest.fn(() => qb),
	} as unknown as jest.Mocked<Repository<T>>;
	// expose qb for assertions/mocking in tests
	(repo as any).__qb = qb;
	return repo;
}

describe('AuthService', () => {
	let service: AuthService;
	let usersRepo: jest.Mocked<Repository<UserEntity>>;
	let jwt: jest.Mocked<JwtService>;

	beforeEach(() => {
		usersRepo = createRepoMock<UserEntity>();
		jwt = { signAsync: jest.fn() } as any;
		service = new AuthService(usersRepo as any, jwt as any);
	});

	it('validateUser should return user info on correct password', async () => {
		((usersRepo as any).__qb.getOne as jest.Mock).mockResolvedValue({ id: 'u1', username: 'admin', role: 'admin', passwordHash: 'hash', isActive: true });
		(bcrypt.compare as jest.Mock).mockResolvedValue(true);
		const user = await service.validateUser('admin', 'admin123');
		expect(user).toEqual({ id: 'u1', username: 'admin', role: 'admin' });
	});

	it('validateUser should throw on wrong password', async () => {
		((usersRepo as any).__qb.getOne as jest.Mock).mockResolvedValue({ id: 'u1', username: 'admin', role: 'admin', passwordHash: 'hash', isActive: true });
		(bcrypt.compare as jest.Mock).mockResolvedValue(false);
		await expect(service.validateUser('admin', 'wrong')).rejects.toThrow('Invalid credentials');
	});

	it('login should return accessToken and user', async () => {
		((usersRepo as any).__qb.getOne as jest.Mock).mockResolvedValue({ id: 'u1', username: 'admin', role: 'admin', passwordHash: 'hash', isActive: true });
		(bcrypt.compare as jest.Mock).mockResolvedValue(true);
		jwt.signAsync.mockResolvedValue('token123');
		const res = await service.login('admin', 'admin123');
		expect(res.accessToken).toBe('token123');
		expect(res.user).toEqual({ id: 'u1', username: 'admin', role: 'admin' });
	});
});
