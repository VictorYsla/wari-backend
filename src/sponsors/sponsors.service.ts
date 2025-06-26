// sponsor.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sponsor } from './entities/sponsor.entity';
import { CreateSponsorDto } from './dto/create-sponsor.dto';
import { UpdateSponsorDto } from './dto/update-sponsor.dto';

@Injectable()
export class SponsorsService {
  constructor(
    @InjectRepository(Sponsor)
    private sponsorRepository: Repository<Sponsor>,
  ) {}

  async create(dto: CreateSponsorDto): Promise<Sponsor> {
    const sponsor = this.sponsorRepository.create(dto);
    return await this.sponsorRepository.save(sponsor);
  }

  async findAll(): Promise<Sponsor[]> {
    return await this.sponsorRepository.find({
      where: { is_active: true },
    });
  }

  async findOne(id: string): Promise<Sponsor> {
    const sponsor = await this.sponsorRepository.findOneBy({ id });
    if (!sponsor) throw new NotFoundException('Sponsor not found');
    return sponsor;
  }

  async update(id: string, dto: UpdateSponsorDto): Promise<Sponsor> {
    await this.findOne(id); // asegura existencia
    await this.sponsorRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const sponsor = await this.findOne(id);
    await this.sponsorRepository.remove(sponsor);
  }
}
