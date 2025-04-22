import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MonitoringItem } from './entities/monitoring-item.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MonitoringItemsService {
  constructor(
    @InjectRepository(MonitoringItem)
    private readonly monitoringItemsRepository: Repository<MonitoringItem>,
  ) {}

  async addItem(data: Partial<MonitoringItem>) {
    const newItem = this.monitoringItemsRepository.create(data);
    await this.monitoringItemsRepository.save(newItem);
    return { success: true, message: 'HistoryItemAdded-Success', data: {} };
  }

  async addItems(items: Partial<MonitoringItem>[]) {
    const newItems = this.monitoringItemsRepository.create(items);
    await this.monitoringItemsRepository.save(newItems);
    return { success: true, message: 'HistoryItemsAdded-Success', data: {} };
  }

  async removeItem(imei: string) {
    const result = await this.monitoringItemsRepository.delete({ imei });
    if (result.affected === 0) {
      return { success: false, message: 'ItemNotFound' };
    }
    return { success: true, message: 'ItemRemoved-Success', data: {} };
  }

  async getAllItems() {
    const items = await this.monitoringItemsRepository.find();
    console.log({ items });
    return { success: true, message: 'ItemsFetched-Success', data: items };
  }

  async findByTripId(tripId: string): Promise<MonitoringItem | null> {
    return await this.monitoringItemsRepository.findOne({
      where: {
        tripId,
      },
    });
  }
}
