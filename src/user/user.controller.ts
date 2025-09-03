import {
  Controller,
  Get,
  Patch,
  Param,
  ValidationPipe,
  UsePipes,
  Query,
  Body,
  Req,
  Delete,
  Post,
} from '@nestjs/common';
import { UserService } from './user.service';
import { Auth } from 'src/auth/decarators/auth.decarator';
import { User } from './decarators/user.decarator';
import { UserDocument } from './user.model';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('')
  @Auth('ADMIN')
  async create(@Body() dto: UserDocument) {
    return await this.userService.create(dto);
  }

  @Post('giveway')
  @Auth('ADMIN')
  async givewayCreate(@Body() dto: { comment?: string }) {
    return await this.userService.givewayCreate(dto);
  }

  @Get('giveway')
  @Auth('ADMIN')
  async givewayGetAll(
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return await this.userService.getAllGiveway({
      page: +page || 1,
      limit: +limit || 0,
    });
  }

  @Get('giveway/:id')
  @Auth('ADMIN')
  async givewayGetById(
    @Param('id') id: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return await this.userService.getGivewayByUser({
      user_id: id,
      page: +page || 1,
      limit: +limit || 0,
    });
  }

  @Get('me')
  @Auth()
  async getProfile(@User('_id') _id: string, @Req() req: Request) {
    return this.userService.me(_id, req);
  }

  @Get('')
  @Auth('ADMIN')
  async getAllUsers(
    @Query('search') search: string,
    @Query('limit') limit: string,
    @Query('page') page: string,
    @Query('has_subscription') has_subscription: boolean,
  ) {
    return this.userService.getAll({
      search,
      limit: +limit || 10,
      page: +page || 1,
      has_subscription,
    });
  }

  @Get(':id')
  @Auth('ADMIN')
  async getProfileById(@Param('id') id: string) {
    return this.userService.byId(id);
  }

  @Patch('me')
  @Auth()
  async updateProfile(@User('_id') _id: string, @Body() dto: UserDocument) {
    return await this.userService.update(_id, dto);
  }

  @Patch(':id')
  @Auth('ADMIN')
  async updateProfileAdmin(
    @Param('id') _id: string,
    @Body() dto: UserDocument,
  ) {
    return await this.userService.updateAdmin(_id, dto);
  }

  @Delete('me')
  @Auth()
  async delete(@User('_id') _id: string) {
    return await this.userService.delete(_id);
  }

  @Delete(':id')
  @Auth('ADMIN')
  async deleteAdmin(@Param('id') _id: string) {
    return await this.userService.delete(_id);
  }
}
