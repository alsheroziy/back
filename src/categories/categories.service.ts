import { BadRequestException, Injectable } from '@nestjs/common';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Categories, CategoriesDocument } from './categories.model';
import { Model } from 'mongoose';
import { CreateCategoryDto } from './dto/create-category.dto';
import { Movies, MoviesDocument } from 'src/movies/movies.model';
import { Series, SeriesDocument } from 'src/series/series.model';
import { parseObjectIdArray } from 'src/modules/universal-objectid.module';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Categories.name)
    private readonly categoryModel: Model<CategoriesDocument>,
    @InjectModel(Movies.name)
    private readonly moviesModel: Model<MoviesDocument>,
    @InjectModel(Series.name)
    private readonly seriesModel: Model<SeriesDocument>,
  ) {}
  async create(createCategoryDto: CreateCategoryDto) {
    try {
      console.log(createCategoryDto);
      const exisCategory = await this.categoryModel.findOne({
        slug: createCategoryDto.slug,
      });
      if (exisCategory)
        throw new BadRequestException('Category already exists');
      const res = await this.categoryModel.create(createCategoryDto);
      return {
        success: true,
        data: res,
        message: 'Category created successfully',
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
      const res = await this.categoryModel
        .find(filter)
        .limit(props.limit)
        .skip((props.page - 1) * props.limit);
      const total = await this.categoryModel.countDocuments(filter);

      const pagination = {
        page: props.page,
        limit: props.limit,
        total,
        pages: Math.ceil(total / props.limit),
        next: props.page >= Math.ceil(total / props.limit) ? 1 : props.page + 1,
      };

      const categoriesWithAnimeCount = await Promise.all(
        res.map(async (category) => {
          const items = parseObjectIdArray(String(category._id));
          const movieCount = await this.moviesModel.countDocuments({
            categories: { $in: items },
          });
          const seriesCount = await this.seriesModel.countDocuments({
            categories: { $in: items },
          });
          const allCount = movieCount + seriesCount;
          console.log(movieCount, category._id);
          return { ...category.toObject(), anime_count: allCount };
        }),
      );

      return {
        success: true,
        data: { categories: categoriesWithAnimeCount, pagination },
        message: 'Categories fetched successfully',
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findOne(id: string) {
    try {
      const res = await this.categoryModel.findById(id);
      if (!res) throw new BadRequestException('Category not found');
      return {
        success: true,
        data: res,
        message: 'Category fetched successfully',
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    try {
      const res = await this.categoryModel.findByIdAndUpdate(
        id,
        updateCategoryDto,
        { new: true },
      );
      if (!res) throw new BadRequestException('Category not found');
      return {
        success: true,
        data: res,
        message: 'Category updated successfully',
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async remove(id: string) {
    try {
      const res = await this.categoryModel.findByIdAndDelete(id);
      if (!res) throw new BadRequestException('Category not found');
      return {
        success: true,
        data: res,
        message: 'Category deleted successfully',
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
