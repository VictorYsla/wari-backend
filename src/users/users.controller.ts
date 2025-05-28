import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginDto } from './dto/login.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  async createUser(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.createUser(createUserDto);
  }

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.usersService.login(loginDto);
  }

  @Post('create-user-monitoring')
  createMonitoring(@Query('id') id: string) {
    return this.usersService.createMonitoring(id);
  }

  @Get('get-all-users')
  async getAllUsers() {
    // Puedes implementar findAll si quieres
    return { success: false, message: 'Método no implementado' };
  }

  @Get('get-user-by-id')
  async getUserById(@Query('id') id: string) {
    return await this.usersService.getUserById(id);
  }

  @Patch('update-user')
  async updateUser(
    @Query('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return await this.usersService.updateUser(id, updateUserDto);
  }

  @Delete('remove-user')
  async removeUser(@Query('id') id: string) {
    return { success: false, message: 'Método no implementado' };
  }

  @Get('get-user-by-plate')
  async getUserByPlate(@Query('plate') plate: string) {
    return await this.usersService.getUserByPlate(plate);
  }

  @Post('create-multiple-users-monitorings')
  createMultipleUsersMonitorings() {
    return this.usersService.createMultipleUsersMonitorings();
  }
}
