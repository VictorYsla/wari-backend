import { Module } from '@nestjs/common';
import { MonitoringUserItemsService } from './monitoring-user-items.service';
import { MonitoringUserItemsController } from './monitoring-user-items.controller';
import { MonitoringUserItem } from './entities/monitoring-user-item.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([MonitoringUserItem])],
  controllers: [MonitoringUserItemsController],
  providers: [MonitoringUserItemsService],
  exports: [MonitoringUserItemsService],
})
export class MonitoringUserItemsModule {}
