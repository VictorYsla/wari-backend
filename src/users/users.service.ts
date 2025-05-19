import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
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
}
