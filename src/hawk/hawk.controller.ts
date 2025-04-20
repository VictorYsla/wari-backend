import { Body, Controller, Get } from '@nestjs/common';
import { HawkService } from './hawk.service';

@Controller('hawk')
export class HawkController {
  constructor(private readonly hawkService: HawkService) {}

  @Get('getVehicleData')
  getVehicleData(@Body('key') key: string) {
    return this.hawkService.getVehicleData(key);
  }
}
