import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Model } from 'mongoose';
import { Movies, MoviesDocument } from './movies.model';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from 'src/user/user.model';
import {
  Subscription,
  SubscriptionDocument,
} from 'src/subscriptions/subscriptions.model';
import { parseObjectIdArray } from 'src/modules/universal-objectid.module';
import { isMDH } from 'src/check-country/check-country.service';

@Injectable()
export class MoviesService {
  constructor(
    @InjectModel(Movies.name)
    private readonly moviesModel: Model<MoviesDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(Subscription.name)
    private readonly subscriptionModel: Model<SubscriptionDocument>,
  ) {}
  async create(createMovieDto: CreateMovieDto) {
    try {
      const movie = await this.moviesModel.create(createMovieDto);
      if (!movie) throw new BadRequestException('an_occured_error');
      return {
        success: true,
        message: 'movie_created_successfully',
        data: movie,
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
    creators: string;
    director: string;
    studio: string;
    countries: string;
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
        countries: 'country',
        published_year: 'published_year',
      };

      for (const [queryKey, modelField] of Object.entries(fieldMap)) {
        const value = props[queryKey];
        if (value) {
          const items = parseObjectIdArray(value);
          if (items.length) {
            filter.push({ [modelField]: { $in: items } });
          }
        }
      }

      const matchStage = filter.length ? { $and: filter } : {};

      // 1. COUNT
      const countAgg = await this.moviesModel.aggregate([
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

      // 2. MAIN QUERY
      const movies = await this.moviesModel.aggregate([
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
        { $project: { video: 0 } },
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
        message: 'movies_fetch_successfully',
        data: movies,
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
      creators: string;
      director: string;
      studio: string;
      countries: string;
      published_year: string;
      limit: number;
      page: number;
    },
    req: Request,
  ) {
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
        countries: 'country',
        published_year: 'published_year',
      };

      for (const [queryKey, modelField] of Object.entries(fieldMap)) {
        const value = props[queryKey];
        if (value) {
          const items = parseObjectIdArray(value);
          if (items.length) {
            filter.push({ [modelField]: { $in: items } });
          }
        }
      }

      if (!isMDH((req as any).country)) {
        filter.push({ for_only_mdh: { $ne: true } });
      }

      const matchStage = filter.length ? { $and: filter } : {};

      // 1. COUNT
      const countAgg = await this.moviesModel.aggregate([
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

      // 2. MAIN QUERY
      const movies = await this.moviesModel.aggregate([
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
            mediaType: 'Movies',
          },
        },
        { $match: matchStage },
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
        message: 'movies_fetch_successfully',
        data: movies,
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
      let subscribed = true;
      const user_subscription = await this.userModel
        .findById(user._id)
        .populate('subscription');

      if (user_subscription?.subscription) {
        const subscription = await this.subscriptionModel
          .findById(user_subscription.subscription)
          .populate('plan_id');
        if (!subscription) subscribed = false;

        const now = new Date().getTime();
        if (Number(subscription?.end_date) < now) subscribed = false;
      } else {
        subscribed = false;
      }
      const movieType = await this.moviesModel.findOne({ slug }).select('type');
      if (!movieType) throw new BadRequestException('movie_not_found');
      const movie = await this.moviesModel
        .findOne({ slug })
        .select(!subscribed && movieType?.type === 'paid' ? '-video' : '')
        .populate('country')
        .populate('studio')
        .populate('director')
        .populate('creators')
        .populate('genres')
        .populate('categories')
        .populate({
          path: 'timer_id',
          select: 'time',
        });

      console.log(subscribed, user_subscription?.subscription);
      if (!movie) throw new BadRequestException('movie_not_found');
      await this.userModel.findOneAndUpdate(
        { _id: user._id },
        // { $addToSet: { movies: movie._id } },
        { last_anime_type: Movies.name, last_anime: movie._id },
      );
      return {
        success: true,
        message: 'Movie fetched successfully',
        data: movie,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error,
      };
    }
  }

  async update(slug: string, updateMovieDto: UpdateMovieDto) {
    try {
      const movie = await this.moviesModel.findOne({ slug });
      if (!movie) throw new BadRequestException('movie_not_found');
      const updated = await this.moviesModel.findOneAndUpdate(
        { slug },
        updateMovieDto,
        { new: true },
      );
      return {
        success: true,
        message: 'movie_updated_successfully',
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
      const movie = await this.moviesModel.findOneAndDelete({ slug });
      if (!movie) throw new BadRequestException('movie_not_found');
      return {
        success: true,
        message: 'movie_deleted_successfully',
        data: movie,
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
