import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { SlidersService } from './sliders.service';
import { CreateSliderDto } from './dto/create-slider.dto';
import { UpdateSliderDto } from './dto/update-slider.dto';
import { Auth } from 'src/auth/decarators/auth.decarator';

@Controller('sliders')
export class SlidersController {
  constructor(private readonly slidersService: SlidersService) {}

  @Post()
  @Auth('ADMIN')
  async create(@Body() createSliderDto: CreateSliderDto) {
    return await this.slidersService.create(createSliderDto);
  }

  @Get()
  async findAll() {
    return await this.slidersService.findAll();
  }

  @Patch(':id')
  @Auth('ADMIN')
  async update(
    @Param('id') id: string,
    @Body() updateSliderDto: UpdateSliderDto,
  ) {
    return await this.slidersService.update(id, updateSliderDto);
  }

  @Delete(':id')
  @Auth('ADMIN')
  async remove(@Param('id') id: string) {
    return await this.slidersService.remove(id);
  }
}
