import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
} from '@nestjs/common';
import { CheckCountryService } from './check-country.service';

@Controller('check-country')
export class CheckCountryController {
  constructor(private readonly checkCountryService: CheckCountryService) {}
  @Get()
  async get(@Req() req: { country: string }) {
    return await this.checkCountryService.get(req);
  }
}
