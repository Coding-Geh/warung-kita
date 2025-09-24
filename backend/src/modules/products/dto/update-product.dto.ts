import { IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProductDto {
	@ApiProperty({ description: 'Product name', example: 'Kopi CodingGeh', required: false })
	@IsString()
	@IsOptional()
	name?: string;

	@ApiProperty({ description: 'Product description', example: 'Signature blend coffee', required: false })
	@IsString()
	@IsOptional()
	description?: string;

	@ApiProperty({ description: 'Available stock quantity', example: 100, minimum: 0, required: false })
	@IsInt()
	@Min(0)
	@IsOptional()
	stock?: number;

	@ApiProperty({ description: 'Product price in IDR', example: 25000, minimum: 0, required: false })
	@IsNumber()
	@Min(0)
	@IsOptional()
	price?: number;
}
