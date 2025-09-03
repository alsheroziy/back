import { Module } from '@nestjs/common';
import { CastsService } from './casts.service';
import { CastsController } from './casts.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Casts, CastsSchema } from './casts.model';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Casts.name, schema: CastsSchema }]),
  ],
  controllers: [CastsController],
  providers: [CastsService],
})
export class CastsModule {}
