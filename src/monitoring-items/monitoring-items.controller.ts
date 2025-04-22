import { Controller, Post, Body, Delete, Query } from '@nestjs/common';
import { MonitoringItemsService } from './monitoring-items.service';
import { MonitoringItem } from './entities/monitoring-item.entity';

@Controller('monitoring-items')
export class MonitoringItemsController {
  constructor(
    private readonly monitoringItemsService: MonitoringItemsService,
  ) {}

  @Post('add-item')
  async addItem(@Body() data: Partial<MonitoringItem>) {
    return this.monitoringItemsService.addItem(data);
  }

  @Post('add-multiple-items')
  async addItems(@Body() items: Partial<MonitoringItem>[]) {
    return this.monitoringItemsService.addItems(items);
  }

  @Delete('remove-item')
  async removeItem(@Query('key') key: string) {
    return this.monitoringItemsService.removeItem(key);
  }
}
