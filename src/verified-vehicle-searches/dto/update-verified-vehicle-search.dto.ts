import { PartialType } from '@nestjs/mapped-types';
import { CreateVerifiedVehicleSearchDto } from './create-verified-vehicle-search.dto';

export class UpdateVerifiedVehicleSearchDto extends PartialType(CreateVerifiedVehicleSearchDto) {}
