// app-status.controller.ts
import {
  Body,
  Controller,
  Get,
  Patch,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AppStatusService } from './app-status.service';
import { UpdateAppStatusDto } from './dto/update-app-status-dto';
import { Auth } from 'src/auth/decarators/auth.decarator';

@Controller('app')
export class AppStatusController {
  constructor(private readonly appStatusService: AppStatusService) {}

  @Get('status')
  async getStatus(@Query('version') version: string) {
    return this.appStatusService.getStatus(version);
  }

  @Patch('status')
  @Auth('ADMIN')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async updateStatus(@Body() dto: UpdateAppStatusDto) {
    return this.appStatusService.updateAppStatus(dto);
  }
}
