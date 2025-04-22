import { PartialType } from '@nestjs/mapped-types';
import { CreateMonitoringItemDto } from './create-monitoring-item.dto';

export class UpdateMonitoringItemDto extends PartialType(
  CreateMonitoringItemDto,
) {}
