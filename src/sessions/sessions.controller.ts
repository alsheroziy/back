import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { Auth } from 'src/auth/decarators/auth.decarator';
import { User } from 'src/user/decarators/user.decarator';

@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Auth('ADMIN')
  @Get()
  async findAll() {
    return await this.sessionsService.findAll();
  }

  @Get('me')
  @Auth()
  async findOne(@User('id') id: string) {
    return this.sessionsService.findOne(id);
  }

  @Auth()
  @Delete(':tokenId')
  async remove(@User('id') userId: string, @Param('tokenId') tokenId: string) {
    return await this.sessionsService.remove(userId, tokenId);
  }
}
