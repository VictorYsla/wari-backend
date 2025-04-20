import { PartialType } from '@nestjs/mapped-types';
import { CreateHawkDto } from './create-hawk.dto';

export class UpdateHawkDto extends PartialType(CreateHawkDto) {}
