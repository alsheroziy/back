import { Controller, Get, Query, Res, Header } from '@nestjs/common';
import { HistoryService } from './history.service';
import { Response } from 'express';
import { Auth } from 'src/auth/decarators/auth.decarator';

@Controller('history')
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Get()
  @Auth('ADMIN')
  async getHistory(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('sortBy') sortBy?: string,
    @Query('order') order?: 'asc' | 'desc',
    @Query('route') route?: string,
    @Query('ip') ip?: string,
    @Query('platform') platform?: 'mobile' | 'web',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.historyService.findAll({
      page: Number(page) || 1,
      limit: Number(limit) || 20,
      sortBy,
      order,
      route,
      ip,
      platform,
      startDate,
      endDate,
    });
  }

  @Get('export')
  @Auth('ADMIN')
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename=history.csv')
  async exportHistory(@Query() query: any, @Res() res: Response) {
    const csv = await this.historyService.exportToCsv(query);
    res.send(csv);
  }

  @Get('export-json')
  @Auth('ADMIN')
  @Header('Content-Type', 'application/json')
  @Header('Content-Disposition', 'attachment; filename=history.json')
  async exportHistoryJson(@Query() query: any, @Res() res: Response) {
    const data = await this.historyService.exportToJson(query);
    res.send(data);
  }
}
