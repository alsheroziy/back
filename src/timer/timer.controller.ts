import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { TimerService } from './timer.service';
import { CreateTimerDto } from './dto/create-timer.dto';
import { UpdateTimerDto } from './dto/update-timer.dto';
import { Auth } from 'src/auth/decarators/auth.decarator';

@Controller('timer')
export class TimerController {
  constructor(private readonly timerService: TimerService) {}

  @Post()
  @Auth('ADMIN')
  async create(@Body() createTimerDto: CreateTimerDto) {
    return await this.timerService.create(createTimerDto);
  }

  @Get('time/:time')
  async findAll(
    @Param('time') time: string,
    @Query('limit') limit: string,
    @Query('page') page: string,
  ) {
    return await this.timerService.findAll(time, +page || 1, +limit || 2);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.timerService.findOne(id);
  }

  @Get(':media/:id')
  async findByMedia(
    @Param('id') id: string,
    @Param('media') mediaType: string,
  ) {
    return await this.timerService.findByMedia(
      id,
      mediaType as 'Movies' | 'Series',
    );
  }

  @Delete(':id')
  @Auth('ADMIN')
  async remove(@Param('id') id: string) {
    return await this.timerService.remove(id);
  }
}
