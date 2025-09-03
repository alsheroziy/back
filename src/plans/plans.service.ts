import { BadRequestException, Injectable, Type } from '@nestjs/common';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { Plan, PlanDocument } from './plans.model';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class PlansService {
  constructor(
    @InjectModel(Plan.name) private readonly planModel: Model<PlanDocument>,
  ) {}
  async create(createPlanDto: CreatePlanDto) {
    try {
      return await this.planModel.create(createPlanDto);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findAll(limit: number = 50, page: number = 1) {
    try {
      const plans = await this.planModel
        .find()
        .limit(limit)
        .skip((page - 1) * limit);

      const count = await this.planModel.countDocuments();
      const pagination = {
        page,
        limit,
        total: count,
        pages: Math.ceil(count / limit),
        next: page + 1,
      };

      return {
        success: true,
        pagination,
        data: plans,
        message: 'plans_fetched_successfully',
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  findOne(id: Types.ObjectId) {
    try {
      const plan = this.planModel.findById(id);
      if (!plan) throw new BadRequestException('plan_not_found');

      return {
        success: true,
        data: plan,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async update(id: Types.ObjectId, updatePlanDto: UpdatePlanDto) {
    try {
      const exist = await this.planModel.findById(id);
      if (!exist) throw new BadRequestException('plan_not_found');
      const updated = await this.planModel.findByIdAndUpdate(
        id,
        updatePlanDto,
        { new: true },
      );

      return {
        success: true,
        data: updated,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async remove(id: Types.ObjectId) {
    try {
      const exist = await this.planModel.findById(id);
      if (!exist) throw new BadRequestException('plan_not_found');
      const deleted = await this.planModel.findByIdAndDelete(id);

      return {
        success: true,
        data: deleted,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
