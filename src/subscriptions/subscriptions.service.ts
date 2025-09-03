import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Subscription, SubscriptionDocument } from './subscriptions.model';
import { User, UserDocument } from 'src/user/user.model';
import { Plan, PlanDocument } from 'src/plans/plans.model';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectModel(Subscription.name)
    private readonly subscriptionModel: Model<SubscriptionDocument>,
    @InjectModel(Plan.name) private readonly planModel: Model<PlanDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async create(userId: string, planId: string) {
    try {
      const plan = await this.planModel.findById(planId);
      if (!plan) throw new BadRequestException('plan_not_found');
      const user = await this.userModel.findById(userId);
      if (!user) throw new BadRequestException('user_not_found');
      if (user.subscription) {
        const subscription = await this.subscriptionModel.findById(
          user.subscription,
        );
        if (subscription) {
          throw new BadRequestException('user_already_has_subscription');
        } else {
          await this.subscriptionModel.findByIdAndDelete(user.subscription);
          await this.userModel.findByIdAndUpdate(userId, {
            subscription: null,
          });
        }
      }
      if (user.balance < plan.price)
        throw new BadRequestException(
          `not_enough_balance: {{${plan.price - user.balance}}}`,
        );

      const subscription = await this.subscriptionModel.create({
        user_id: user._id,
        plan_id: plan._id,
        start_date: Date.now(),
        end_date: new Date(Date.now() + plan.time * (86400000 * 30)),
      });
      if (subscription) {
        const subsrctibeUser = await this.userModel.findByIdAndUpdate(
          userId,
          {
            subscription: subscription._id,
            balance: user.balance - plan.price,
          },
          { new: true },
        );
        if (!subsrctibeUser)
          throw new BadRequestException('something_went_wrong_plan_create');
      }
      return {
        success: true,
        data: subscription,
        message: "subscribed_successfully"
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findAll(limit: number = 50, page: number = 1) {
    try {
      const subscriptions = await this.subscriptionModel
        .find()
        .populate('plan_id')
        .populate('user_id', '-password')
        .limit(limit)
        .skip((page - 1) * limit);

      const count = await this.subscriptionModel.countDocuments();
      const pagination = {
        page,
        limit,
        total: count,
        pages: Math.ceil(count / limit),
        next: page >= Math.ceil(count / limit) ? 1 : page + 1,
      };

      return {
        pagination,
        data: subscriptions,
        success: true,
        message: "subscriptions_fetched_successfully"
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
  async findByUserId(userId: string) {
    try {
      const subscription = await this.subscriptionModel
        .findOne({
          user_id: userId,
        })
        .populate('plan_id')
        .populate('user_id', '-password');
      if (!subscription)
        throw new BadRequestException('user_have_not_subscribtion');
      return subscription;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async delete(id: string) {
    try {
      return await this.subscriptionModel.findByIdAndDelete(id);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async deleteByUserId(userId: string) {
    try {
      return await this.subscriptionModel.findOneAndDelete({ user_id: userId });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
