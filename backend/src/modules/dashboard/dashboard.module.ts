import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { SaleEntity } from '../sales/sale.entity';
import { ProductEntity } from '../products/product.entity';

@Module({
	imports: [TypeOrmModule.forFeature([SaleEntity, ProductEntity])],
	controllers: [DashboardController],
	providers: [DashboardService],
})
export class DashboardModule {}
