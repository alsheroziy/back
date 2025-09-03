import { Injectable } from '@nestjs/common';
import { CreateSavedSeryDto } from './dto/create-saved-sery.dto';
import { InjectModel } from '@nestjs/mongoose';
import { SavedSeries, SavedSeriesDocument } from './saved-series.model';
import { Model } from 'mongoose';
import { Series, SeriesDocument } from 'src/series/series.model';

@Injectable()
export class SavedSeriesService {
  constructor(
    @InjectModel(SavedSeries.name)
    private readonly savedSeriesModel: Model<SavedSeriesDocument>,
    @InjectModel(Series.name)
    private readonly seriesModel: Model<SeriesDocument>,
  ) {}
  async create(createSavedSeryDto: CreateSavedSeryDto, userId: string) {
    try {
      const series = await this.seriesModel.findById(createSavedSeryDto.media);
      if (!series) throw new Error('series_not_found');
      const exist = await this.savedSeriesModel.findOne({
        user_id: userId,
        media: createSavedSeryDto.media,
      });
      if (exist) throw new Error('series_already_exist');
      const saved_series = await this.savedSeriesModel.create({
        ...createSavedSeryDto,
        user_id: userId,
      });
      return {
        success: true,
        data: saved_series,
        message: 'saved_series_created_successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error,
      };
    }
  }

  async findAll(_id: string) {
    try {
      const saved_series = await this.savedSeriesModel
        .find({ user_id: _id })
        .populate('media')
        .populate('user_id');
      return {
        success: true,
        data: saved_series,
        message: 'saved_series_fetched_successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error,
      };
    }
  }

  async remove(id: string, _id: string) {
    try {
      const saved_series = await this.savedSeriesModel.findOneAndDelete({
        media: id,
        user_id: _id,
      });
      if (!saved_series) throw new Error('saved_series_not_found');
      return {
        success: true,
        data: saved_series,
        message: 'saved_series_deleted_successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error,
      };
    }
  }
}
