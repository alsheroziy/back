import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { History, HistorySchema } from './history.model';
import { HistoryService } from './history.service';
import { HistoryController } from './history.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: History.name, schema: HistorySchema }]),
  ],
  providers: [HistoryService],
  controllers: [HistoryController],
  exports: [MongooseModule], // 👈 kerak: modelni tashqariga export qilish!
})
export class HistoryModule {}
