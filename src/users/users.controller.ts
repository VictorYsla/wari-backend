import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Query,
  Res,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginDto } from './dto/login.dto';
import { Response } from 'express';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  async createUser(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.createUser(createUserDto);
  }

  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const response = await this.usersService.login(loginDto);
    if (response.success) {
      res.cookie('token', response.data.token, {
        httpOnly: true,
        secure: process.env.ENVIROMENT === 'production',
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 12, // 12h
        path: '/',
      });
    }
    return response;
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Req() req) {
    const userResponse = this.getUserByPlate(req?.user?.plate);
    return userResponse;
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.ENVIROMENT === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    return { message: 'Logged out' };
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

  @Post('stop-user-monitoring')
  stopUserMonitoring(@Query('id') id: string) {
    return this.usersService.stopUserMonitoring(id);
  }

  @Get('get-all-crons')
  getAllCrons() {
    return this.usersService.getAllCrons();
  }
}
