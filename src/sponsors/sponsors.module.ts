import { Module } from '@nestjs/common';
import { SponsorsController } from './sponsors.controller';
import { SponsorsService } from './sponsors.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sponsor } from './entities/sponsor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Sponsor])],
  controllers: [SponsorsController],
  providers: [SponsorsService],
})
export class SponsorsModule {}
