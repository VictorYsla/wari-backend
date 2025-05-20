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
      const multipliesMonitoringUrl = `${process.env.API_URL_SERVER}/trip/create-multiple-trip-monitorings`;
      const verifyGraceTimeUrl = `${process.env.API_URL_SERVER}/trip/scheduleGracePeriodChecks`;
      const multipliesUserMonitoring = `${process.env.API_URL_SERVER}/users/create-multiple-users-monitorings`;

      await firstValueFrom(this.httpService.post(multipliesMonitoringUrl));
      await firstValueFrom(this.httpService.post(verifyGraceTimeUrl));
      await firstValueFrom(this.httpService.post(multipliesUserMonitoring));

      this.logger.log('✅ Crons restaurados correctamente');
    } catch (error) {
      this.logger.error('❌ Error restaurando cron jobs:', error.message);
    }
  }
}
