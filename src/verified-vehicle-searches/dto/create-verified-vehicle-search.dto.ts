import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateVerifiedVehicleSearchDto {
  @IsString()
  plate: string;

  @IsOptional()
  @IsString()
  imei?: string;

  @IsOptional()
  @IsUUID()
  user_id?: string;

  @IsOptional()
  @IsBoolean()
  was_verified?: boolean;

  @IsOptional()
  @IsBoolean()
  is_user_expired?: boolean;
}
