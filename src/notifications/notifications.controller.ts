import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { Auth } from 'src/auth/decarators/auth.decarator';
import { User } from 'src/user/decarators/user.decarator';
import { DeviceTokenService } from './device-token.service';

@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly deviceTokenService: DeviceTokenService,
  ) {}

  @Get()
  @UseGuards(Auth)
  async getUserNotifications(
    @User('_id') userId: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    return this.notificationsService.getUserNotifications(
      userId,
      Number.parseInt(page) || 1,
      Number.parseInt(limit) || 20,
    );
  }

  @Post('register-token')
  @Auth()
  async registerDeviceToken(
    @User('_id') userId: string,
    @Body() body: { token: string; device_info?: string; platform?: string },
  ) {
    return this.deviceTokenService.registerToken(
      userId,
      body.token,
      body.device_info,
      body.platform,
    );
  }

  @Delete('unregister-token/:token')
  @Auth()
  async unregisterDeviceToken(
    @User('_id') userId: string,
    @Param('token') token: string,
  ) {
    return this.deviceTokenService.unregisterToken(userId, token);
  }

  @Post(':id/read')
  @Auth()
  async markAsRead(
    @User('_id') userId: string,
    @Param('id') notificationId: string,
  ) {
    return this.notificationsService.markAsRead(notificationId, userId);
  }

  @Post('read-all')
  @Auth()
  async markAllAsRead(@User('_id') userId: string) {
    return this.notificationsService.markAllAsRead(userId);
  }

  @Delete(':id')
  @Auth()
  async deleteNotification(
    @User('_id') userId: string,
    @Param('id') notificationId: string,
  ) {
    return this.notificationsService.deleteNotification(notificationId, userId);
  }

  @Delete()
  @Auth()
  async deleteAllNotifications(@User('_id') userId: string) {
    return this.notificationsService.deleteAllNotifications(userId);
  }
}
