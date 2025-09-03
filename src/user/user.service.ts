import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './user.model';
import mongoose, { isValidObjectId, Model, Types } from 'mongoose';
import { Session, SessionDocument } from 'src/auth/sessions.model';
import {
  SavedMovies,
  SavedMoviesDocument,
} from 'src/saved-movies/saved-movies.model';
import {
  SavedSeries,
  SavedSeriesDocument,
} from 'src/saved-series/saved-series.model';
import { Genres } from 'src/genres/genres.model';
import { generateUserId } from 'src/modules/generate-user-id.module';
import { CustomHttpException } from 'src/exeptions/custom-exeption';
import { Winner, WinnerDocument } from './winner.model';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Winner.name)
    private readonly winnerModel: Model<WinnerDocument>,
    @InjectModel(Session.name)
    private readonly sessionModel: Model<SessionDocument>,
    @InjectModel(SavedSeries.name)
    private readonly savedSeriesModel: Model<SavedSeriesDocument>,
    @InjectModel(SavedMovies.name)
    private readonly savedMoviesModel: Model<SavedMoviesDocument>,
  ) {}

  async create(dto: UserDocument) {
    try {
      const existUserWithEmail = await this.userModel.findOne({
        email: dto.email,
      });
      if (existUserWithEmail) throw new Error('user_exist_with_email');

      const existUserWithPhone = await this.userModel.findOne({
        phone_number: dto.phone_number,
      });
      if (existUserWithPhone) throw new Error('user_exist_with_phone');

      let unique_id = generateUserId();

      let existUserWithUniqueId = await this.userModel.findOne({
        unique_id,
      });

      while (existUserWithUniqueId) {
        unique_id = generateUserId();
        existUserWithUniqueId = await this.userModel.findOne({
          unique_id,
        });
      }

      const user = await this.userModel.create({
        ...dto,
        unique_id,
        created_by_admin: true,
      });
      return {
        success: true,
        data: { user },
        message: 'user_created_from_admin',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error,
        data: null,
      };
    }
  }

  async byId(_id: string) {
    try {
      const user = await this.userModel
        .findById(_id)
        .select('-password')
        .populate('transactions')
        .populate('subscription')
        .populate('last_anime');
      if (!user) throw new Error('user_not_found_with_session');
      return user;
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error,
      };
    }
  }

  async me(_id: string, req: Request) {
    const jwt_token = req.headers?.['authorization']
      ?.split(' ')[1]
      .split('.')[1];
    const current_device_token_id = JSON.parse(atob(jwt_token)).token_id;
    try {
      const user = await this.userModel
        .findById(_id)
        .select('-password')
        .populate('transactions')
        .populate('subscription')
        .populate('last_anime')
        .populate({
          path: 'last_anime',
          populate: {
            path: 'genres',
            model: Genres.name,
          },
        });
      if (!user) throw new Error('user_not_found_with_session');
      const userSessions = await this.sessionModel.find({
        user_id: String(user._id),
      });
      const userSavedSeries = await this.savedSeriesModel.find({
        user_id: _id,
      });
      // .populate('media');
      const userSavedMovies = await this.savedMoviesModel.find({
        user_id: _id,
      });
      // .populate('media');
      if (userSessions.length >= 4 && user.role === 'USER') {
        return {
          success: false,
          message: 'session_limit_{{limit}}_reached',
          error: 'too_many_sessions',
          data: {
            token_id: current_device_token_id,
            name: user.name,
            total: userSessions.length,
            sessions: userSessions,
          },
        };
      }
      return {
        success: true,
        data: {
          ...user.toObject(),
          token_id: current_device_token_id,
          sessions: userSessions,
          saved_series: userSavedSeries,
          saved_movies: userSavedMovies,
          total: userSessions.length,
        },
        message: 'user_fetched_successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error,
      };
    }
  }

  async getAll(props: {
    search: string;
    limit: number;
    page: number;
    has_subscription: boolean;
  }) {
    try {
      const filter: any = {
        $or: [
          { name: { $regex: props.search || '', $options: 'i' } },
          { email: { $regex: props.search || '', $options: 'i' } },
          {
            $expr: {
              $regexMatch: {
                input: { $toString: '$phone_number' },
                regex: props.search || '',
                options: 'i',
              },
            },
          },
          {
            $expr: {
              $regexMatch: {
                input: { $toString: '$unique_id' },
                regex: props.search || '',
                options: 'i',
              },
            },
          },
        ],
      };

      if (props.has_subscription) {
        filter.subscription = { $ne: null };
      }

      const users = await this.userModel
        .find(filter)
        .select('-password')
        .populate('transactions')
        .populate('subscription')
        .populate('last_anime')
        .limit(props.limit)
        .skip((props.page - 1) * props.limit);
      const count = await this.userModel.countDocuments();
      const pagination = {
        page: props.page,
        limit: props.limit,
        total: count,
        pages: Math.ceil(count / props.limit),
        next: props.page + 1,
      };
      return {
        success: true,
        data: { users, pagination },
        message: 'users_fecthed_successfully',
      };
    } catch (error) {
      console.log(error);
      throw new CustomHttpException(
        error.message,
        error,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async update(_id: string, dto: UserDocument) {
    try {
      const user = await this.userModel.findById(_id);
      if (!user) throw new NotFoundException('user_not_found');
      const updatedUser = await this.userModel.findByIdAndUpdate(
        _id,
        {
          ...dto,
          activated: dto.activated,
          role: dto.role,
          balance: dto.balance,
          phone_number: dto.phone_number,
          unique_id: dto.unique_id,
        },
        {
          new: true,
        },
      );
      return {
        success: true,
        data: updatedUser,
        message: 'updated_successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error,
      };
    }
  }
  async updateAdmin(_id: string, dto: UserDocument) {
    try {
      const existUser = await this.userModel.findById(_id);
      if (!existUser) throw new NotFoundException('user_not_found');
      const user_exist_with_email = await this.userModel.findOne({
        email: dto.email,
      });
      if (
        user_exist_with_email &&
        user_exist_with_email.email !== existUser.email
      )
        throw new Error('user_exist_with_email');
      const user_exist_with_phone = await this.userModel.findOne({
        phone_number: dto.phone_number,
      });
      if (
        user_exist_with_phone &&
        user_exist_with_phone.phone_number !== existUser.phone_number
      )
        throw new Error('user_exist_with_phone');
      const user = await this.userModel.findById(_id);
      if (!user) throw new NotFoundException('user_not_found');
      const updatedUser = await this.userModel.findByIdAndUpdate(_id, dto, {
        new: true,
      });
      return {
        success: true,
        data: updatedUser,
        message: 'updated_successfully',
      };
    } catch (error) {
      console.log(error);
      throw new CustomHttpException(
        error.message,
        error,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async delete(_id: string) {
    try {
      const user = await this.userModel.findByIdAndDelete(_id);
      if (!user) throw new NotFoundException('user_not_found');
      return {
        success: true,
        data: user,
        message: 'deleted_successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error,
      };
    }
  }

  async givewayCreate({ comment }: { comment?: string }) {
    try {
      const users = await this.userModel.find({ subscription: { $ne: null } }); // barcha userlarni olish
      if (!users.length) throw new NotFoundException('no_users_found');

      const randomIndex = Math.floor(Math.random() * users.length); // random user tanlash
      const randomUser = users[randomIndex];

      const giveway = await this.winnerModel.create({
        winner: randomUser._id,
        comment,
      });

      return {
        success: true,
        data: { giveway, user: randomUser },
        message: 'giveway_created_successfully',
      };
    } catch (error) {
      console.log(error);
      throw new CustomHttpException(
        error.message,
        error,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getAllGiveway({ page, limit }: { page: number; limit: number }) {
    try {
      const giveway = await this.winnerModel
        .find()
        .populate('winner')
        .limit(limit)
        .skip((page - 1) * limit);
      const count = await this.winnerModel.countDocuments();
      const pagination = {
        page,
        limit,
        total: count,
        pages: Math.ceil(count / limit),
        next: page + 1,
      };
      return {
        success: true,
        data: { giveway, pagination },
        message: 'giveway_fetched_successfully',
      };
    } catch (error) {
      console.log(error);
      throw new CustomHttpException(
        error.message,
        error,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getGivewayByUser({
    user_id,
    page,
    limit,
  }: {
    user_id: string;
    page: number;
    limit: number;
  }) {
    try {
      const giveway = await this.winnerModel
        .find({ user_id })
        .populate('winner')
        .limit(limit)
        .skip((page - 1) * limit);
      const count = await this.winnerModel.countDocuments({ user_id });
      const pagination = {
        page,
        limit,
        total: count,
        pages: Math.ceil(count / limit),
        next: page + 1,
      };
      return {
        success: true,
        data: { giveway, pagination },
        message: 'giveway_fetched_successfully',
      };
    } catch (error) {
      console.log(error);
      throw new CustomHttpException(
        error.message,
        error,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
