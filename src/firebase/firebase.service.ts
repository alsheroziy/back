import { Injectable, Logger, type OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import type { ServiceAccount } from 'firebase-admin';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseService.name);

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    this.initializeFirebaseApp();
  }

  private initializeFirebaseApp() {
    try {
      const firebaseConfig = this.configService.get<string>('FIREBASE_CONFIG');

      if (!firebaseConfig) {
        this.logger.warn(
          'Firebase configuration not found. Push notifications will not work.',
        );
        return;
      }

      const serviceAccount: ServiceAccount = JSON.parse(firebaseConfig);

      if (!admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
        this.logger.log('Firebase Admin SDK initialized successfully');
      }
    } catch (error) {
      this.logger.error(
        `Failed to initialize Firebase Admin SDK: ${error.message}`,
      );
    }
  }

  async sendNotification(
    token: string | string[],
    notification: { title: string; body: string },
    data: Record<string, string> = {},
  ) {
    try {
      if (!admin.apps.length) {
        this.logger.warn('Firebase not initialized. Cannot send notification.');
        return;
      }

      const tokens = Array.isArray(token) ? token : [token];

      if (tokens.length === 0) {
        this.logger.warn('No tokens provided for notification');
        return;
      }

      // For multiple tokens
      if (tokens.length > 1) {
        const message: admin.messaging.MulticastMessage = {
          tokens,
          notification: {
            title: notification.title,
            body: notification.body,
          },
          data,
          android: {
            priority: 'high',
            notification: {
              sound: 'default',
              channelId: 'amedia-notifications',
            },
          },
          apns: {
            payload: {
              aps: {
                sound: 'default',
                badge: 1,
              },
            },
          },
        };

        const response = await admin.messaging().sendEachForMulticast(message);
        this.logger.log(
          `Successfully sent message: ${response.successCount} / ${tokens.length}`,
        );
        return response;
      }
      // For a single token
      else {
        const message: admin.messaging.Message = {
          token: tokens[0],
          notification: {
            title: notification.title,
            body: notification.body,
          },
          data,
          android: {
            priority: 'high',
            notification: {
              sound: 'default',
              channelId: 'amedia-notifications',
            },
          },
          apns: {
            payload: {
              aps: {
                sound: 'default',
                badge: 1,
              },
            },
          },
        };

        const response = await admin.messaging().send(message);
        this.logger.log(`Successfully sent message to token: ${tokens[0]}`);
        return response;
      }
    } catch (error) {
      this.logger.error(`Error sending notification: ${error.message}`);
      throw error;
    }
  }

  async sendToTopic(
    topic: string,
    notification: { title: string; body: string },
    data: Record<string, string> = {},
  ) {
    try {
      if (!admin.apps.length) {
        this.logger.warn('Firebase not initialized. Cannot send notification.');
        return;
      }

      const message: admin.messaging.Message = {
        topic,
        notification: {
          title: notification.title,
          body: notification.body,
        },
        data,
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            channelId: 'amedia-notifications',
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
            },
          },
        },
      };

      const response = await admin.messaging().send(message);
      this.logger.log(`Successfully sent message to topic: ${topic}`);

      return response;
    } catch (error) {
      this.logger.error(
        `Error sending notification to topic: ${error.message}`,
      );
      throw error;
    }
  }

  async subscribeToTopic(tokens: string | string[], topic: string) {
    try {
      if (!admin.apps.length) {
        this.logger.warn(
          'Firebase not initialized. Cannot subscribe to topic.',
        );
        return;
      }

      const tokenArray = Array.isArray(tokens) ? tokens : [tokens];
      const response = await admin
        .messaging()
        .subscribeToTopic(tokenArray, topic);
      this.logger.log(`Successfully subscribed to topic: ${topic}`);

      return response;
    } catch (error) {
      this.logger.error(`Error subscribing to topic: ${error.message}`);
      throw error;
    }
  }

  async unsubscribeFromTopic(tokens: string | string[], topic: string) {
    try {
      if (!admin.apps.length) {
        this.logger.warn(
          'Firebase not initialized. Cannot unsubscribe from topic.',
        );
        return;
      }

      const tokenArray = Array.isArray(tokens) ? tokens : [tokens];
      const response = await admin
        .messaging()
        .unsubscribeFromTopic(tokenArray, topic);
      this.logger.log(`Successfully unsubscribed from topic: ${topic}`);

      return response;
    } catch (error) {
      this.logger.error(`Error unsubscribing from topic: ${error.message}`);
      throw error;
    }
  }
}
