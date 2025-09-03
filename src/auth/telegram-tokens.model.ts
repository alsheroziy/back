import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type TelegramTokenDocument = HydratedDocument<TelegramToken>;

@Schema({ timestamps: true, collection: 'telegram-token' })
export class TelegramToken {
  @Prop({ required: true, default: '' })
  token: string;

  @Prop({ required: false, default: false })
  activated: boolean;

  @Prop({
    required: false,
    type: Types.ObjectId,
    ref: TelegramToken.name,
    default: null,
  })
  linked_user: Types.ObjectId;
}

export const TelegramTokenSchema = SchemaFactory.createForClass(TelegramToken);
