import { IsString, MinLength, Matches, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PasswordValidationDto {
	@ApiProperty({
		description: 'Password must be at least 8 characters long, contain uppercase, lowercase, number, and special character',
		example: 'SecurePass123!',
		minLength: 8,
		pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]'
	})
	@IsString()
	@IsNotEmpty()
	@MinLength(8, { message: 'Password must be at least 8 characters long' })
	@Matches(
		/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
		{
			message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)'
		}
	)
	password: string;
}

export class ChangePasswordDto extends PasswordValidationDto {
	@ApiProperty({
		description: 'Current password for verification',
		example: 'OldPass123!'
	})
	@IsString()
	@IsNotEmpty()
	currentPassword: string;
}
