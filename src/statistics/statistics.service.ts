import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as moment from 'moment';
import { User, UserDocument } from 'src/user/user.model';
import { Movies, MoviesDocument } from 'src/movies/movies.model';
import { Series, SeriesDocument } from 'src/series/series.model';
import { Casts, CastsDocument } from 'src/casts/casts.model';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(Movies.name)
    private readonly moviesModel: Model<MoviesDocument>,
    @InjectModel(Series.name)
    private readonly seriesModel: Model<SeriesDocument>,
    @InjectModel(Casts.name)
    private readonly castsModel: Model<CastsDocument>,
  ) {}

  async findAll(dateStr: string) {
    try {
      if (!moment(dateStr, 'DD-MM-YYYY', true).isValid()) {
        dateStr = moment().format('DD-MM-YYYY');
      }
      const startOfDay = moment(dateStr, 'DD-MM-YYYY').startOf('day').toDate();
      const endOfDay = moment(dateStr, 'DD-MM-YYYY').endOf('day').toDate();

      const [
        registeredUsers,
        premiumUsersThatDay,
        totalPremiumUsers,
        movies,
        series,
        casts,
      ] = await Promise.all([
        this.userModel.countDocuments({
          createdAt: { $gte: startOfDay, $lte: endOfDay },
        }),
        this.userModel.countDocuments({
          createdAt: { $gte: startOfDay, $lte: endOfDay },
          subscription: { $ne: null },
        }),
        this.userModel.countDocuments({ is_premium: true }),
        this.moviesModel.countDocuments(),
        this.seriesModel.countDocuments(),
        this.castsModel.countDocuments(),
      ]);

      return {
        success: true,
        message: 'Statistics fetched successfully',
        data: {
          date: dateStr,
          registeredUsers,
          premiumUsersThatDay,
          totalPremiumUsers,
          movies,
          series,
          casts,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error,
        data: {
          date: dateStr,
          registeredUsers: 0,
          premiumUsersThatDay: 0,
          totalPremiumUsers: 0,
          moviesCount: 0,
          seriesCount: 0,
          castsCount: 0,
        },
      };
    }
  }
}
