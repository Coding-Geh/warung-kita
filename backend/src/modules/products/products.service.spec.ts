import { Repository } from 'typeorm';
import { ProductsService } from './products.service';
import { ProductEntity } from './product.entity';

function createRepoMock<T>() {
	return {
		findAndCount: jest.fn(),
		findOne: jest.fn(),
		create: jest.fn(),
		save: jest.fn(),
		delete: jest.fn(),
	} as unknown as jest.Mocked<Repository<T>>;
}

describe('ProductsService', () => {
	let service: ProductsService;
	let repo: jest.Mocked<Repository<ProductEntity>>;

	beforeEach(() => {
		repo = createRepoMock<ProductEntity>();
		service = new ProductsService(repo as any);
	});

	it('findAll should call repo.findAndCount with pagination only', async () => {
		repo.findAndCount.mockResolvedValueOnce([[], 0] as any);
		const res = await service.findAll({ page: 2, limit: 5 } as any);
		expect(repo.findAndCount).toHaveBeenCalled();
		const arg = (repo.findAndCount as jest.Mock).mock.calls[0][0];
		expect(arg.skip).toBe(5);
		expect(arg.take).toBe(5);
		expect(res.meta).toEqual({ page: 2, limit: 5, total: 0, pages: 0 });
	});

	it('findAll should include where when q provided', async () => {
		repo.findAndCount.mockResolvedValueOnce([[], 0] as any);
		await service.findAll({ q: 'kopi' } as any);
		const arg = (repo.findAndCount as jest.Mock).mock.calls[0][0];
		expect(arg.where).toBeDefined();
	});
});
