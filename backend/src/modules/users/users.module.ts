import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { UsersSeeder } from './users.seed';

@Module({
	imports: [TypeOrmModule.forFeature([UserEntity])],
	providers: [UsersSeeder],
	exports: [TypeOrmModule],
})
export class UsersModule {}
