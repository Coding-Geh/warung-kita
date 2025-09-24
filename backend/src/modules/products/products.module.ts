import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { ProductEntity } from './product.entity';
import { ProductsSeeder } from './products.seed';

@Module({
	imports: [TypeOrmModule.forFeature([ProductEntity])],
	providers: [ProductsService, ProductsSeeder],
	controllers: [ProductsController],
	exports: [ProductsService],
})
export class ProductsModule {}
