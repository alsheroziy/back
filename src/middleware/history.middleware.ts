import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { History } from '../history/history.model';

@Injectable()
export class HistoryMiddleware implements NestMiddleware {
  constructor(
    @InjectModel(History.name) private historyModel: Model<History>,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const ip =
      req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';

    const xPlatform = req.headers['x-platform'] || '';
    const route = req.originalUrl;
    const platform = xPlatform.includes('mobile') ? 'mobile' : 'web';
    const appVersion = (req.headers['x-app-version'] as string) || 'unknown';

    // Fayllarni olib tashlash (agar bor bo‘lsa)
    const body = { ...req.body };
    for (const key in body) {
      if (
        body[key] instanceof Buffer ||
        (typeof body[key] === 'object' &&
          body[key] !== null &&
          body[key]._writeStream)
      ) {
        delete body[key]; // buffer / stream
      }
    }

    await this.historyModel.create({
      ip: Array.isArray(ip) ? ip[0] : ip,
      route,
      platform,
      appVersion,
      method: req.method,
      query: req.query,
      body,
      headers: req.headers,
    });

    next();
  }
}
