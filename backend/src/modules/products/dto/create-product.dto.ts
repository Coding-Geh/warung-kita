import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
	@ApiProperty({ description: 'Product name', example: 'Kopi CodingGeh' })
	@IsString()
	@IsNotEmpty()
	name: string;

	@ApiProperty({ description: 'Product description', example: 'Signature blend coffee', required: false })
	@IsString()
	@IsOptional()
	description?: string;

	@ApiProperty({ description: 'Available stock quantity', example: 100, minimum: 0 })
	@IsInt()
	@Min(0)
	stock: number;

	@ApiProperty({ description: 'Product price in IDR', example: 25000, minimum: 0 })
	@IsNumber()
	@Min(0)
	price: number;
}
