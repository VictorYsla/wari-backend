import { forwardRef, Module } from '@nestjs/common';
import { TripService } from './trip.service';
import { TripController } from './trip.controller';
import { Trip } from './entities/trip.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TripGateway } from './trip.gateway';
import { CommonModule } from 'src/generic/common.module';
import { HawkModule } from 'src/hawk/hawk.module';
import { MonitoringItemsModule } from 'src/monitoring-items/monitoring-items.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Trip]),
    CommonModule,
    HawkModule,
    MonitoringItemsModule,
    forwardRef(() => UsersModule),
  ],
  controllers: [TripController],
  providers: [TripService, TripGateway],
  exports: [TripService],
})
export class TripModule {}
