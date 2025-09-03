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
import { GenresService } from './genres.service';
import { CreateGenreDto } from './dto/create-genre.dto';
import { Auth } from 'src/auth/decarators/auth.decarator';
import { UpdateGenreDto } from './dto/update-genre.dto';

@Controller('genres')
export class GenresController {
  constructor(private readonly genresService: GenresService) {}

  @Post()
  @Auth('ADMIN')
  async create(@Body() createGenreDto: CreateGenreDto) {
    return await this.genresService.create(createGenreDto);
  }

  @Get()
  async findAll(
    @Query('search') search: string,
    @Query('limit') limit: string,
    @Query('page') page: string,
    @Query('sortBy') sortBy: string,
    @Query('sortDirection') sortDirection: string,
  ) {
    return await this.genresService.findAll({
      search,
      limit: +limit,
      page: +page,
      sortBy,
      sortDirection: +sortDirection,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.genresService.findOne(id);
  }

  @Patch(':id')
  @Auth('ADMIN')
  async update(
    @Param('id') id: string,
    @Body() updateGenreDto: UpdateGenreDto,
  ) {
    return await this.genresService.update(id, updateGenreDto);
  }

  @Delete(':id')
  @Auth('ADMIN')
  async remove(@Param('id') id: string) {
    return await this.genresService.remove(id);
  }
}
