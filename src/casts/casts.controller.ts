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
import { CastsService } from './casts.service';
import { CreateCastDto } from './dto/create-cast.dto';
import { Auth } from 'src/auth/decarators/auth.decarator';
import { UpdateCastDto } from './dto/update-cast.dto';

@Controller('casts')
export class CastsController {
  constructor(private readonly castsService: CastsService) {}

  @Post()
  @Auth('ADMIN')
  async create(@Body() createCastDto: CreateCastDto) {
    return await this.castsService.create(createCastDto);
  }

  @Get()
  async findAll(
    @Query('search') search: string,
    @Query('limit') limit: string,
    @Query('page') page: string,
    @Query('sortBy') sortBy: string,
    @Query('sortDirection') sortDirection: string,
    @Query('role') role: string,
  ) {
    return await this.castsService.findAll({
      search,
      limit: +limit,
      page: +page,
      sortBy,
      sortDirection: +sortDirection,
      role,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.castsService.findOne(id);
  }

  @Patch(':id')
  @Auth('ADMIN')
  async update(@Param('id') id: string, @Body() updateCastDto: UpdateCastDto) {
    return await this.castsService.update(id, updateCastDto);
  }

  @Delete(':id')
  @Auth('ADMIN')
  async remove(@Param('id') id: string) {
    return await this.castsService.remove(id);
  }
}
