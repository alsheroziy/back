import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { Seasons } from 'src/seasons/seasons.model';
import { Series } from 'src/series/series.model';

export type EpisodesDocument = HydratedDocument<Episodes>;

@Schema({ timestamps: true, collection: 'episodes' })
export class Episodes {
  @Prop({
    type: {
      title: {
        type: String,
        required: true,
        default: '',
      },
    },
    required: true,
  })
  uz: {
    title: string;
  };

  @Prop({
    type: {
      title: {
        type: String,
        required: true,
        default: '',
      },
    },
    required: true,
  })
  ru: {
    title: string;
  };

  @Prop({
    required: true,
  })
  slug: string;
  @Prop({ required: true, ref: Series.name })
  series_id: mongoose.Schema.Types.ObjectId;
  @Prop({ required: true, ref: Seasons.name })
  season_id: mongoose.Schema.Types.ObjectId;
  @Prop({ required: false, default: null })
  video: string;
  @Prop({ required: true, default: 'paid', enum: ['paid', 'free'] })
  type: string;
  @Prop({ required: true, default: 0 })
  episode_number: number;
  @Prop({ required: false, default: null, ref: 'Timer' })
  timer_id: Types.ObjectId;
}

export const EpisodesSchema = SchemaFactory.createForClass(Episodes);
