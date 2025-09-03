import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { SavedSeriesService } from './saved-series.service';
import { CreateSavedSeryDto } from './dto/create-saved-sery.dto';
import { Auth } from 'src/auth/decarators/auth.decarator';
import { User } from 'src/user/decarators/user.decarator';

@Controller('saved-series')
export class SavedSeriesController {
  constructor(private readonly savedSeriesService: SavedSeriesService) {}

  @Post()
  @Auth()
  async create(
    @Body() createSavedSeryDto: CreateSavedSeryDto,
    @User('_id') _id: string,
  ) {
    return await this.savedSeriesService.create(createSavedSeryDto, _id);
  }

  @Get()
  @Auth()
  async findAll(@User('_id') _id: string) {
    return await this.savedSeriesService.findAll(_id);
  }

  @Delete(':id')
  @Auth()
  async remove(@Param('id') id: string, @User('_id') _id: string) {
    return await this.savedSeriesService.remove(id, _id);
  }
}
