import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type CastsDocument = HydratedDocument<Casts>;

@Schema({ timestamps: true, collection: 'casts' })
export class Casts {
  @Prop({
    required: true,
  })
  name: string;

  @Prop({
    required: true,
  })
  image: string;

  @Prop({ required: false, default: true })
  status: boolean;

  @Prop({
    required: true,
    enum: ['creator', 'director', 'studio'],
  })
  role: string;
}

export const CastsSchema = SchemaFactory.createForClass(Casts);
