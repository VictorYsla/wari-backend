import { Controller, Post, Body, Delete, Query, Get } from '@nestjs/common';
import { MonitoringUserItemsService } from './monitoring-user-items.service';
import { MonitoringUserItem } from './entities/monitoring-user-item.entity';

@Controller('monitoring-user-items')
export class MonitoringUserItemsController {
  constructor(
    private readonly monitoringUserItemsService: MonitoringUserItemsService,
  ) {}

  @Post('add-item')
  async addItem(@Body() data: Partial<MonitoringUserItem>) {
    return this.monitoringUserItemsService.addItem(data);
  }

  @Post('add-multiple-items')
  async addItems(@Body() items: Partial<MonitoringUserItem>[]) {
    return this.monitoringUserItemsService.addItems(items);
  }

  @Delete('remove-item')
  async removeItem(@Query('id') id: string) {
    return this.monitoringUserItemsService.removeItem(id);
  }

  @Get()
  async getAllItems() {
    return this.monitoringUserItemsService.getAllItems();
  }

  @Get('find-by-user')
  async findByUserId(@Query('user_id') userId: string) {
    return this.monitoringUserItemsService.findByUserId(userId);
  }
}
