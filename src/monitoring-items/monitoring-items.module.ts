import { Module } from '@nestjs/common';
import { MonitoringItemsService } from './monitoring-items.service';
import { MonitoringItemsController } from './monitoring-items.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MonitoringItem } from './entities/monitoring-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MonitoringItem])],
  controllers: [MonitoringItemsController],
  providers: [MonitoringItemsService],
  exports: [MonitoringItemsService],
})
export class MonitoringItemsModule {}
