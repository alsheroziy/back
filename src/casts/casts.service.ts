import { BadRequestException, Injectable } from '@nestjs/common';
import { UpdateCastDto } from './dto/update-cast.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Casts, CastsDocument } from './casts.model';
import { Model } from 'mongoose';
import { CreateCastDto } from './dto/create-cast.dto';

@Injectable()
export class CastsService {
  constructor(
    @InjectModel(Casts.name) private readonly castModel: Model<CastsDocument>,
  ) {}
  async create(createCastDto: CreateCastDto) {
    try {
      const res = await this.castModel.create(createCastDto);
      return {
        success: true,
        data: res,
        message: 'Cast created successfully',
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
    role?: string;
  }) {
    try {
      const filter: any = {
        $or: [
          { name: { $regex: props.search || '', $options: 'i' } },
          { slug: { $regex: props.search || '', $options: 'i' } },
        ],
      };
      if (props.role) filter.role = props.role;
      const sort = { [props.sortBy || 'createdAt']: props.sortDirection || -1 };
      const total = await this.castModel
        .find(filter)
        .sort(sort as any)
        .countDocuments();

      const res = await this.castModel
        .find(filter)
        .limit(props.limit)
        .skip((props.page - 1) * props.limit);
      const pagination = {
        page: props.page,
        limit: props.limit,
        total,
        pages: Math.ceil(total / props.limit),
        next: props.page >= Math.ceil(total / props.limit) ? 1 : props.page + 1,
      };
      return {
        success: true,
        data: { casts: res, pagination },
        message: 'Casts fetched successfully',
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findOne(id: string) {
    try {
      const res = await this.castModel.findById(id);
      if (!res) throw new BadRequestException('Cast not found');
      return {
        success: true,
        data: res,
        message: 'Cast fetched successfully',
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async update(id: string, updateCastDto: UpdateCastDto) {
    try {
      const res = await this.castModel.findByIdAndUpdate(id, updateCastDto, {
        new: true,
      });
      if (!res) throw new BadRequestException('Cast not found');
      return {
        success: true,
        data: res,
        message: 'Cast updated successfully',
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async remove(id: string) {
    try {
      const res = await this.castModel.findByIdAndDelete(id);
      if (!res) throw new BadRequestException('Cast not found');
      return {
        success: true,
        data: res,
        message: 'Cast deleted successfully',
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
