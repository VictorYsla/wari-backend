import { PartialType } from '@nestjs/mapped-types';
import { CreateMonitoringUserItemDto } from './create-monitoring-user-item.dto';

export class UpdateMonitoringUserItemDto extends PartialType(CreateMonitoringUserItemDto) {}
