import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { Casts } from 'src/casts/casts.model';
import { Categories } from 'src/categories/categories.model';
import { Countries } from 'src/countries/countries.model';
import { Genres } from 'src/genres/genres.model';
import { Series } from 'src/series/series.model';

export type SeasonsDocument = HydratedDocument<Seasons>;

@Schema({ timestamps: true, collection: 'seasons' })
export class Seasons {
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
    description: string;
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
    description: string;
  };

  @Prop({
    required: true,
  })
  slug: string;
  @Prop({ required: true, ref: Series.name })
  series_id: mongoose.Schema.Types.ObjectId;
}

export const SeasonsSchema = SchemaFactory.createForClass(Seasons);
