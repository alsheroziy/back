// app-status.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AppStatus } from './app-status.model';
import { Model } from 'mongoose';
import { UpdateAppStatusDto } from './dto/update-app-status-dto';

@Injectable()
export class AppStatusService {
  constructor(
    @InjectModel(AppStatus.name) private appStatusModel: Model<AppStatus>,
  ) {}

  async getStatus(clientVersion: string) {
    const status = await this.appStatusModel.findOne().sort({ updatedAt: -1 });

    const mustUpdate =
      status?.forceUpdate && status?.latestVersion !== clientVersion;

    return {
      maintenance: status?.maintenance,
      latestVersion: status?.latestVersion,
      forceUpdate: status?.forceUpdate,
      mustUpdate,
      message: status?.message,
    };
  }

  async updateAppStatus(dto: UpdateAppStatusDto) {
    let status = await this.appStatusModel.findOne().sort({ updatedAt: -1 });

    if (!status) {
      status = new this.appStatusModel(dto);
      return await status.save();
    }

    Object.assign(status, dto);
    return await status.save();
  }
}
