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
import { PlansService } from './plans.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { Auth } from 'src/auth/decarators/auth.decarator';
import { Types } from 'mongoose';

@Controller('plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Post()
  @Auth('ADMIN')
  async create(@Body() createPlanDto: CreatePlanDto) {
    return this.plansService.create(createPlanDto);
  }

  @Get()
  async findAll(
    @Query('limit') limit: number = 50,
    @Query('page') page: number = 1,
  ) {
    return this.plansService.findAll(+limit || 50, +page || 1);
  }

  @Get(':id')
  async findOne(@Param('id') id: Types.ObjectId) {
    return this.plansService.findOne(id);
  }

  @Patch(':id')
  @Auth('ADMIN')
  async update(
    @Param('id') id: Types.ObjectId,
    @Body() updatePlanDto: UpdatePlanDto,
  ) {
    return this.plansService.update(id, updatePlanDto);
  }

  @Delete(':id')
  @Auth('ADMIN')
  async remove(@Param('id') id: Types.ObjectId) {
    return this.plansService.remove(id);
  }
}
