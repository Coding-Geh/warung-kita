import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductEntity } from '../../domain/entities/product.entity';
import { CategoryEntity } from '../../domain/entities/category.entity';

@Injectable()
export class ProductsSeeder implements OnModuleInit {
	constructor(
		@InjectRepository(ProductEntity)
		private readonly productsRepo: Repository<ProductEntity>,
		@InjectRepository(CategoryEntity)
		private readonly categoriesRepo: Repository<CategoryEntity>,
	) {}

	async onModuleInit() {
		const count = await this.productsRepo.count();
		if (count > 0) return;

		// Get categories first
		const categories = await this.categoriesRepo.find();
		const categoryMap = new Map(categories.map(c => [c.name.toLowerCase(), c.id]));

		await this.productsRepo.save([
			{
				name: 'Kopi CodingGeh Premium',
				description: 'Signature blend coffee with rich aroma',
				price: 25000,
				stock: 100,
				discount: 0,
				categoryId: categoryMap.get('minuman'),
				isActive: true,
			},
			{
				name: 'Teh CodingGeh Classic',
				description: 'Premium tea blend',
				price: 15000,
				stock: 120,
				discount: 2000,
				categoryId: categoryMap.get('minuman'),
				isActive: true,
			},
			{
				name: 'Snack CodingGeh Crunchy',
				description: 'Crunchy bites with special seasoning',
				price: 10000,
				stock: 200,
				discount: 0,
				categoryId: categoryMap.get('snack'),
				isActive: true,
			},
			{
				name: 'Nasi Goreng CodingGeh',
				description: 'Special fried rice with signature sauce',
				price: 35000,
				stock: 50,
				discount: 5000,
				categoryId: categoryMap.get('makanan'),
				isActive: true,
			},
			{
				name: 'Mouse Gaming CodingGeh',
				description: 'High-performance gaming mouse',
				price: 150000,
				stock: 25,
				discount: 15000,
				categoryId: categoryMap.get('elektronik'),
				isActive: true,
			},
		]);

		console.log('✅ Products seeded successfully');
	}
}
