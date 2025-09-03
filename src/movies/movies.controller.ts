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
import { MoviesService } from './movies.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Auth } from 'src/auth/decarators/auth.decarator';
import { User } from 'src/user/decarators/user.decarator';
import { UserDocument } from 'src/user/user.model';

@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Post()
  @Auth('ADMIN')
  async create(@Body() createMovieDto: CreateMovieDto) {
    return await this.moviesService.create(createMovieDto);
  }

  @Get()
  async findAll(
    @Query('search') search: string,
    @Query('genres') genres: string,
    @Query('categories') categories: string,
    @Query('creators') creators: string,
    @Query('director') director: string,
    @Query('studio') studio: string,
    @Query('countries') countries: string,
    @Query('years') published_year: string,
    @Query('limit') limit: string,
    @Query('page') page: string,
  ) {
    return await this.moviesService.findAll({
      search,
      genres,
      categories,
      creators,
      director,
      studio,
      countries,
      published_year,
      limit: +limit || 10,
      page: +page || 1,
    });
  }

  @Get('mobile')
  async findAllMobile(
    @Query('search') search: string,
    @Query('genres') genres: string,
    @Query('categories') categories: string,
    @Query('creators') creators: string,
    @Query('director') director: string,
    @Query('studio') studio: string,
    @Query('countries') countries: string,
    @Query('years') published_year: string,
    @Query('limit') limit: string,
    @Query('page') page: string,
    @Req() req: Request,
  ) {
    return await this.moviesService.findAllMobile(
      {
        search,
        genres,
        categories,
        creators,
        director,
        studio,
        countries,
        published_year,
        limit: +limit || 10,
        page: +page || 1,
      },
      req,
    );
  }

  @Get(':slug')
  @Auth()
  async findOne(@Param('slug') slug: string, @User() user: UserDocument) {
    const movie = await this.moviesService.findOne(slug, user);
    return movie;
  }

  @Patch(':slug')
  @Auth('ADMIN')
  update(@Param('slug') slug: string, @Body() updateMovieDto: UpdateMovieDto) {
    return this.moviesService.update(slug, updateMovieDto);
  }

  @Delete(':slug')
  @Auth('ADMIN')
  remove(@Param('slug') slug: string) {
    return this.moviesService.remove(slug);
  }
}
