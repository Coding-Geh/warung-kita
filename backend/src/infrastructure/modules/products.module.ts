import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { ProductEntity } from '../../domain/entities/product.entity';
import { CategoryEntity } from '../../domain/entities/category.entity';
import { ProductRepository } from '../repositories/product.repository';
import { ProductService } from '../services/product.service';
import { ProductsController } from '../../presentation/controllers/products.controller';
import { CreateProductHandler } from '../../application/handlers/create-product.handler';
import { GetProductsHandler } from '../../application/handlers/get-products.handler';
import { ProductsSeeder } from '../seeders/products.seeder';

const CommandHandlers = [CreateProductHandler];
const QueryHandlers = [GetProductsHandler];

@Module({
	imports: [TypeOrmModule.forFeature([ProductEntity, CategoryEntity]), CqrsModule],
	providers: [
		ProductRepository,
		ProductService,
		ProductsSeeder,
		...CommandHandlers,
		...QueryHandlers,
	],
	controllers: [ProductsController],
	exports: [ProductService, ProductRepository],
})
export class ProductsModule {}
