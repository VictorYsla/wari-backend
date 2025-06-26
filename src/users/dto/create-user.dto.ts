import {
  IsString,
  IsBoolean,
  IsDateString,
  MinLength,
  IsInt,
  IsOptional,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  plate: string;

  @IsString()
  driver_phone: string;

  @IsString()
  vehicle_type: string;

  @IsInt()
  @IsOptional()
  completed_trips?: number;

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
