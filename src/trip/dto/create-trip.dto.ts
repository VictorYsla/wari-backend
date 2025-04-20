import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateTripDto {
  @IsString()
  imei: string;

  @IsOptional()
  @IsString()
  destination?: string;

  @IsBoolean()
  is_active: boolean;
}
