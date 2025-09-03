import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type AvatarDocument = HydratedDocument<Avatar>;

@Schema({ timestamps: true, collection: 'avatars' })
export class Avatar {
  @Prop({ required: true })
  avatar: string;
}

export const AvatarSchema = SchemaFactory.createForClass(Avatar);
