import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateSliderDto } from './dto/create-slider.dto';
import { UpdateSliderDto } from './dto/update-slider.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Sliders, SlidersDocument } from './sliders.model';
import { Movies, MoviesDocument } from 'src/movies/movies.model';
import { Series, SeriesDocument } from 'src/series/series.model';
import { CustomHttpException } from 'src/exeptions/custom-exeption';

@Injectable()
export class SlidersService {
  constructor(
    @InjectModel(Sliders.name)
    private readonly sliderModel: Model<SlidersDocument>,
    @InjectModel(Movies.name)
    private readonly moviesModel: Model<MoviesDocument>,
    @InjectModel(Series.name)
    private readonly seriesModel: Model<SeriesDocument>,
  ) {}
  async create(createSliderDto: CreateSliderDto) {
    try {
      if (
        createSliderDto?.mediaType !== 'movies' &&
        createSliderDto?.mediaType !== 'series'
      )
        throw new Error('media_type_must_be_movies_or_series');
      const media = await this?.[
        `${createSliderDto.mediaType as 'movies'}Model`
      ].findById(createSliderDto.media);
      if (!media) throw new Error('media_not_found');
      const slider = await this.sliderModel.create({
        ...createSliderDto,
        mediaType:
          createSliderDto.mediaType.charAt(0).toUpperCase() +
          createSliderDto.mediaType.slice(1),
      });
      if (!slider) throw new Error('slider_create_error');
      return {
        success: true,
        data: slider,
        message: 'slider_created_successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error,
      };
    }
  }

  async findAll() {
    try {
      const sliders = await this.sliderModel.find().populate({
        path: 'media',
        select: 'uz ru slug age _id',
      });
      return {
        success: true,
        data: sliders,
        message: 'sliders_created_successfully',
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

  async update(id: string, updateSliderDto: UpdateSliderDto) {
    try {
      const existSlider = await this.sliderModel.findById(id);
      if (!existSlider) throw new Error('slider_not_found');
      if (updateSliderDto.image) {
        if (updateSliderDto.image.startsWith('//')) {
          updateSliderDto.image = `/${updateSliderDto.image.slice(2)}`;
        }
      }
      if (updateSliderDto.mobile_image) {
        if (updateSliderDto.mobile_image.startsWith('//')) {
          updateSliderDto.mobile_image = `/${updateSliderDto.mobile_image.slice(2)}`;
        }
      }
      const slider = await this.sliderModel.findByIdAndUpdate(
        id,
        {
          ...updateSliderDto,
          mediaType:
            updateSliderDto?.mediaType === 'movies' ||
            updateSliderDto?.mediaType === 'series'
              ? updateSliderDto?.mediaType?.charAt(0).toUpperCase() +
                updateSliderDto?.mediaType?.slice(1)
              : existSlider?.mediaType,
        },
        {
          new: true,
        },
      );
      if (!slider) throw new Error('slider_not_found');
      return {
        success: true,
        data: slider,
        message: 'slider_updated_successfully',
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
      const slider = await this.sliderModel.findByIdAndDelete(id);
      if (!slider) throw new Error('slider_not_found');
      return {
        success: true,
        data: slider,
        message: 'slider_deleted_successfully',
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
