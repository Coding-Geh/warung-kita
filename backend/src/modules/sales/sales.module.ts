import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalesService } from './sales.service';
import { SalesController } from './sales.controller';
import { SaleEntity } from './sale.entity';
import { SaleItemEntity } from './saleItem.entity';
import { ProductEntity } from '../products/product.entity';

@Module({
	imports: [TypeOrmModule.forFeature([SaleEntity, SaleItemEntity, ProductEntity])],
	providers: [SalesService],
	controllers: [SalesController],
})
export class SalesModule {}
