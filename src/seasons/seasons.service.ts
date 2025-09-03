import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateSeasonDto } from './dto/create-season.dto';
import { UpdateSeasonDto } from './dto/update-season.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Seasons, SeasonsDocument } from './seasons.model';
import { Model } from 'mongoose';
import { Series, SeriesDocument } from 'src/series/series.model';

@Injectable()
export class SeasonsService {
  constructor(
    @InjectModel(Seasons.name)
    private readonly seasonsModel: Model<SeasonsDocument>,
    @InjectModel(Series.name)
    private readonly seriesModel: Model<SeriesDocument>,
  ) {}
  async create(createSeasonsDto: CreateSeasonDto) {
    try {
      const series = await this.seriesModel.findOne({
        _id: createSeasonsDto.series_id,
      });
      if (!series) throw new BadRequestException('series_not_found');
      delete (createSeasonsDto as any)._id;
      delete (createSeasonsDto as any).ru._id;
      delete (createSeasonsDto as any).uz._id;
      const existSeason = await this.seasonsModel.findOne({
        slug: createSeasonsDto.slug,
        series_id: series._id,
      });
      if (existSeason) throw new BadRequestException('season_already_exist');
      const season = await this.seasonsModel.create(createSeasonsDto);
      if (!season) throw new BadRequestException('an_occured_error');
      return {
        success: true,
        message: 'seasons_created_successfully',
        data: season,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error,
      };
    }
  }

  async findAll({ series }: { series: string }) {
    try {
      const existSeries = await this.seriesModel.findOne({ slug: series });
      if (!existSeries) throw new BadRequestException('series_not_found');
      const seasons = await this.seasonsModel
        .find({ series_id: existSeries._id })
        .populate('series_id');
      return {
        success: true,
        message: 'seasons_fetch_successfully',
        data: seasons,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error,
      };
    }
  }

  async findOne(slug: string, series: string) {
    try {
      const existSeries = await this.seriesModel.findOne({ slug: series });
      if (!existSeries) throw new BadRequestException('series_not_found');
      const season = await this.seasonsModel
        .findOne({ slug, series_id: existSeries?._id })
        .populate('series_id');
      console.log(slug, existSeries);
      if (!season) throw new BadRequestException('season_not_found');
      return {
        success: true,
        message: 'Seasons fetched successfully',
        data: season,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error,
      };
    }
  }

  async update(
    seriesSlug: string,
    slug: string,
    updateSeasonsDto: UpdateSeasonDto,
  ) {
    try {
      const series = await this.seriesModel.findOne({ slug: seriesSlug });
      if (!series) throw new BadRequestException('series_not_found');
      const seasons = await this.seasonsModel.findOne({
        slug,
        series_id: series._id,
      });
      if (!seasons) throw new BadRequestException('seasons_not_found');
      const updated = await this.seasonsModel.findByIdAndUpdate(
        seasons._id,
        updateSeasonsDto,
      );
      return {
        success: true,
        message: 'seasons_updated_successfully',
        data: updated,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error,
      };
    }
  }

  async remove(seriesSlug: string, slug: string) {
    try {
      const series = await this.seriesModel.findOne({ slug: seriesSlug });
      if (!series) throw new BadRequestException('series_not_found');
      const seasons = await this.seasonsModel.findOneAndDelete({
        slug,
        series_id: series._id,
      });
      if (!seasons) throw new BadRequestException('seasons_not_found');
      return {
        success: true,
        message: 'seasons_deleted_successfully',
        data: seasons,
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
