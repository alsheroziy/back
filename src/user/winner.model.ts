import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from './user.model';

export type WinnerDocument = HydratedDocument<Winner>;

@Schema({ timestamps: true, collection: 'winner' })
export class Winner {
  @Prop({ required: false, default: '' })
  comment: string;

  @Prop({
    required: true,
    type: Types.ObjectId,
    ref: User.name,
  })
  winner: User;
}

export const WinnerSchema = SchemaFactory.createForClass(Winner);
