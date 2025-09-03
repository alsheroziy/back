import { Module } from '@nestjs/common';
import { PaymentProvidersService } from './payment-providers.service';
import { PaymentProvidersController } from './payment-providers.controller';

@Module({
  controllers: [PaymentProvidersController],
  providers: [PaymentProvidersService],
})
export class PaymentProvidersModule {}
