import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateSeriesDto } from './dto/create-series.dto';
import { UpdateSeriesDto } from './dto/update-series.dto';
import mongoose, { isValidObjectId, Model } from 'mongoose';
import { Series, SeriesDocument } from './series.model';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from 'src/user/user.model';
import { isMDH } from 'src/check-country/check-country.service';

@Injectable()
export class SeriesService {
  constructor(
    @InjectModel(Series.name)
    private readonly seriesModel: Model<SeriesDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}
  async create(createSeriesDto: CreateSeriesDto) {
    try {
      const series = await this.seriesModel.create(createSeriesDto);
      if (!series) throw new BadRequestException('an_occured_error');
      return {
        success: true,
        message: 'series_created_successfully',
        data: series,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error,
      };
    }
  }

  async findAll(props: {
    search: string;
    genres: string;
    categories: string;
    studio: string;
    director: string;
    creators: string;
    country: string;
    published_year: string;
    limit: number;
    page: number;
  }) {
    try {
      const skip = (props.page - 1) * props.limit;
      const filter: any[] = [];

      if (props.search) {
        const regex = { $regex: props.search, $options: 'i' };
        filter.push({
          $or: [
            { 'uz.title': regex },
            { 'uz.description': regex },
            { 'ru.title': regex },
            { 'ru.description': regex },
          ],
        });
      }

      const fieldMap = {
        categories: 'categories',
        genres: 'genres',
        creators: 'creators',
        studio: 'studio',
        director: 'director',
        country: 'country',
        published_year: 'published_year',
      };

      for (const [queryKey, modelField] of Object.entries(fieldMap)) {
        const value = props[queryKey];
        if (value) {
          const items = value
            .split(',')
            .map((id: string) =>
              isValidObjectId(id) ? new mongoose.Types.ObjectId(id) : null,
            )
            .filter((id): id is mongoose.Types.ObjectId => id !== null);
          filter.push({ [modelField]: { $in: items } });
        }
      }

      const matchStage = filter.length ? { $and: filter } : {};

      // COUNT (with type-safe ObjectId conversion)
      const countAgg = await this.seriesModel.aggregate([
        {
          $addFields: {
            genres: {
              $map: {
                input: '$genres',
                as: 'g',
                in: {
                  $cond: [
                    { $eq: [{ $type: '$$g' }, 'objectId'] },
                    '$$g',
                    { $toObjectId: '$$g' },
                  ],
                },
              },
            },
            categories: {
              $map: {
                input: '$categories',
                as: 'c',
                in: {
                  $cond: [
                    { $eq: [{ $type: '$$c' }, 'objectId'] },
                    '$$c',
                    { $toObjectId: '$$c' },
                  ],
                },
              },
            },
            creators: {
              $map: {
                input: '$creators',
                as: 'cr',
                in: {
                  $cond: [
                    { $eq: [{ $type: '$$cr' }, 'objectId'] },
                    '$$cr',
                    { $toObjectId: '$$cr' },
                  ],
                },
              },
            },
          },
        },
        { $match: matchStage },
        { $count: 'total' },
      ]);
      const total = countAgg[0]?.total || 0;

      // MAIN QUERY
      const aggregation = await this.seriesModel.aggregate([
        {
          $addFields: {
            genres: {
              $map: {
                input: '$genres',
                as: 'g',
                in: {
                  $cond: [
                    { $eq: [{ $type: '$$g' }, 'objectId'] },
                    '$$g',
                    { $toObjectId: '$$g' },
                  ],
                },
              },
            },
            categories: {
              $map: {
                input: '$categories',
                as: 'c',
                in: {
                  $cond: [
                    { $eq: [{ $type: '$$c' }, 'objectId'] },
                    '$$c',
                    { $toObjectId: '$$c' },
                  ],
                },
              },
            },
            creators: {
              $map: {
                input: '$creators',
                as: 'cr',
                in: {
                  $cond: [
                    { $eq: [{ $type: '$$cr' }, 'objectId'] },
                    '$$cr',
                    { $toObjectId: '$$cr' },
                  ],
                },
              },
            },
          },
        },
        { $match: matchStage },
        {
          $lookup: {
            from: 'episodes',
            localField: '_id',
            foreignField: 'series_id',
            as: 'episodes',
          },
        },
        {
          $addFields: {
            episodes_count: { $size: '$episodes' },
            total_episodes: { $ifNull: ['$total_episodes', 0] },
          },
        },
        {
          $lookup: {
            from: 'countries',
            localField: 'country',
            foreignField: '_id',
            as: 'country',
          },
        },
        { $unwind: { path: '$country', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'casts',
            localField: 'studio',
            foreignField: '_id',
            as: 'studio',
          },
        },
        { $unwind: { path: '$studio', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'casts',
            localField: 'director',
            foreignField: '_id',
            as: 'director',
          },
        },
        { $unwind: { path: '$director', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'casts',
            localField: 'creators',
            foreignField: '_id',
            as: 'creators',
          },
        },
        {
          $lookup: {
            from: 'genres',
            localField: 'genres',
            foreignField: '_id',
            as: 'genres',
          },
        },
        {
          $lookup: {
            from: 'categories',
            localField: 'categories',
            foreignField: '_id',
            as: 'categories',
          },
        },
        { $project: { episodes: 0 } },
        { $skip: skip },
        { $limit: props.limit },
      ]);

      const pagination = {
        total,
        page: props.page,
        limit: props.limit,
        pages: Math.ceil(total / props.limit),
      };

      return {
        success: true,
        message: 'series_fetch_successfully',
        data: aggregation,
        pagination,
      };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: error.message,
        error,
      };
    }
  }

  async findAllMobile(
    props: {
      search: string;
      genres: string;
      categories: string;
      studio: string;
      director: string;
      creators: string;
      country: string;
      published_year: string;
      limit: number;
      page: number;
    },
    req: Request,
  ) {
    try {
      const skip = (props.page - 1) * props.limit;
      const filter: any[] = [];

      // 🔍 Search
      if (props.search) {
        const regex = { $regex: props.search, $options: 'i' };
        filter.push({
          $or: [
            { 'uz.title': regex },
            { 'uz.description': regex },
            { 'ru.title': regex },
            { 'ru.description': regex },
          ],
        });
      }

      // 🔗 Field Mapping
      const fieldMap = {
        categories: 'categories',
        genres: 'genres',
        creators: 'creators',
        studio: 'studio',
        director: 'director',
        country: 'country',
        published_year: 'published_year',
      };

      for (const [queryKey, modelField] of Object.entries(fieldMap)) {
        const value = props[queryKey];
        if (value) {
          const items = value
            .split(',')
            .map((id: string) =>
              isValidObjectId(id) ? new mongoose.Types.ObjectId(id) : null,
            )
            .filter((id): id is mongoose.Types.ObjectId => id !== null);
          filter.push({ [modelField]: { $in: items } });
        }
      }

      if (!isMDH((req as any).country)) {
        filter.push({ for_only_mdh: { $ne: true } });
      }

      const matchStage = filter.length ? { $and: filter } : {};

      // 🔢 Total Count
      const countAgg = await this.seriesModel.aggregate([
        {
          $addFields: {
            genres: {
              $map: {
                input: '$genres',
                as: 'g',
                in: {
                  $cond: [
                    { $eq: [{ $type: '$$g' }, 'objectId'] },
                    '$$g',
                    { $toObjectId: '$$g' },
                  ],
                },
              },
            },
            categories: {
              $map: {
                input: '$categories',
                as: 'c',
                in: {
                  $cond: [
                    { $eq: [{ $type: '$$c' }, 'objectId'] },
                    '$$c',
                    { $toObjectId: '$$c' },
                  ],
                },
              },
            },
            creators: {
              $map: {
                input: '$creators',
                as: 'cr',
                in: {
                  $cond: [
                    { $eq: [{ $type: '$$cr' }, 'objectId'] },
                    '$$cr',
                    { $toObjectId: '$$cr' },
                  ],
                },
              },
            },
          },
        },
        { $match: matchStage },
        { $count: 'total' },
      ]);

      const total = countAgg[0]?.total || 0;

      // 📦 Main Data Fetch
      const aggregation = await this.seriesModel.aggregate([
        {
          $addFields: {
            genres: {
              $map: {
                input: '$genres',
                as: 'g',
                in: {
                  $cond: [
                    { $eq: [{ $type: '$$g' }, 'objectId'] },
                    '$$g',
                    { $toObjectId: '$$g' },
                  ],
                },
              },
            },
            categories: {
              $map: {
                input: '$categories',
                as: 'c',
                in: {
                  $cond: [
                    { $eq: [{ $type: '$$c' }, 'objectId'] },
                    '$$c',
                    { $toObjectId: '$$c' },
                  ],
                },
              },
            },
            creators: {
              $map: {
                input: '$creators',
                as: 'cr',
                in: {
                  $cond: [
                    { $eq: [{ $type: '$$cr' }, 'objectId'] },
                    '$$cr',
                    { $toObjectId: '$$cr' },
                  ],
                },
              },
            },
            // mediaType: "Series",
            mediaType: 'Series',
          },
        },
        { $match: matchStage },
        { $skip: skip },
        { $limit: props.limit },
        {
          $project: {
            _id: 1,
            'uz.title': 1,
            'ru.title': 1,
            thumbnail: 1,
            age: 1,
            slug: 1,
            mediaType: 1,
          },
        },
      ]);

      const pagination = {
        total,
        page: props.page,
        limit: props.limit,
        pages: Math.ceil(total / props.limit),
      };

      return {
        success: true,
        message: 'series_fetch_successfully',
        data: aggregation,
        pagination,
      };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: error.message,
        error,
      };
    }
  }

  async findOne(slug: string, user: UserDocument) {
    try {
      const series = await this.seriesModel
        .findOne({ slug })
        .populate('country')
        .populate('studio')
        .populate('director')
        .populate('creators')
        .populate('genres')
        .populate('categories');
      if (!series) throw new BadRequestException('series_not_found');
      await this.userModel.findOneAndUpdate(
        { _id: user._id },
        // { $addToSet: { movies: movie._id } },
        { last_anime_type: Series.name, last_anime: series._id },
      );
      return {
        success: true,
        message: 'Series fetched successfully',
        data: series,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error,
      };
    }
  }

  async update(slug: string, updateSeriesDto: UpdateSeriesDto) {
    try {
      const series = await this.seriesModel.findOne({ slug });
      if (!series) throw new BadRequestException('series_not_found');
      const updated = await this.seriesModel.findOneAndUpdate(
        { slug },
        updateSeriesDto,
      );
      return {
        success: true,
        message: 'series_updated_successfully',
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

  async remove(slug: string) {
    try {
      const series = await this.seriesModel.findOneAndDelete({ slug });
      if (!series) throw new BadRequestException('series_not_found');
      return {
        success: true,
        message: 'series_deleted_successfully',
        data: series,
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
