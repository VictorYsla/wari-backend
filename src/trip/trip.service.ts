import { forwardRef, Inject, Injectable } from '@nestjs/common';
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
import { MonitoringItemsService } from 'src/monitoring-items/monitoring-items.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class TripService {
  constructor(
    private readonly tripGateway: TripGateway,
    private readonly hawkService: HawkService,
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly monitoringItemsService: MonitoringItemsService,

    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    @InjectRepository(Trip)
    private readonly tripRepository: Repository<Trip>,
  ) {}

  async createTrip(createTripDto: CreateTripDto) {
    const existingActiveTrip = await this.tripRepository.findOne({
      where: {
        is_active: true,
        imei: createTripDto.imei,
      },
    });

    if (existingActiveTrip) {
      return {
        success: false,
        message: 'Ya existe un viaje activo para este vehículo',
        data: existingActiveTrip,
      };
    }

    const newTrip = this.tripRepository.create(createTripDto);
    const savedTrip = await this.tripRepository.save(newTrip);

    return {
      success: true,
      message: 'Trip created',
      data: savedTrip,
    };
  }

  async findTripById(id: string): Promise<Trip> {
    const trip = await this.tripRepository.findOne({ where: { id } });
    if (!trip) {
      console.log(`Trip with ID ${id} not found`);
    }
    return trip;
  }

  async findActiveTripById(imei: string): Promise<Trip> {
    const trip = await this.tripRepository.findOne({
      where: { imei, is_active: true },
    });

    if (!trip) {
      console.log(`Active trip with ID ${imei} not found`);
    }

    return trip;
  }

  async updateTrip(id: string, updateTripDto: UpdateTripDto) {
    const existingTrip = await this.tripRepository.findOne({ where: { id } });

    await this.tripRepository.update({ id }, updateTripDto);

    // Lógica para completed_trips del usuario
    if (updateTripDto.is_completed === true) {
      // Busca el usuario por plate o imei (ajusta según tu modelo)
      const user = await this.usersService.getUserByPlate(existingTrip.plate);

      if (user?.data) {
        let completedTrips = user.data.completed_trips ?? 0;

        if (!completedTrips || completedTrips === 0) {
          // Si el usuario tiene 0, cuenta todos los trips completados
          const totalCompleted = await this.tripRepository.count({
            where: { plate: existingTrip.plate, is_completed: true },
          });
          completedTrips = totalCompleted > 0 ? totalCompleted : 1;
        } else {
          completedTrips += 1;
        }

        await this.usersService.updateUser(user.data.id, {
          completed_trips: completedTrips,
        });
      }
    }

    if (updateTripDto.grace_period_active) {
      const timeout = setTimeout(
        async () => {
          await this.tripRepository.update(
            { id },
            { grace_period_active: false },
          );

          const updatedTrip = await this.tripRepository.findOne({
            where: { id },
          });
          this.tripGateway.emitTripStatusChange(updatedTrip);
        },
        10 * 60 * 1000 - 5000,
      ); // 10 minutos en milisegundos

      this.schedulerRegistry.addTimeout(id, timeout);
    }

    const updatedTrip = await this.tripRepository.findOne({ where: { id } });

    this.tripGateway.emitTripStatusChange(updatedTrip);

    // Emitir solo si cambia is_active
    // if (existingTrip?.is_active !== updatedTrip?.is_active) {
    //   this.tripGateway.emitTripStatusChange(updatedTrip);
    // }

    return updatedTrip;
  }

  async deleteTrip(id: string): Promise<GenericResponse> {
    try {
      const trip = await this.tripRepository.findOne({ where: { id } });

      if (!trip) {
        return {
          success: false,
          message: `Trip with ID ${id} not found`,
        };
      }

      // Detener monitoreo si existe
      const cronExists = this.schedulerRegistry.doesExist('cron', trip.imei);
      if (cronExists) {
        const job = this.schedulerRegistry.getCronJob(trip.imei);
        job.stop();
        this.schedulerRegistry.deleteCronJob(trip.imei);
      }

      // Eliminar item de monitoreo si existe
      await this.monitoringItemsService.removeItem(trip.imei);

      // Eliminar viaje
      await this.tripRepository.delete(id);

      // Emitir cambio de estado si es necesario
      this.tripGateway.emitTripStatusChange(null); // o `undefined` si quieres señalar que fue borrado

      return {
        success: true,
        message: `Trip with ID ${id} deleted successfully`,
      };
    } catch (error) {
      console.error('Error deleting trip:', error);
    }
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

    //for deploy

    if (!existCron) {
      const job = new CronJob('*/10 * * * * *', async () => {
        //harvisine for calculate if vehicle is on destination
        const destination = JSON.parse(trip.destination);
        const vehicleLocation = { lat: vehicleData.lat, lng: vehicleData.lng };

        const distance = haversineDistance(
          +vehicleLocation.lat,
          +vehicleLocation.lng,
          destination.lat,
          destination.lng,
        );

        console.log('distance:', distance);

        if (distance < 20) {
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

      const existingItem = await this.monitoringItemsService.findByTripId(
        trip.id,
      );

      if (!existingItem) {
        await this.monitoringItemsService.addItem({
          imei: trip.imei,
          tripId: trip.id,
          plate: trip.plate,
        });
      }

      job.start();

      return {
        message: `${trip.imei.slice(0, 5)}: monitoring is running`,
        success: true,
      };
    }
    return {
      message: `${trip.imei.slice(0, 5)}: is not available for monitoring cron`,
      success: false,
    };
  }

  async stopMonitoring(imei: string): Promise<GenericResponse> {
    const existCron = this.schedulerRegistry.doesExist('cron', imei);
    if (existCron) {
      const job = this.schedulerRegistry.getCronJob(imei);

      job.stop();
      this.schedulerRegistry.deleteCronJob(imei);

      await this.monitoringItemsService.removeItem(imei);

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
      }
    });

    const vehicleDataArray = await Promise.all(vehicleDataPromises);

    return vehicleDataArray;
  }

  async createMultipleTripMonitorings() {
    const results = [];

    const monitoringItems = await this.monitoringItemsService.getAllItems();

    for (const item of monitoringItems.data) {
      const result = await this.createMonitoring(item.tripId);
      results.push({ item, result });
    }

    return results;
  }

  async scheduleGracePeriodChecks() {
    const trips = await this.tripRepository.find({
      where: { grace_period_active: true },
    });

    for (const trip of trips) {
      const timeLeft =
        new Date(trip.grace_period_end_time).getTime() - Date.now();

      if (timeLeft <= 0) {
        // Ya se venció, desactivar inmediatamente
        await this.tripRepository.update(
          { id: trip.id },
          { grace_period_active: false },
        );
        this.tripGateway.emitTripStatusChange(trip);
      } else {
        // Programar la desactivación futura
        const timeout = setTimeout(async () => {
          await this.tripRepository.update(
            { id: trip.id },
            { grace_period_active: false },
          );

          const updatedTrip = await this.tripRepository.findOne({
            where: { id: trip.id },
          });
          this.tripGateway.emitTripStatusChange(updatedTrip);
        }, timeLeft - 5000);

        this.schedulerRegistry.addTimeout(`grace-timeout-${trip.id}`, timeout);
      }
    }
  }
}
