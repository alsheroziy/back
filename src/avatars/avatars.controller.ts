import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AvatarsService } from './avatars.service';
import { CreateAvatarDto } from './dto/create-avatar.dto';
import { Auth } from 'src/auth/decarators/auth.decarator';
import { User } from 'src/user/decarators/user.decarator';

@Controller('avatars')
export class AvatarsController {
  constructor(private readonly savedAvatarsService: AvatarsService) {}

  @Post()
  @Auth('ADMIN')
  async create(@Body() createSeryDto: CreateAvatarDto) {
    return await this.savedAvatarsService.create(createSeryDto);
  }

  @Get()
  async findAll() {
    return await this.savedAvatarsService.findAll();
  }

  @Delete(':id')
  @Auth('ADMIN')
  async remove(@Param('id') id: string) {
    return await this.savedAvatarsService.remove(id);
  }
}
