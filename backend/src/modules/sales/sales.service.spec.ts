import { Repository } from 'typeorm';
import { SalesService } from './sales.service';
import { SaleEntity } from './sale.entity';
import { SaleItemEntity } from './saleItem.entity';
import { ProductEntity } from '../products/product.entity';

function createRepoMock<T>() {
	return {
		findAndCount: jest.fn(),
		find: jest.fn(),
		create: jest.fn(),
		save: jest.fn(),
		decrement: jest.fn(),
		findBy: jest.fn(),
	} as unknown as jest.Mocked<Repository<T>>;
}

describe('SalesService', () => {
	let service: SalesService;
	let salesRepo: jest.Mocked<Repository<SaleEntity>>;
	let saleItemsRepo: jest.Mocked<Repository<SaleItemEntity>>;
	let productsRepo: jest.Mocked<Repository<ProductEntity>>;

	beforeEach(() => {
		salesRepo = createRepoMock<SaleEntity>();
		saleItemsRepo = createRepoMock<SaleItemEntity>();
		productsRepo = createRepoMock<ProductEntity>();
		service = new SalesService(salesRepo as any, saleItemsRepo as any, productsRepo as any);
	});

	it('findAll returns paginated result', async () => {
		salesRepo.findAndCount.mockResolvedValueOnce([[], 0] as any);
		const res = await service.findAll({ page: 3, limit: 7 } as any);
		expect(res.meta).toEqual({ page: 3, limit: 7, total: 0, pages: 0 });
	});

	it('exportCsv returns valid CSV headers', async () => {
		salesRepo.find.mockResolvedValueOnce([
			{ id: '1', createdAt: new Date(), items: [{ productName: 'A', unitPrice: 10, quantity: 1, lineTotal: 10 }] as any, totalAmount: 10 } as any,
		]);
		const csv = await service.exportCsv();
		expect(csv).toContain('sale_id');
		expect(csv).toContain('product_name');
	});
});
