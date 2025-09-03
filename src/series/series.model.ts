import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { Casts } from 'src/casts/casts.model';
import { Categories } from 'src/categories/categories.model';
import { Countries } from 'src/countries/countries.model';
import { Genres } from 'src/genres/genres.model';

export type SeriesDocument = HydratedDocument<Series>;

@Schema({ timestamps: true, collection: 'series' })
export class Series {
  @Prop({
    type: {
      title: {
        type: String,
        required: true,
        default: '',
      },
      description: {
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
      description: {
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
    unique: true,
    required: true,
  })
  slug: string;
  @Prop({ required: false, default: null, ref: Countries.name })
  country: mongoose.Schema.Types.ObjectId;
  @Prop({ required: false, default: null, ref: Casts.name })
  studio: mongoose.Schema.Types.ObjectId;
  @Prop({ required: false, default: null, ref: Casts.name })
  director: mongoose.Schema.Types.ObjectId;
  @Prop({ required: false, default: [], ref: Casts.name })
  creators: [mongoose.Schema.Types.ObjectId];
  @Prop({ required: false, default: [], ref: Genres.name })
  genres: [mongoose.Schema.Types.ObjectId];
  @Prop({ required: false, default: [], ref: Categories.name })
  categories: [mongoose.Schema.Types.ObjectId];
  @Prop({ required: true })
  published_year: number;
  @Prop({ required: true })
  thumbnail: string;
  @Prop({ required: true })
  cover: string;
  @Prop({ required: false, default: [] })
  images: [string];
  @Prop({ required: false, default: null })
  trailer: string;
  @Prop({ required: true })
  age: number;
  @Prop({ required: false, default: 0 })
  total_episodes: number;

  @Prop({ required: false, default: true })
  for_only_mdh: boolean;
}

export const SeriesSchema = SchemaFactory.createForClass(Series);
