import { Controller, Post, Body, Patch, Query, Get } from '@nestjs/common';
import { TripService } from './trip.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { Trip } from './entities/trip.entity';

@Controller('trip')
export class TripController {
  constructor(private readonly tripService: TripService) {}

  @Get('get-trip-by-id')
  async getTripById(@Query('id') id: string): Promise<Trip> {
    return this.tripService.findTripById(id);
  }

  @Post('create-trip')
  createTrip(@Body() createTripDto: CreateTripDto) {
    return this.tripService.createTrip(createTripDto);
  }

  @Post('create-trip-monitoring')
  createMonitoring(@Query('id') id: string) {
    return this.tripService.createMonitoring(id);
  }

  @Post('stop-trip-monitoring')
  stopMonitoring(@Query('imei') imei: string) {
    return this.tripService.stopMonitoring(imei);
  }

  @Get('get-all-crons')
  getAllCrons() {
    return this.tripService.getAllCrons();
  }

  @Post('create-multiple-trip-monitorings')
  createMultipleTripMonitorings() {
    return this.tripService.createMultipleTripMonitorings();
  }

  @Post('scheduleGracePeriodChecks')
  scheduleGracePeriodChecks() {
    return this.tripService.scheduleGracePeriodChecks();
  }

  @Patch('update-trip')
  updateTrip(@Query('id') id: string, @Body() updateTripDto: UpdateTripDto) {
    return this.tripService.updateTrip(id, updateTripDto);
  }

  @Patch('deactivate-all-trips-by-imei')
  deactivateByImei(@Query('imei') imei: string) {
    return this.tripService.deactivateTripsByImei(imei);
  }
}
