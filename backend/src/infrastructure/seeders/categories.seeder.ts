import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoryEntity } from '../../domain/entities/category.entity';

@Injectable()
export class CategoriesSeeder implements OnModuleInit {
	constructor(
		@InjectRepository(CategoryEntity)
		private readonly categoriesRepo: Repository<CategoryEntity>,
	) {}

	async onModuleInit() {
		const count = await this.categoriesRepo.count();
		if (count > 0) return;
		
		await this.categoriesRepo.save([
			{ name: 'Minuman', description: 'Berbagai jenis minuman' },
			{ name: 'Makanan', description: 'Berbagai jenis makanan' },
			{ name: 'Snack', description: 'Cemilan dan snack' },
			{ name: 'Elektronik', description: 'Produk elektronik' },
		]);
		
		console.log('✅ Categories seeded successfully');
	}
}
