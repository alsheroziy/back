import { BadRequestException, Injectable } from '@nestjs/common';
import { UpdateGenreDto } from './dto/update-genre.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Genres, GenresDocument } from './genres.model';
import { Model } from 'mongoose';
import { CreateGenreDto } from './dto/create-genre.dto';

@Injectable()
export class GenresService {
  constructor(
    @InjectModel(Genres.name)
    private readonly genreModel: Model<GenresDocument>,
  ) {}
  async create(createGenreDto: CreateGenreDto) {
    try {
      console.log(createGenreDto);
      const exisGenre = await this.genreModel.findOne({
        slug: createGenreDto.slug,
      });
      if (exisGenre) throw new BadRequestException('Genre already exists');
      const res = await this.genreModel.create(createGenreDto);
      return {
        success: true,
        data: res,
        message: 'Genre created successfully',
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findAll(props: {
    search: string;
    limit: number;
    page: number;
    sortBy?: string;
    sortDirection?: number;
  }) {
    try {
      const filter: any = {
        $or: [
          { 'name.uz': { $regex: props.search || '', $options: 'i' } },
          { slug: { $regex: props.search || '', $options: 'i' } },
          { 'name.ru': { $regex: props.search || '', $options: 'i' } },
        ],
      };
      const sort = { [props.sortBy || 'createdAt']: props.sortDirection || -1 };
      const res = await this.genreModel
        .find(filter)
        .limit(props.limit)
        .skip((props.page - 1) * props.limit);
      const total = await this.genreModel
        .find(filter)
        .sort(sort as any)
        .countDocuments();
      const pagination = {
        page: props.page,
        limit: props.limit,
        total,
        pages: Math.ceil(total / props.limit),
        next: props.page >= Math.ceil(total / props.limit) ? 1 : props.page + 1,
      };
      return {
        success: true,
        data: { genres: res, pagination },
        message: 'Genres fetched successfully',
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findOne(id: string) {
    try {
      const res = await this.genreModel.findById(id);
      if (!res) throw new BadRequestException('Genre not found');
      return {
        success: true,
        data: res,
        message: 'Genre fetched successfully',
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async update(id: string, updateGenreDto: UpdateGenreDto) {
    try {
      const res = await this.genreModel.findByIdAndUpdate(id, updateGenreDto, {
        new: true,
      });
      if (!res) throw new BadRequestException('Genre not found');
      return {
        success: true,
        data: res,
        message: 'Genre updated successfully',
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async remove(id: string) {
    try {
      const res = await this.genreModel.findByIdAndDelete(id);
      if (!res) throw new BadRequestException('Genre not found');
      return {
        success: true,
        data: res,
        message: 'Genre deleted successfully',
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
