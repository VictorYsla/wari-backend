import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { MonitoringUserItemsModule } from 'src/monitoring-user-items/monitoring-user-items.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), MonitoringUserItemsModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
