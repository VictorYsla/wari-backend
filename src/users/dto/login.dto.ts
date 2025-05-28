import { IsString } from 'class-validator';

export class LoginDto {
  @IsString()
  plate: string;

  @IsString()
  password: string;
}
