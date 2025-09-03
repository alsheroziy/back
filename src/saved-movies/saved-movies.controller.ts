import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { SavedMoviesService } from './saved-movies.service';
import { CreateSavedSeryDto } from './dto/create-saved-sery.dto';
import { Auth } from 'src/auth/decarators/auth.decarator';
import { User } from 'src/user/decarators/user.decarator';

@Controller('saved-movies')
export class SavedMoviesController {
  constructor(private readonly savedMoviesService: SavedMoviesService) {}

  @Post()
  @Auth()
  async create(
    @Body() createSavedSeryDto: CreateSavedSeryDto,
    @User('_id') _id: string,
  ) {
    return await this.savedMoviesService.create(createSavedSeryDto, _id);
  }

  @Get()
  @Auth()
  async findAll(@User('_id') _id: string) {
    return await this.savedMoviesService.findAll(_id);
  }

  @Delete(':id')
  @Auth()
  async remove(@Param('id') id: string, @User('_id') _id: string) {
    return await this.savedMoviesService.remove(id, _id);
  }
}
