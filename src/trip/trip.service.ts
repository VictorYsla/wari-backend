import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { Trip } from './entities/trip.entity';
import { TripGateway } from './trip.gateway';
import { HawkService } from 'src/hawk/hawk.service';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { haversineDistance } from './helpers';
import { GenericResponse } from 'src/generic/types/generic-response.type';

@Injectable()
export class TripService {
  constructor(
    private readonly tripGateway: TripGateway,
    private readonly hawkService: HawkService,
    private readonly schedulerRegistry: SchedulerRegistry,
    @InjectRepository(Trip)
    private readonly tripRepository: Repository<Trip>,
  ) {}

  async createTrip(createTripDto: CreateTripDto) {
    const newTrip = this.tripRepository.create(createTripDto);
    return await this.tripRepository.save(newTrip);
  }

  async findTripById(id: string): Promise<Trip> {
    const trip = await this.tripRepository.findOne({ where: { id } });
    if (!trip) {
      throw new Error(`Trip with ID ${id} not found`);
    }
    return trip;
  }

  async updateTrip(id: string, updateTripDto: UpdateTripDto) {
    const existingTrip = await this.tripRepository.findOne({ where: { id } });

    await this.tripRepository.update({ id }, updateTripDto);

    const updatedTrip = await this.tripRepository.findOne({ where: { id } });

    // Emitir solo si cambia is_active
    if (existingTrip?.is_active !== updatedTrip?.is_active) {
      this.tripGateway.emitTripStatusChange(updatedTrip);
    }

    return updatedTrip;
  }

  async deactivateTripsByImei(
    imei: string,
  ): Promise<{ message: string; affected: number }> {
    const result = await this.tripRepository.update(
      { imei, is_active: true }, // Solo los que están activos
      { is_active: false },
    );

    if (result.affected > 0) {
      return {
        message: `${result.affected} trips deactivated successfully`,
        affected: result.affected,
      };
    } else {
      return {
        message:
          'No active trips found for the given IMEI or they are already deactivated.',
        affected: 0,
      };
    }
  }

  async createMonitoring(id: string) {
    const trip = await this.findTripById(id);

    const vehicleData = await this.hawkService.getVehicleData(trip.imei);

    if (!vehicleData.name) {
      return {
        message: `Vehicle key is not valid`,
        success: false,
      };
    }

    const existCron = this.schedulerRegistry.doesExist('cron', `${trip.imei}`);

    if (!existCron) {
      const job = new CronJob('*/10 * * * * *', async () => {
        //harvisine for calculate if vehicle is on destination
        const destination = JSON.parse(trip.destination);
        const vehicleLocation = { lat: vehicleData.lat, lng: vehicleData.lng };

        console.log('destination:', destination);

        const distance = haversineDistance(
          +vehicleLocation.lat,
          +vehicleLocation.lng,
          destination.lat,
          destination.lng,
        );

        console.log('distance:', distance);

        if (distance < 9000) {
          console.log(`🚗 Vehículo ${trip.imei} ha llegado al destino.`);

          // Aquí podrías actualizar el estado del viaje, detener el cron, etc.
          this.stopMonitoring(trip.imei);

          // Lógica opcional para actualizar el trip
          const updateTrip = { ...trip, is_active: false, is_completed: true };
          const updatedTrip = await this.updateTrip(trip.id, updateTrip);
          console.log('updatedTrip:', updatedTrip);
        }
      });

      this.schedulerRegistry.addCronJob(trip.imei, job);

      job.start();

      return {
        message: `${trip.imei.slice(0, 5)}: monitoring is running`,
        success: true,
      };
    }
  }

  async stopMonitoring(imei: string): Promise<GenericResponse> {
    const existCron = this.schedulerRegistry.doesExist('cron', imei);
    if (existCron) {
      const job = this.schedulerRegistry.getCronJob(imei);

      job.stop();
      this.schedulerRegistry.deleteCronJob(imei);

      // await this.monitoringItemsService.removeItem(itemKey);

      return {
        message: `${imei.slice(0, 5)}:monitoring has been stopped`,
        success: true,
      };
    }
    return {
      message: `${imei.slice(0, 5)}:monitoring was not active`,
      success: false,
    };
  }

  async getAllCrons() {
    const runningJobs = this.schedulerRegistry.getCronJobs();
    const jobIdsArray = [...runningJobs.keys()];

    const vehicleDataPromises = jobIdsArray.map(async (cronKey) => {
      try {
        await this.hawkService.getVehicleData(cronKey);
      } catch (error) {
        console.log(
          'Error when get vehicle data-getAllCrons-getVehicleData:',
          error,
        );
        throw new InternalServerErrorException('Please check server logs');
      }
    });

    const vehicleDataArray = await Promise.all(vehicleDataPromises);

    return vehicleDataArray;
  }
}
