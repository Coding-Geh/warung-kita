import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsInt, IsNotEmpty, IsNumber, Min, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSaleItemDto {
	@ApiProperty({ description: 'Product ID', example: 1 })
	@IsInt()
	@Min(1)
	productId: number;

	@ApiProperty({ description: 'Quantity to purchase', example: 2, minimum: 1 })
	@IsInt()
	@Min(1)
	quantity: number;
}

export class CreateSaleDto {
	@ApiProperty({ description: 'Sale items', type: [CreateSaleItemDto] })
	@IsArray()
	@ArrayMinSize(1)
	@ValidateNested({ each: true })
	@Type(() => CreateSaleItemDto)
	items: CreateSaleItemDto[];

	@ApiProperty({ description: 'Total amount in IDR', example: 50000, minimum: 0 })
	@IsNumber()
	@Min(0)
	totalAmount: number;
}
