import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { Notification, NotificationSchema } from './notifications.model';
import { DeviceToken, DeviceTokenSchema } from './device-token.model';
import { DeviceTokenService } from './device-token.service';
import { FirebaseModule } from 'src/firebase/firebase.module';
import { User, UserSchema } from 'src/user/user.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
      { name: DeviceToken.name, schema: DeviceTokenSchema },
      { name: User.name, schema: UserSchema },
    ]),
    FirebaseModule,
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, DeviceTokenService],
  exports: [NotificationsService, DeviceTokenService],
})
export class NotificationsModule {}
