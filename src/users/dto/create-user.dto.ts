import { IsString, IsBoolean, IsDateString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  plate: string;

  @IsBoolean()
  is_active: boolean;

  @IsBoolean()
  is_expired: boolean;

  @IsDateString()
  expired_date: Date;

  @IsString()
  time_zone: string;

  @IsString()
  @MinLength(6)
  password: string;
}
