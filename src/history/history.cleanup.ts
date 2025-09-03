// history.cleanup.ts
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { HistoryService } from './history.service';

@Injectable()
export class HistoryCleanupJob {
  constructor(private readonly historyService: HistoryService) {}

  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async handleCron() {
    const result = await this.historyService.deleteOlderThan(30);
    console.log(`🧹 Old history logs deleted: ${result.deletedCount}`);
  }
}
