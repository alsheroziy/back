import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { Movies } from 'src/movies/movies.model';
import { Series } from 'src/series/series.model';

export type SlidersDocument = HydratedDocument<Sliders>;

@Schema({ timestamps: true, collection: 'sliders' })
export class Sliders {
  @Prop({ required: true, type: Types.ObjectId, refPath: 'mediaType' })
  media: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true, type: String, enum: [Movies.name, Series.name] })
  mediaType: string;

  @Prop({ required: false, default: true })
  is_active: boolean;

  @Prop({ required: true, default: '' })
  image: string;

  @Prop({ required: true, default: '' })
  mobile_image: string;
}

export const SlidersSchema = SchemaFactory.createForClass(Sliders);
