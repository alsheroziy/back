import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { type HydratedDocument, Types } from 'mongoose';
import { User } from 'src/user/user.model';

export type NotificationDocument = HydratedDocument<Notification>;

export enum NotificationType {
  PAYMENT = 'payment',
  NEW_EPISODE = 'new_episode',
  SYSTEM = 'system',
}

@Schema({ timestamps: true, collection: 'notifications' })
export class Notification {
  @Prop({ required: true, type: Types.ObjectId, ref: User.name })
  user_id: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  body: string;

  @Prop({
    required: true,
    enum: Object.values(NotificationType),
    default: NotificationType.SYSTEM,
  })
  type: string;

  @Prop({ required: false, default: false })
  read: boolean;

  @Prop({ type: Object, required: false, default: {} })
  data: Record<string, any>;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
