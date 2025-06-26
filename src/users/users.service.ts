import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { GenericResponse } from 'src/generic/types/generic-response.type';
import { TripService } from 'src/trip/trip.service';
import { HawkService } from 'src/hawk/hawk.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly jwtService: JwtService,
    private readonly hawkService: HawkService,

    @Inject(forwardRef(() => TripService))
    private readonly tripService: TripService,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createUser(createUserDto: CreateUserDto) {
    try {
      const existingUser = await this.userRepository.findOne({
        where: { plate: createUserDto.plate },
      });

      if (existingUser) {
        return {
          success: false,
          message: `Ya existe un usuario con la placa "${createUserDto.plate}"`,
        };
      }

      const newUser = this.userRepository.create(createUserDto);
      newUser.password = bcrypt.hashSync(createUserDto.password, 10);

      const savedUser = await this.userRepository.save(newUser);

      await this.createMonitoring(savedUser.id);

      const session = this.getJwtToken(newUser);

      return {
        success: true,
        message: 'Usuario creado exitosamente',
        data: { ...session },
      };
    } catch (error) {
      console.log('Error al crear el usuario:', error);
      return {
        success: false,
        message: 'Error al crear el usuario',
      };
    }
  }

  async login(loginDto: LoginDto) {
    const { plate, password } = loginDto;
    const user = await this.userRepository.findOneBy({ plate });

    console.log({ user });

    if (!user) {
      return {
        success: false,
        message: 'Usuario no encontrado',
        data: null,
      };
    }

    const isPasswordValid = bcrypt.compareSync(password, user.password);
    console.log({ isPasswordValid });

    if (!isPasswordValid) {
      return {
        success: false,
        message: 'Contraseña incorrecta',
        data: null,
      };
    }
    const session = this.getJwtToken(user);

    console.log({ session });

    return {
      success: true,
      message: 'Inicio de sesión exitoso',
      data: {
        ...session,
      },
    };
  }

  async validateUser(plate: string, password: string) {
    const user = await this.userRepository.findOneBy({ plate });
    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!user || !isPasswordValid) return null;
    return user;
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto) {
    const existing = await this.userRepository.findOne({ where: { id } });

    if (!existing) {
      return {
        success: false,
        message: `No se encontró un usuario con ID "${id}"`,
      };
    }

    try {
      // Si faltan driver_phone o vehicle_type, intenta obtenerlos desde Hawk
      if ((!existing.driver_phone || !existing.vehicle_type) && existing.imei) {
        const hawkObjects = await this.hawkService.getUserObjects();
        const hawkUser = hawkObjects.find((obj) => obj.imei === existing.imei);

        if (hawkUser) {
          if (!existing.driver_phone && hawkUser.device) {
            updateUserDto.driver_phone = hawkUser.device;
          }
          if (!existing.vehicle_type && hawkUser.model) {
            updateUserDto.vehicle_type = hawkUser.model;
          }
        }
      }

      if (updateUserDto.plate && updateUserDto.plate !== existing.plate) {
        const duplicatePlate = await this.userRepository.findOne({
          where: { plate: updateUserDto.plate },
        });

        if (duplicatePlate) {
          return {
            success: false,
            message: `Ya existe un usuario con la placa "${updateUserDto.plate}"`,
          };
        }
      }

      const updated = this.userRepository.merge(existing, updateUserDto);
      const saved = await this.userRepository.save(updated);

      return {
        success: true,
        message: 'Usuario actualizado correctamente',
        data: saved,
      };
    } catch (error) {
      console.log('Error al actualizar el usuario:', error);
      return {
        success: false,
        message: 'Error al actualizar el usuario',
      };
    }
  }

  async getUserById(id: string) {
    try {
      const user = await this.userRepository.findOne({ where: { id } });

      if (!user) {
        return {
          success: false,
          message: `No se encontró un usuario con ID "${id}"`,
        };
      }

      return {
        success: true,
        message: 'Usuario encontrado',
        data: user,
      };
    } catch (error) {
      console.log('Error al buscar el usuario por ID:', error);
      return {
        success: false,
        message: 'Error al buscar el usuario por ID',
      };
    }
  }

  async getUserByPlate(plate: string) {
    try {
      const user = await this.userRepository.findOne({ where: { plate } });

      if (!user) {
        return {
          success: false,
          message: `No se encontró un usuario con placa "${plate}"`,
        };
      }

      return {
        success: true,
        message: 'Usuario encontrado',
        data: user,
      };
    } catch (error) {
      console.log('Error al buscar el usuario por placa:', error);
      return {
        success: false,
        message: 'Error al buscar el usuario por placa',
      };
    }
  }

  async getAllUsersOrdered() {
    try {
      const users = await this.userRepository.find({
        where: { is_active: true }, // Solo usuarios activos
      });
      const hawkObjects = await this.hawkService.getUserObjects();

      function getStatusPriority(user) {
        if (user.is_active) return 1;
        if (user.is_expired) return 2;
        return 3;
      }

      users.sort((a, b) => {
        const statusA = getStatusPriority(a);
        const statusB = getStatusPriority(b);

        if (statusA !== statusB) return statusA - statusB;
        return (b.completed_trips ?? 0) - (a.completed_trips ?? 0);
      });

      // Filtra solo los usuarios que tienen match en Hawk
      const filteredUsers = users.filter((user) =>
        hawkObjects.some(
          (obj) => String(obj.imei).trim() === String(user.imei).trim(),
        ),
      );

      return filteredUsers.map((user) => {
        const hawk = hawkObjects.find(
          (obj) => String(obj.imei).trim() === String(user.imei).trim(),
        );

        // Log para debuggear el match de IMEI
        if (!hawk) {
          console.log(`[Hawk Match] No se encontró hawk para user`, {
            user_imei: user.imei,
            hawk_imeis: hawkObjects.map((obj) => obj.imei),
            user_id: user.id,
            user_plate: user.plate,
          });
        } else {
          console.log(`[Hawk Match] Match encontrado`, {
            user_imei: user.imei,
            hawk_imei: hawk.imei,
            user_id: user.id,
            user_plate: user.plate,
          });
        }

        return {
          id: user.id,
          driverNumber: user.driver_phone || hawk?.sim_number || '',
          plate: user.plate,
          vehicleType: user.vehicle_type || 'Desconocido',
          completedTrips: user.completed_trips ?? 0,
          lastUpdate:
            user.updated_at?.toISOString() ?? new Date().toISOString(),
          is_active: user.is_active,
          is_expired: user.is_expired ?? false,
          imei: user.imei,
          hawkData: hawk || null,
        };
      });
    } catch (error) {
      console.log('Error al obtener la lista de conductores ordenados:', error);
      return {
        success: false,
        message: 'Error al obtener la lista de conductores',
        data: [],
      };
    }
  }

  async createMonitoring(id: string) {
    const userResponse = await this.getUserById(id);

    const user = userResponse?.data;

    const timeZone = user?.time_zone ?? 'UTC';

    if (!user?.id) {
      return {
        message: `User id is not valid`,
        success: false,
      };
    }

    const existCron = this.schedulerRegistry.doesExist(
      'cron',
      `user-${user?.id}`,
    );
    if (!existCron) {
      const job = new CronJob(
        '0 5 0 * * *',
        async () => {
          const hawkObjects = await this.hawkService.getUserObjects();
          const hawkUser = hawkObjects.find(
            (obj) => String(obj.imei).trim() === String(user.imei).trim(),
          );

          if (!hawkUser) {
            await this.updateUser(user.id, { is_active: false });
            this.schedulerRegistry.deleteCronJob(`user-${user.id}`);
            console.log(
              `Usuario ${user.plate} no existe en Hawk. Marcado como inactivo y cron detenido.`,
            );
            return;
          }

          const now = new Date();
          const expiredDate = new Date(user?.expired_date);

          const isValidDate = !isNaN(expiredDate.getTime()); // asegura que sea una fecha válida
          const isExpired = isValidDate && expiredDate < now;

          const updateUser = {
            ...user,
            is_expired: isExpired,
            expired_date: new Date(user.expired_date),
          };
          const updatedUser = await this.updateUser(user?.id, updateUser);
          const activeTrip = await this.tripService.findActiveTripById(
            user?.imei,
          );

          if (
            activeTrip &&
            activeTrip.is_active &&
            !activeTrip.destination &&
            isExpired
          ) {
            const deletedTrip = await this.tripService.deleteTrip(
              activeTrip.id,
            );
            console.log('deletedTrip:', deletedTrip);
          }

          console.log('updatedUser:', updatedUser);
        },
        null,
        false,
        timeZone,
      );

      this.schedulerRegistry.addCronJob(`user-${user?.id}`, job);

      job.start();

      return {
        message: `${user.id.slice(0, 5)}: monitoring is running`,
        success: true,
      };
    }
    return {
      message: `${user.id.slice(0, 5)}: is not available for monitoring cron`,
      success: false,
    };
  }

  async createMultipleUsersMonitorings() {
    const results = [];

    const users = await this.userRepository.find({
      where: {
        is_active: true,
      },
    });

    for (const item of users) {
      const result = await this.createMonitoring(item.id);
      results.push({ item, result });
    }

    console.log('Monitoring user items created successfully:', results);

    return results;
  }

  async stopUserMonitoring(id: string): Promise<GenericResponse> {
    const existCron = this.schedulerRegistry.doesExist('cron', `user-${id}`);
    if (existCron) {
      const job = this.schedulerRegistry.getCronJob(`user-${id}`);

      job.stop();
      this.schedulerRegistry.deleteCronJob(`user-${id}`);

      return {
        message: `${`user-${id}`.slice(0, 5)}:monitoring has been stopped`,
        success: true,
      };
    }
    return {
      message: `${`user-${id}`.slice(0, 5)}:monitoring was not active`,
      success: false,
    };
  }

  async getAllCrons() {
    const runningJobs = this.schedulerRegistry.getCronJobs();
    const jobIdsArray = [...runningJobs.keys()];

    const userCrons = jobIdsArray.filter((cronKey) =>
      cronKey.startsWith('user-'),
    );

    return userCrons; // devuelves directamente los IDs de los crons de usuario
  }

  private getJwtToken(user: User) {
    const payload = { id: user.id, plate: user.plate };
    return {
      token: this.jwtService.sign(payload),
      user,
    };
  }
}
