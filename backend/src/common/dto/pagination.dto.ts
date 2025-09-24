import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, Max, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationDto {
	@ApiPropertyOptional({ description: 'Page number', example: 1, minimum: 1 })
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	page?: number = 1;

	@ApiPropertyOptional({ description: 'Items per page', example: 10, minimum: 1, maximum: 100 })
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	@Max(100)
	limit?: number = 10;
}

// Backward compatibility alias for legacy modules that still import PaginationQueryDto
export class PaginationQueryDto extends PaginationDto {
	@ApiPropertyOptional({ description: 'Search query (alias q)', example: 'kopi' })
	@IsOptional()
	@IsString()
	q?: string;

	@ApiPropertyOptional({ description: 'Search query (alias search)', example: 'kopi' })
	@IsOptional()
	@IsString()
	search?: string;
}
