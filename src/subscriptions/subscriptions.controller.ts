import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { Auth } from 'src/auth/decarators/auth.decarator';
import { User } from 'src/user/decarators/user.decarator';
import { SubscriptionsService } from './subscriptions.service';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}
  @Auth()
  @Post('/:id')
  async create(@User('_id') _id: string, @Param('id') id: string) {
    return await this.subscriptionsService.create(_id, id);
  }

  @Auth()
  @Get('/')
  async findAll(@User('_id') _id: string) {
    return await this.subscriptionsService.findByUserId(_id);
  }

  @Auth('ADMIN')
  @Get('/all')
  async findAllSubscriptions(
    @Query('limit') limit: number = 50,
    @Query('page') page: number = 1,
  ) {
    return await this.subscriptionsService.findAll(+limit || 50, +page || 1);
  }
}
