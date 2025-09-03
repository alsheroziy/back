import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Subscription, SubscriptionDocument } from './subscriptions.model';
import { User, UserDocument } from 'src/user/user.model';

@Injectable()
export class SubscriptionsCronService {
  private readonly logger = new Logger(SubscriptionsCronService.name);

  constructor(
    @InjectModel(Subscription.name)
    private readonly subscriptionModel: Model<SubscriptionDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleExpiredSubscriptions() {
    try {
      const now = new Date();

      const expiredCount = await this.subscriptionModel.countDocuments({
        end_date: { $lt: now },
      });

      if (expiredCount === 0) {
        this.logger.log('No expired subscriptions found.');
        return;
      }

      const expiredSubscriptions = await this.subscriptionModel
        .find({ end_date: { $lt: now } })
        .limit(200); // 200 ta batch

      const expiredUserIds = expiredSubscriptions.map(
        (subscription) => subscription.user_id,
      );

      await this.userModel.updateMany(
        { _id: { $in: expiredUserIds } },
        { $set: { subscription: null } },
      );

      await this.subscriptionModel.deleteMany({
        _id: { $in: expiredSubscriptions.map((sub) => sub._id) },
      });

      this.logger.log(
        `Deleted ${expiredSubscriptions.length} expired subscriptions.`,
      );
    } catch (error) {
      this.logger.error('Failed to delete expired subscriptions', error);
    }
  }
}
