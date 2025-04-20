import { Injectable } from '@nestjs/common';
import { AxiosAdapter } from 'src/generic/adapters/axios.adapter';
import { GPS, GPSID } from './types';

@Injectable()
export class HawkService {
  constructor(private readonly http: AxiosAdapter) {}

  async getVehicleData(imei: string) {
    const vehicleData = await this.http.get<GPSID>(
      `${process.env.HAWK_URL}?api=${process.env.HAWK_USER_API}&cmd=${process.env.HAWK_CMD}${imei}&key=${process.env.HAWK_MASTER_KEY}`,
    );

    const uniqueItem = Object.keys(vehicleData)[0];
    const item = vehicleData[uniqueItem] as GPS;

    return item;
  }
}
