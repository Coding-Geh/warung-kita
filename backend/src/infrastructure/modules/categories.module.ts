import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryEntity } from '../../domain/entities/category.entity';
import { CategoryRepository } from '../repositories/category.repository';
import { CategoryService } from '../services/category.service';
import { CategoryController } from '../../presentation/controllers/category.controller';
import { CategoriesSeeder } from '../seeders/categories.seeder';

@Module({
	imports: [TypeOrmModule.forFeature([CategoryEntity])],
	providers: [CategoryRepository, CategoryService, CategoriesSeeder],
	controllers: [CategoryController],
	exports: [CategoryService, CategoryRepository],
})
export class CategoriesModule {}
