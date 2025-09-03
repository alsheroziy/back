import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { type HydratedDocument, Types } from 'mongoose';
import { User } from 'src/user/user.model';

export type DeviceTokenDocument = HydratedDocument<DeviceToken>;

@Schema({ timestamps: true, collection: 'device_tokens' })
export class DeviceToken {
  @Prop({ required: true, type: Types.ObjectId, ref: User.name })
  user_id: Types.ObjectId;

  @Prop({ required: true, unique: true })
  token: string;

  @Prop({ required: false })
  device_info: string;

  @Prop({ required: false })
  platform: string;
}

export const DeviceTokenSchema = SchemaFactory.createForClass(DeviceToken);
