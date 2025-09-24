import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from './products/products.module';
import { SalesModule } from './sales/sales.module';
import { AppController } from './app.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from '../config/configuration';
import { envValidationSchema } from '../config/validation';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true, load: [configuration], validationSchema: envValidationSchema }),
		TypeOrmModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (config: ConfigService) => ({
				type: 'sqlite',
				database: config.get<string>('database.path'),
				autoLoadEntities: true,
				synchronize: true,
			}),
		}),
		UsersModule,
		AuthModule,
		ProductsModule,
		SalesModule,
		DashboardModule,
	],
	controllers: [AppController],
})
export class AppModule {}
