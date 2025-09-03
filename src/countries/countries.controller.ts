import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CountriesService } from './countries.service';
import { CreateCountryDto } from './dto/create-country.dto';
import { Auth } from 'src/auth/decarators/auth.decarator';
import { UpdateCountryDto } from './dto/update-country.dto';

@Controller('countries')
export class CountriesController {
  constructor(private readonly categoriesService: CountriesService) {}

  @Post()
  @Auth('ADMIN')
  async create(@Body() createCategoryDto: CreateCountryDto) {
    return await this.categoriesService.create(createCategoryDto);
  }

  @Get()
  async findAll() {
    return await this.categoriesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.categoriesService.findOne(id);
  }

  @Patch(':id')
  @Auth('ADMIN')
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCountryDto,
  ) {
    return await this.categoriesService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @Auth('ADMIN')
  async remove(@Param('id') id: string) {
    return await this.categoriesService.remove(id);
  }
}
