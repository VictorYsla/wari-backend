// sponsor.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Patch,
  Delete,
} from '@nestjs/common';
import { SponsorsService } from './sponsors.service';
import { CreateSponsorDto } from './dto/create-sponsor.dto';
import { UpdateSponsorDto } from './dto/update-sponsor.dto';

@Controller('sponsors')
export class SponsorsController {
  constructor(private readonly sponsorService: SponsorsService) {}

  @Post('create-sponsor')
  create(@Body() dto: CreateSponsorDto) {
    return this.sponsorService.create(dto);
  }

  @Get('get-all-sponsors')
  findAll() {
    return this.sponsorService.findAll();
  }

  @Get('get-sponsor')
  findOne(@Query('id') id: string) {
    return this.sponsorService.findOne(id);
  }

  @Patch('update-sponsor')
  update(@Query('id') id: string, @Body() dto: UpdateSponsorDto) {
    return this.sponsorService.update(id, dto);
  }

  @Delete('delete-sponsor')
  remove(@Query('id') id: string) {
    return this.sponsorService.remove(id);
  }
}
