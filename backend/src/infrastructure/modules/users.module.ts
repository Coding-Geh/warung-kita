import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../../domain/entities/user.entity';
import { UsersSeeder } from '../seeders/users.seeder';

@Module({
	imports: [TypeOrmModule.forFeature([UserEntity])],
	providers: [UsersSeeder],
	exports: [TypeOrmModule],
})
export class UsersModule {}
