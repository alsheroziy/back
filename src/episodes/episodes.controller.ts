import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { EpisodesService } from './episodes.service';
import { CreateEpisodeDto } from './dto/create-episode.dto';
import { UpdateEpisodeDto } from './dto/update-episode.dto';
import { Auth } from 'src/auth/decarators/auth.decarator';
import { User } from 'src/user/decarators/user.decarator';
import { UserDocument } from 'src/user/user.model';

@Controller('episodes')
export class EpisodesController {
  constructor(private readonly seriesService: EpisodesService) {}

  @Post()
  @Auth('ADMIN')
  async create(@Body() createSeriesDto: CreateEpisodeDto) {
    return await this.seriesService.create(createSeriesDto);
  }

  @Get(':series/:season')
  async findAll(
    @Param('series') series: string,
    @Param('season') season: string,
  ) {
    return await this.seriesService.findAll({ series, season });
  }

  @Get(':series/:season/:slug')
  @Auth()
  async findOne(
    @Param('slug') slug: string,
    @Param('series') series: string,
    @Param('season') season: string,
    @User() user: UserDocument,
  ) {
    const seires = await this.seriesService.findOne(slug, series, season, user);
    return seires;
  }

  @Patch(':series/:season/:slug')
  @Auth('ADMIN')
  update(
    @Param('slug') slug: string,
    @Param('series') series: string,
    @Param('season') season: string,
    @Body() updateSeriesDto: UpdateEpisodeDto,
  ) {
    return this.seriesService.update(slug, series, season, updateSeriesDto);
  }

  @Delete(':slug')
  @Auth('ADMIN')
  remove(@Param('slug') slug: string) {
    return this.seriesService.remove(slug);
  }
}
