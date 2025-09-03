import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { Auth } from 'src/auth/decarators/auth.decarator';

@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}


  @Get()
  @Auth("ADMIN")
  async findAll(@Query('date') date: string) {
    return await this.statisticsService.findAll(date);
  }
}
