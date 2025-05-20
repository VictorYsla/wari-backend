import { IsString, IsBoolean, IsDateString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  plate: string;

  @IsBoolean()
  is_active: boolean;

  @IsBoolean()
  is_expired: boolean;

  @IsDateString()
  expired_date: string;

  @IsString()
  clerk_id: string;

  @IsString()
  clerk_created_user_id: string;
}
