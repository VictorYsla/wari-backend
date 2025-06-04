import { Module } from '@nestjs/common';
import { VerifiedVehicleSearchesService } from './verified-vehicle-searches.service';
import { VerifiedVehicleSearchesController } from './verified-vehicle-searches.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VerifiedVehicleSearch } from './entities/verified-vehicle-search.entity';

@Module({
  imports: [TypeOrmModule.forFeature([VerifiedVehicleSearch])],
  controllers: [VerifiedVehicleSearchesController],
  providers: [VerifiedVehicleSearchesService],
})
export class VerifiedVehicleSearchesModule {}
