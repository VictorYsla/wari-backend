import { Module } from '@nestjs/common';
import { AxiosAdapter } from './adapters/axios.adapter';
import { TelegramModule } from 'src/telegram/telegram.module';

@Module({
  imports: [TelegramModule],
  providers: [AxiosAdapter],
  exports: [AxiosAdapter],
})
export class CommonModule {}
