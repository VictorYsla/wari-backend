import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { TripModule } from './trip/trip.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { CommonModule } from './generic/common.module';
import { HawkModule } from './hawk/hawk.module';
import { ScheduleModule } from '@nestjs/schedule';
import { MonitoringItemsModule } from './monitoring-items/monitoring-items.module';
import { HttpModule } from '@nestjs/axios';
import { UsersModule } from './users/users.module';
import { VerifiedVehicleSearchesModule } from './verified-vehicle-searches/verified-vehicle-searches.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      database: process.env.DB_NAME,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      autoLoadEntities: true,
      synchronize: false, // Si se crea algún cambio en las entendidades esta la sincroniza, precaución con esto
    }),
    ScheduleModule.forRoot(),
    TripModule,
    CommonModule,
    HawkModule,
    HttpModule.register({}),
    MonitoringItemsModule,
    UsersModule,
    VerifiedVehicleSearchesModule,
  ],
  controllers: [],
  providers: [AppService],
})
export class AppModule {}
