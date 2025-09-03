import { PartialType } from '@nestjs/mapped-types';
import { CreatePaymentProviderDto } from './create-payment-provider.dto';

export class UpdatePaymentProviderDto extends PartialType(
  CreatePaymentProviderDto,
) {}
