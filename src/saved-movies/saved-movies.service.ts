import { Injectable } from '@nestjs/common';
import { CreateSavedSeryDto } from './dto/create-saved-sery.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Movies, MoviesDocument } from 'src/movies/movies.model';
import { SavedMovies, SavedMoviesDocument } from './saved-movies.model';

@Injectable()
export class SavedMoviesService {
  constructor(
    @InjectModel(SavedMovies.name)
    private readonly savedMoviesModel: Model<SavedMoviesDocument>,
    @InjectModel(Movies.name)
    private readonly moviesModel: Model<MoviesDocument>,
  ) {}
  async create(createSavedSeryDto: CreateSavedSeryDto, userId: string) {
    try {
      const movies = await this.moviesModel.findById(createSavedSeryDto.media);
      if (!movies) throw new Error('movie_not_found');
      const exist = await this.savedMoviesModel.findOne({
        user_id: userId,
        media: createSavedSeryDto.media,
      });
      if (exist) throw new Error('movie_already_exist');
      const saved_movies = await this.savedMoviesModel.create({
        ...createSavedSeryDto,
        user_id: userId,
      });
      return {
        success: true,
        data: saved_movies,
        message: 'saved_movie_created_successfully',
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
      const saved_movies = await this.savedMoviesModel
        .find({ user_id: _id })
        .populate('media')
        .populate('user_id');
      return {
        success: true,
        data: saved_movies,
        message: 'saved_movie_fetched_successfully',
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
      const saved_movies = await this.savedMoviesModel.findOneAndDelete({
        media: id,
        user_id: _id,
      });
      if (!saved_movies) throw new Error('saved_movie_not_found');
      return {
        success: true,
        data: saved_movies,
        message: 'saved_movie_deleted_successfully',
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
