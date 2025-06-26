// create-sponsor.dto.ts
import { IsNotEmpty, IsOptional, IsUrl } from 'class-validator';

export class CreateSponsorDto {
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @IsOptional()
  @IsUrl()
  website?: string;
}
