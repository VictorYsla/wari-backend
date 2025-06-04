import { Controller, Post, Body } from '@nestjs/common';
import { VerifiedVehicleSearchesService } from './verified-vehicle-searches.service';
import { CreateVerifiedVehicleSearchDto } from './dto/create-verified-vehicle-search.dto';
import { VerifiedVehicleSearch } from './entities/verified-vehicle-search.entity';

@Controller('verified-vehicle-searches')
export class VerifiedVehicleSearchesController {
  constructor(
    private readonly verifiedVehicleSearchesService: VerifiedVehicleSearchesService,
  ) {}

  @Post('create-verify-search')
  async create(
    @Body() createDto: CreateVerifiedVehicleSearchDto,
  ): Promise<VerifiedVehicleSearch> {
    const createdSearch =
      await this.verifiedVehicleSearchesService.create(createDto);

    return createdSearch;
  }
}
