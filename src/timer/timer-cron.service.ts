import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Timer, TimerDocument } from './timer.model';
import { Model } from 'mongoose';

@Injectable()
export class TimerCronService {
  private readonly logger = new Logger(TimerCronService.name);

  constructor(
    @InjectModel(Timer.name)
    private readonly timerModel: Model<TimerDocument>,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE) // Har 1 soatda ishga tushadi
  async handleDeleteExpiredTimers() {
    try {
      const now = new Date();
      const result = await this.timerModel.deleteMany({ time: { $lt: now } });

      if (result.deletedCount > 0) {
        this.logger.log(`Deleted ${result.deletedCount} expired timers.`);
      }
    } catch (error) {
      this.logger.error('Failed to delete expired timers', error);
    }
  }
}
