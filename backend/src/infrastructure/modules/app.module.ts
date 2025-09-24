import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { CqrsModule } from '@nestjs/cqrs';
import configuration from '../../config/configuration';
import { envValidationSchema } from '../../config/validation';

// Domain Entities
import { UserEntity } from '../../domain/entities/user.entity';
import { CategoryEntity } from '../../domain/entities/category.entity';
import { ProductEntity } from '../../domain/entities/product.entity';
import { SaleEntity } from '../../domain/entities/sale.entity';
import { SaleItemEntity } from '../../domain/entities/saleItem.entity';

// Infrastructure Modules
import { UsersModule } from './users.module';
import { AuthModule } from './auth.module';
import { CategoriesModule } from './categories.module';
import { ProductsModule } from './products.module';
import { SalesModule } from './sales.module';

// Presentation Controllers
import { AppController } from '../../presentation/controllers/app.controller';

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true, load: [configuration], validationSchema: envValidationSchema }),
		EventEmitterModule.forRoot(),
		CqrsModule,
		TypeOrmModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (config: ConfigService) => {
				const nodeEnv = config.get<string>('NODE_ENV');
				const isTest = nodeEnv === 'test';
				return {
					type: 'sqlite' as const,
					database: isTest ? ':memory:' : (config.get<string>('database.path') as string),
					entities: [UserEntity, CategoryEntity, ProductEntity, SaleEntity, SaleItemEntity],
					synchronize: true,
					// Reset schema for clean test runs
					dropSchema: isTest,
					logging: nodeEnv === 'development',
				};
			},
		}),
		UsersModule,
		AuthModule,
		CategoriesModule,
		ProductsModule,
		SalesModule,
	],
	controllers: [AppController],
})
export class AppModule {}
