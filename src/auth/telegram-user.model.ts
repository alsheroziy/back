import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';
import { TelegramToken } from './telegram-tokens.model';

export type TelegramUserDocument = HydratedDocument<TelegramUser>;

@Schema({ timestamps: true })
export class TelegramUser {
  @Prop({ required: true, unique: true })
  telegram_id: number;

  @Prop({ required: false, default: null })
  phone_number: number;

  @Prop({ required: true })
  first_name: string;

  @Prop({ default: '' })
  last_name: string;

  @Prop({ default: null })
  image: string;

  @Prop({ default: null })
  username: string;

  @Prop({ default: null, ref: TelegramToken.name })
  token: Types.ObjectId;
}

export const TelegramUserSchema = SchemaFactory.createForClass(TelegramUser);
