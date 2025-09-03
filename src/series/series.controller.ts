import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
} from '@nestjs/common';
import { SeriesService } from './series.service';
import { CreateSeriesDto } from './dto/create-series.dto';
import { UpdateSeriesDto } from './dto/update-series.dto';
import { Auth } from 'src/auth/decarators/auth.decarator';
import { User } from 'src/user/decarators/user.decarator';
import { UserDocument } from 'src/user/user.model';

@Controller('series')
export class SeriesController {
  constructor(private readonly seriesService: SeriesService) {}

  @Post()
  @Auth('ADMIN')
  async create(@Body() createSeriesDto: CreateSeriesDto) {
    return await this.seriesService.create(createSeriesDto);
  }

  @Get()
  async findAll(
    @Query('search') search: string,
    @Query('genres') genres: string,
    @Query('categories') categories: string,
    @Query('creators') creators: string,
    @Query('studio') studio: string,
    @Query('director') director: string,
    @Query('countries') countries: string,
    @Query('years') published_year: string,
    @Query('limit') limit: string,
    @Query('page') page: string,
  ) {
    return await this.seriesService.findAll({
      search,
      genres,
      categories,
      creators,
      country: countries,
      published_year,
      limit: +limit || 10,
      page: +page || 1,
      studio,
      director,
    });
  }

  @Get('mobile')
  async findAllMobile(
    @Query('search') search: string,
    @Query('genres') genres: string,
    @Query('categories') categories: string,
    @Query('creators') creators: string,
    @Query('studio') studio: string,
    @Query('director') director: string,
    @Query('countries') countries: string,
    @Query('years') published_year: string,
    @Query('limit') limit: string,
    @Query('page') page: string,
    @Req() req: Request,
  ) {
    return await this.seriesService.findAllMobile(
      {
        search,
        genres,
        categories,
        creators,
        country: countries,
        published_year,
        limit: +limit || 10,
        page: +page || 1,
        studio,
        director,
      },
      req,
    );
  }

  @Get(':slug')
  @Auth()
  async findOne(@Param('slug') slug: string, @User() user: UserDocument) {
    const seires = await this.seriesService.findOne(slug, user);
    return seires;
  }

  @Patch(':slug')
  @Auth('ADMIN')
  update(
    @Param('slug') slug: string,
    @Body() updateSeriesDto: UpdateSeriesDto,
  ) {
    return this.seriesService.update(slug, updateSeriesDto);
  }

  @Delete(':slug')
  @Auth('ADMIN')
  remove(@Param('slug') slug: string) {
    return this.seriesService.remove(slug);
  }
}
