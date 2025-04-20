import { Module } from '@nestjs/common';
import { HawkService } from './hawk.service';
import { HawkController } from './hawk.controller';
import { CommonModule } from 'src/generic/common.module';

@Module({
  imports: [CommonModule],
  controllers: [HawkController],
  providers: [HawkService],
  exports: [HawkService],
})
export class HawkModule {}
