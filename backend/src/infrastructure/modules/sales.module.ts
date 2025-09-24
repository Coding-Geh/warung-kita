import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { SaleEntity } from '../../domain/entities/sale.entity';
import { SaleItemEntity } from '../../domain/entities/saleItem.entity';
import { ProductEntity } from '../../domain/entities/product.entity';
import { SalesRepository } from '../repositories/sales.repository';
import { SalesService } from '../services/sales.service';
import { SalesController } from '../../presentation/controllers/sales.controller';
import { CreateSaleHandler } from '../../application/handlers/create-sale.handler';
import { SaleCreatedHandler } from '../../application/handlers/sale-created.handler';
import { ProductStockUpdatedHandler } from '../../application/handlers/product-stock-updated.handler';

const CommandHandlers = [CreateSaleHandler];
const EventHandlers = [SaleCreatedHandler, ProductStockUpdatedHandler];

@Module({
	imports: [TypeOrmModule.forFeature([SaleEntity, SaleItemEntity, ProductEntity]), CqrsModule],
	providers: [
		SalesRepository,
		SalesService,
		...CommandHandlers,
		...EventHandlers,
	],
	controllers: [SalesController],
	exports: [SalesService, SalesRepository],
})
export class SalesModule {}
