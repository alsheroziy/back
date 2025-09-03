import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Series } from 'src/series/series.model';

export type SavedSeriesDocument = HydratedDocument<SavedSeries>;

@Schema({ timestamps: true, collection: 'saved-series' })
export class SavedSeries {
  @Prop({ required: true })
  user_id: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: Series.name })
  media: Types.ObjectId;

  @Prop({ required: false, default: null })
  last_visited: Date;
}

export const SavedSeriesSchema = SchemaFactory.createForClass(SavedSeries);
