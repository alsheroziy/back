import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { Episodes } from 'src/episodes/episodes.model';
import { Seasons } from 'src/seasons/seasons.model';

export type TimerDocument = HydratedDocument<Timer>;

@Schema({ timestamps: true, collection: 'timer' })
export class Timer {
  @Prop({
    type: {
      message: {
        type: String,
        required: true,
        default: '',
      },
    },
    required: true,
  })
  uz: {
    message: string;
  };

  @Prop({
    type: {
      message: {
        type: String,
        required: true,
        default: '',
      },
    },
    required: true,
  })
  ru: {
    message: string;
  };

  @Prop({ required: true, type: Types.ObjectId, refPath: 'mediaType' })
  media: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true, type: String })
  mediaType: string;

  @Prop({ required: false, default: null, ref: Seasons.name })
  season_id: mongoose.Schema.Types.ObjectId;

  @Prop({ required: false, default: null, ref: Episodes.name })
  episode_id: mongoose.Schema.Types.ObjectId;

  @Prop({ required: false, default: 0 })
  total_episodes: number;

  @Prop({ required: true, default: 0 })
  time: Date;
}

export const TimerSchema = SchemaFactory.createForClass(Timer);
