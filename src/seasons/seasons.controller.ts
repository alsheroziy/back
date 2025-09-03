import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { SeasonsService } from './seasons.service';
import { CreateSeasonDto } from './dto/create-season.dto';
import { UpdateSeasonDto } from './dto/update-season.dto';
import { Auth } from 'src/auth/decarators/auth.decarator';

@Controller('seasons')
export class SeasonsController {
  constructor(private readonly seriesService: SeasonsService) {}

  @Post()
  @Auth('ADMIN')
  async create(@Body() createSeriesDto: CreateSeasonDto) {
    return await this.seriesService.create(createSeriesDto);
  }

  @Get(":series")
  async findAll(@Param('series') series: string) {
    return await this.seriesService.findAll({series});
  }

  @Get(':series/:slug')
  async findOne(@Param('slug') slug: string, @Param('series') series: string) {
    const seires = await this.seriesService.findOne(slug, series);
    return seires;
  }

  @Patch(':series/:slug')
  @Auth('ADMIN')
  update(
    @Param('series') series: string,
    @Param('slug') slug: string,
    @Body() updateSeriesDto: UpdateSeasonDto,
  ) {
    return this.seriesService.update(series, slug, updateSeriesDto);
  }

  @Delete(':series/:slug')
  @Auth('ADMIN')
  remove(
    @Param('series') series: string,
    @Param('slug') slug: string
  ) {
    return this.seriesService.remove(series, slug);
  }
}
