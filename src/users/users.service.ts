import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { MonitoringUserItemsService } from 'src/monitoring-user-items/monitoring-user-items.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly monitoringUserItemsService: MonitoringUserItemsService,

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
      const savedUser = await this.userRepository.save(newUser);
      await this.createMonitoring(savedUser.id);

      return {
        success: true,
        message: 'Usuario creado exitosamente',
        data: savedUser,
      };
    } catch (error) {
      console.log('Error al crear el usuario:', error);
      return {
        success: false,
        message: 'Error al crear el usuario',
      };
    }
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

  async createMonitoring(id: string) {
    const userResponse = await this.getUserById(id);

    const user = userResponse?.data;

    if (!user?.id) {
      return {
        message: `User id is not valid`,
        success: false,
      };
    }

    const existCron = this.schedulerRegistry.doesExist('cron', `${user?.id}`);

    if (!existCron) {
      const job = new CronJob(
        '0 5 0 * * *',
        async () => {
          const now = new Date();
          const expiredDate = new Date(user?.expired_date);

          const isExpired = expiredDate && expiredDate < now;

          const updateUser = {
            ...user,
            is_expired: isExpired,
            expired_date: user.expired_date
              ? new Date(user.expired_date).toISOString()
              : null,
          };

          const updatedUser = await this.updateUser(user?.id, updateUser);

          console.log('updatedUser:', updatedUser);
        },
        null,
        false,
        'America/Lima',
      );

      this.schedulerRegistry.addCronJob(user?.id, job);

      const existingItem = await this.monitoringUserItemsService.findByUserId(
        user.id,
      );

      console.log({ existingItem: existingItem.length });

      if (!existingItem.length) {
        await this.monitoringUserItemsService.addItem({
          plate: user.plate,
          user_id: user.id,
        });
      }

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

    const monitoringItems = await this.monitoringUserItemsService.getAllItems();

    for (const item of monitoringItems.data) {
      const result = await this.createMonitoring(item.id);
      results.push({ item, result });
    }

    console.log('Monitoring user items created successfully');

    return results;
  }
}
