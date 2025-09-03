import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { History } from './history.model';
import { Model } from 'mongoose';
import { Parser as Json2csvParser } from 'json2csv';

@Injectable()
export class HistoryService {
  constructor(
    @InjectModel(History.name) private historyModel: Model<History>,
  ) {}

  buildFilter(query: any) {
    const filter: any = {};

    if (query.route) {
      filter.route = { $regex: `^${query.route}`, $options: 'i' };
    }

    if (query.ip) {
      filter.ip = query.ip;
    }

    if (query.platform) {
      filter.platform = query.platform;
    }

    if (query.startDate || query.endDate) {
      filter.createdAt = {};
      if (query.startDate) {
        filter.createdAt.$gte = new Date(query.startDate);
      }
      if (query.endDate) {
        filter.createdAt.$lte = new Date(query.endDate);
      }
    }

    return filter;
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    sortBy?: string;
    order?: 'asc' | 'desc';
    route?: string;
    ip?: string;
    platform?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const {
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      order = 'desc',
    } = query;

    const filter = this.buildFilter(query);

    const total = await this.historyModel.countDocuments(filter);
    const data = await this.historyModel
      .find(filter)
      .sort({ [sortBy]: order === 'asc' ? 1 : -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return {
      total,
      page,
      limit,
      data,
    };
  }

  async exportToCsv(query: any): Promise<string> {
    const filter = this.buildFilter(query);

    const data = await this.historyModel.find(filter).lean();
    const fields = ['ip', 'route', 'platform', 'appVersion', 'createdAt'];
    const json2csv = new Json2csvParser({ fields });

    return json2csv.parse(data);
  }

  async exportToJson(query: any): Promise<any[]> {
    const filter = this.buildFilter(query);
    return await this.historyModel.find(filter).lean();
  }

  // history.service.ts
  async deleteOlderThan(days: number) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const result = await this.historyModel.deleteMany({
      createdAt: { $lt: cutoff },
    });
    return result;
  }
}
