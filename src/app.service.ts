import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AppService implements OnModuleInit {
  private readonly logger = new Logger(AppService.name);

  constructor(private readonly httpService: HttpService) {}

  async onModuleInit() {
    this.logger.log('Esperando 5 segundos antes de restaurar crons...');
    setTimeout(() => this.restoreCrons(), 5000);
  }

  async restoreCrons() {
    try {
      const url = `${process.env.API_URL_SERVER}/trip/create-multiple-trip-monitorings`;

      await firstValueFrom(this.httpService.post(url));
      this.logger.log('✅ Crons restaurados correctamente');
    } catch (error) {
      this.logger.error('❌ Error restaurando cron jobs:', error.message);
    }
  }
}
