import { Module } from '@nestjs/common';
import { CheckCountryService } from './check-country.service';
import { CheckCountryController } from './check-country.controller';

@Module({
  controllers: [CheckCountryController],
  providers: [CheckCountryService],
})
export class CheckCountryModule {}
