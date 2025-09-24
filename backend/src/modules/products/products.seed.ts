import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductEntity } from './product.entity';

@Injectable()
export class ProductsSeeder implements OnModuleInit {
	constructor(
		@InjectRepository(ProductEntity)
		private readonly productsRepo: Repository<ProductEntity>,
	) {}

	async onModuleInit() {
		const count = await this.productsRepo.count();
		if (count > 0) return;
		await this.productsRepo.save([
			{ name: 'Kopi CodingGeh', description: 'Signature blend', price: 25000, stock: 100 },
			{ name: 'Teh CodingGeh', description: 'Premium tea', price: 15000, stock: 120 },
			{ name: 'Snack CodingGeh', description: 'Crunchy bites', price: 10000, stock: 200 },
		]);
	}
}
