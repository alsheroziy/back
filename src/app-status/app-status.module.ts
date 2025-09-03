import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppStatus, AppStatusSchema } from './app-status.model';
import { AppStatusService } from './app-status.service';
import { AppStatusController } from './app-status.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AppStatus.name, schema: AppStatusSchema },
    ]),
  ],
  controllers: [AppStatusController],
  providers: [AppStatusService],
  exports: [AppStatusService], // kerak bo‘lsa boshqa modullar foydalana oladi
})
export class AppStatusModule {}
