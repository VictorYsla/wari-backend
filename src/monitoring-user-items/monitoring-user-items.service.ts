import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MonitoringUserItem } from './entities/monitoring-user-item.entity';

@Injectable()
export class MonitoringUserItemsService {
  constructor(
    @InjectRepository(MonitoringUserItem)
    private readonly monitoringUserItemsRepository: Repository<MonitoringUserItem>,
  ) {}

  async addItem(data: Partial<MonitoringUserItem>) {
    const newItem = this.monitoringUserItemsRepository.create(data);
    await this.monitoringUserItemsRepository.save(newItem);
    return { success: true, message: 'UserItemAdded-Success', data: {} };
  }

  async addItems(items: Partial<MonitoringUserItem>[]) {
    const newItems = this.monitoringUserItemsRepository.create(items);
    await this.monitoringUserItemsRepository.save(newItems);
    return { success: true, message: 'UserItemsAdded-Success', data: {} };
  }

  async removeItem(id: string) {
    const result = await this.monitoringUserItemsRepository.delete({ id });
    if (result.affected === 0) {
      return { success: false, message: 'UserItemNotFound' };
    }
    return { success: true, message: 'UserItemRemoved-Success', data: {} };
  }

  async getAllItems() {
    const items = await this.monitoringUserItemsRepository.find();
    console.log({ items });
    return { success: true, message: 'UserItemsFetched-Success', data: items };
  }

  async findByUserId(user_id: string): Promise<MonitoringUserItem[] | null> {
    return await this.monitoringUserItemsRepository.find({
      where: { user_id },
    });
  }
}
