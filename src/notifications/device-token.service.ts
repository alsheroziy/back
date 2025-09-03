import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { DeviceToken, type DeviceTokenDocument } from './device-token.model';
import { FirebaseService } from 'src/firebase/firebase.service';

@Injectable()
export class DeviceTokenService {
  private readonly logger = new Logger(DeviceTokenService.name);

  constructor(
    @InjectModel(DeviceToken.name)
    private deviceTokenModel: Model<DeviceTokenDocument>,
    private firebaseService: FirebaseService,
  ) {}

  async registerToken(
    userId: string,
    token: string,
    deviceInfo?: string,
    platform?: string,
  ) {
    try {
      // Check if token already exists
      const existingToken = await this.deviceTokenModel.findOne({ token });

      if (existingToken) {
        // Update token if it belongs to a different user
        if (existingToken.user_id.toString() !== userId) {
          existingToken.user_id = userId as any;
          existingToken.device_info = deviceInfo || existingToken.device_info;
          existingToken.platform = platform || existingToken.platform;
          await existingToken.save();
        }
        return existingToken;
      }

      // Create new token
      const deviceToken = await this.deviceTokenModel.create({
        user_id: userId,
        token,
        device_info: deviceInfo,
        platform,
      });

      // Subscribe to general topic
      await this.firebaseService.subscribeToTopic(token, 'all_users');

      return deviceToken;
    } catch (error) {
      this.logger.error(`Error registering device token: ${error.message}`);
      throw error;
    }
  }

  async unregisterToken(userId: string, token: string) {
    try {
      const result = await this.deviceTokenModel.findOneAndDelete({
        user_id: userId,
        token,
      });

      if (result) {
        // Unsubscribe from general topic
        await this.firebaseService.unsubscribeFromTopic(token, 'all_users');
      }

      return { success: !!result };
    } catch (error) {
      this.logger.error(`Error unregistering device token: ${error.message}`);
      throw error;
    }
  }

  async getUserTokens(userId: string): Promise<string[]> {
    try {
      const deviceTokens = await this.deviceTokenModel.find({
        user_id: userId,
      });
      return deviceTokens.map((dt) => dt.token);
    } catch (error) {
      this.logger.error(`Error getting user tokens: ${error.message}`);
      throw error;
    }
  }
}
