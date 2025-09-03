import { Module } from '@nestjs/common';
import { PaymeController } from './payment.controller';
import { ConfigModule } from '@nestjs/config';
import { PaymeCheckTokenGuard } from './payme.guard';
import { PaymeService } from './payme.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/user/user.model';
import {
  Transaction,
  TransactionSchema,
} from 'src/transactions/transactions.model';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { ClickService } from './click.service';
import { PaynetService } from './paynet.service';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([
      { name: Transaction.name, schema: TransactionSchema },
    ]),
    NotificationsModule,
  ],
  controllers: [PaymeController],
  providers: [PaymeCheckTokenGuard, PaymeService, ClickService, PaynetService],
})
export class PaymentModule {}
