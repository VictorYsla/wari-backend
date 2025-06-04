import { Injectable } from '@nestjs/common';
import { CreateVerifiedVehicleSearchDto } from './dto/create-verified-vehicle-search.dto';
import { VerifiedVehicleSearch } from './entities/verified-vehicle-search.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class VerifiedVehicleSearchesService {
  constructor(
    @InjectRepository(VerifiedVehicleSearch)
    private readonly searchRepository: Repository<VerifiedVehicleSearch>,
  ) {}

  async create(
    createDto: CreateVerifiedVehicleSearchDto,
  ): Promise<VerifiedVehicleSearch> {
    const newSearch = this.searchRepository.create(createDto);
    return await this.searchRepository.save(newSearch);
  }
}
