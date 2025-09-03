import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import {
  Notification,
  type NotificationDocument,
  NotificationType,
} from './notifications.model';
import { FirebaseService } from 'src/firebase/firebase.service';
import { User, type UserDocument } from 'src/user/user.model';
import { DeviceToken, type DeviceTokenDocument } from './device-token.model';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<NotificationDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(DeviceToken.name)
    private readonly deviceTokenModel: Model<DeviceTokenDocument>,
    private firebaseService: FirebaseService,
  ) {}

  async createNotification(
    userId: string,
    title: string,
    body: string,
    type: NotificationType,
    data: Record<string, any> = {},
  ) {
    try {
      const notification = await this.notificationModel.create({
        user_id: userId,
        title,
        body,
        type,
        data,
        read: false,
      });

      // Get user's device tokens
      const deviceTokens = await this.deviceTokenModel.find({
        user_id: userId,
      });
      const tokens = deviceTokens.map((dt) => dt.token);

      if (tokens.length > 0) {
        // Send push notification if user has registered devices
        await this.firebaseService.sendNotification(
          tokens,
          { title, body },
          { ...data, type, notificationId: notification._id.toString() },
        );
      }

      return notification;
    } catch (error) {
      this.logger.error(`Error creating notification: ${error.message}`);
      throw error;
    }
  }

  async sendPaymentNotification(userId: string, amount: number) {
    const title = "To'lov muvaffaqiyatli";
    const body = `Hisobingiz ${amount} so'm miqdorga to'ldirildi`;

    return this.createNotification(
      userId,
      title,
      body,
      NotificationType.PAYMENT,
      { amount: amount.toString() },
    );
  }

  async sendNewEpisodeNotification(
    userId: string,
    seriesName: string,
    seasonNumber: number,
    episodeNumber: number,
    seriesId: string,
    seasonId: string,
    episodeId: string,
  ) {
    const title = "Yangi qism qo'shildi";
    const body = `"${seriesName}" serialining ${seasonNumber}-mavsum ${episodeNumber}-qismi chiqdi`;

    return this.createNotification(
      userId,
      title,
      body,
      NotificationType.NEW_EPISODE,
      {
        seriesId,
        seasonId,
        episodeId,
        seriesName,
        seasonNumber: seasonNumber.toString(),
        episodeNumber: episodeNumber.toString(),
      },
    );
  }

  async getUserNotifications(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      this.notificationModel
        .find({ user_id: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      this.notificationModel.countDocuments({ user_id: userId }),
    ]);

    return {
      data: notifications,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async markAsRead(notificationId: string, userId: string) {
    return this.notificationModel.findOneAndUpdate(
      { _id: notificationId, user_id: userId },
      { read: true },
      { new: true },
    );
  }

  async markAllAsRead(userId: string) {
    return this.notificationModel.updateMany(
      { user_id: userId, read: false },
      { read: true },
    );
  }

  async deleteNotification(notificationId: string, userId: string) {
    return this.notificationModel.findOneAndDelete({
      _id: notificationId,
      user_id: userId,
    });
  }

  async deleteAllNotifications(userId: string) {
    return this.notificationModel.deleteMany({ user_id: userId });
  }
}
