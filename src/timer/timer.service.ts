import { Injectable } from '@nestjs/common';
import { CreateTimerDto } from './dto/create-timer.dto';
import { UpdateTimerDto } from './dto/update-timer.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Timer, TimerDocument } from './timer.model';
import { Model, Types } from 'mongoose';
import { Series, SeriesDocument } from 'src/series/series.model';
import { Movies, MoviesDocument } from 'src/movies/movies.model';
import { Episodes, EpisodesDocument } from 'src/episodes/episodes.model';

@Injectable()
export class TimerService {
  constructor(
    @InjectModel(Timer.name)
    private readonly timerModel: Model<TimerDocument>,
    @InjectModel(Series.name)
    private readonly seriesModel: Model<SeriesDocument>,
    @InjectModel(Episodes.name)
    private readonly episodesModel: Model<EpisodesDocument>,
    @InjectModel(Movies.name)
    private readonly moviesModel: Model<MoviesDocument>,
  ) {}
  async create(createTimerDto: CreateTimerDto) {
    try {
      const media = await this?.[`${createTimerDto.mediaType}Model`].findById(
        createTimerDto.media,
      );
      if (!media) {
        throw new Error('media_not_found');
      }
      if (!new Date(createTimerDto.time)) throw new Error('invalid_time');

      await this.timerModel.deleteOne({
        media: createTimerDto.media,
        mediaType: createTimerDto.mediaType,
      });
      if (createTimerDto.season_id) {
        await this.timerModel.deleteOne({
          season_id: createTimerDto.season_id,
        });
        // const season = await this.seriesModel.findById(
        //   createTimerDto.season_id,
        // );
        // console.log(season, createTimerDto.season_id);
        // if (!season) {
        //   throw new Error('season_not_found');
        // }
      }
      if (createTimerDto.episode_id) {
        await this.timerModel.deleteOne({
          episode_id: createTimerDto.episode_id,
        });
        // const episode = await this.seriesModel.findById(
        //   createTimerDto.episode_id,
        // );
        // if (!episode) {
        //   throw new Error('episode_not_found');
        // }
      }
      const obj = {
        uz: {
          message: createTimerDto.uz.message,
        },
        ru: {
          message: createTimerDto.ru.message,
        },
        media: createTimerDto.media,
        mediaType:
          createTimerDto.mediaType.charAt(0).toUpperCase() +
          createTimerDto.mediaType.slice(1),
        time: new Date(createTimerDto.time).toISOString(),
      };
      if (createTimerDto.season_id) {
        obj['season_id'] = createTimerDto.season_id;
      }
      if (createTimerDto.episode_id) {
        obj['episode_id'] = createTimerDto.episode_id;
      }
      if (createTimerDto.total_episodes) {
        obj['total_episodes'] = createTimerDto.total_episodes;
      }
      const timer = await this.timerModel.create(obj);

      if (createTimerDto.episode_id) {
        await this.episodesModel.updateOne(
          {
            _id: createTimerDto.episode_id,
          },
          {
            $set: {
              timer_id: timer._id,
            },
          },
        );
      }
      if (createTimerDto.mediaType.toLocaleLowerCase() === 'movies') {
        await this.moviesModel.updateOne(
          {
            _id: createTimerDto.media,
          },
          {
            $set: {
              timer_id: timer._id,
            },
          },
        );
      }
      return {
        success: true,
        data: timer,
        message: 'timer_created_successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error,
      };
    }
  }

  async findAll(time: string, page = 1, limit = 2) {
    try {
      // Format: 'dd-mm-yyyy'
      const [day, month, year] = time.split('-');

      // UTC vaqtlar
      const startOfDay = new Date(
        Date.UTC(+year, +month - 1, +day, 0, 0, 0, 0),
      );
      const endOfDay = new Date(
        Date.UTC(+year, +month - 1, +day, 23, 59, 59, 999),
      );

      const filter = {
        time: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      };
      // console.log(filter)

      const timers = await this.timerModel
        .find(filter)
        .populate({
          path: 'media',
          // mediaType ga qarab Movies yoki Series modelga ulanadi
          select: 'uz ru thumbnail _id',
          populate: [
            { path: 'genres', select: 'uz ru name' },
            { path: 'categories', select: 'uz ru name' },
          ],
        })
        .populate({
          path: 'season_id',
          select: 'uz ru thumbnail _id series_id',
          populate: {
            path: 'series_id',
            select: 'uz ru thumbnail _id',
            populate: [
              { path: 'genres', select: 'uz ru name' },
              { path: 'categories', select: 'uz ru name' },
            ],
          },
        })

        .populate({
          path: 'episode_id',
          select: 'uz ru thumbnail _id series_id episode_number',
          populate: {
            path: 'series_id',
            select: 'uz ru thumbnail _id',
            populate: [
              { path: 'genres', select: 'uz ru name' },
              { path: 'categories', select: 'uz ru name' },
            ],
          },
        })

        .limit(limit)
        .skip((page - 1) * limit);

      const total = await this.timerModel.countDocuments(filter);

      const pagination = {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      };

      return {
        success: true,
        data: { timers, pagination },
        message: 'timers_fetched_successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error,
      };
    }
  }

  async findOne(id: string) {
    try {
      const timer = await this.timerModel
        .findById(id)
        .populate({
          path: 'media',
          // mediaType ga qarab Movies yoki Series modelga ulanadi
          select: 'uz ru thumbnail _id',
          populate: [
            { path: 'genres', select: 'uz ru name' },
            { path: 'categories', select: 'uz ru name' },
          ],
        })
        .populate({
          path: 'season_id',
          select: 'uz ru thumbnail _id series_id',
          populate: {
            path: 'series_id',
            select: 'uz ru thumbnail _id',
            populate: [
              { path: 'genres', select: 'uz ru name' },
              { path: 'categories', select: 'uz ru name' },
            ],
          },
        })

        .populate({
          path: 'episode_id',
          select: 'uz ru thumbnail _id series_id episode_number',
          populate: {
            path: 'series_id',
            select: 'uz ru thumbnail _id',
            populate: [
              { path: 'genres', select: 'uz ru name' },
              { path: 'categories', select: 'uz ru name' },
            ],
          },
        });
      if (!timer) throw new Error('timer_not_found');
      return {
        success: true,
        data: timer,
        message: 'timer_fetched_successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error,
      };
    }
  }

  async findByMedia(id: string, mediaType: 'Movies' | 'Series') {
    try {
      const timer = await this.timerModel.findOne({ media: id, mediaType });
      if (!timer) throw new Error('timer_not_found');
      return {
        success: true,
        data: timer,
        message: 'timer_fetched_successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error,
      };
    }
  }

  async remove(id: string) {
    try {
      const timer = await this.timerModel.findByIdAndDelete(id);
      if (!timer) throw new Error('timer_not_found');
      return {
        success: true,
        data: timer,
        message: 'timer_deleted_successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error,
      };
    }
  }
}
