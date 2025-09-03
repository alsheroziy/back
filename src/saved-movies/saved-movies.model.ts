import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Movies } from 'src/movies/movies.model';

export type SavedMoviesDocument = HydratedDocument<SavedMovies>;

@Schema({ timestamps: true, collection: 'saved-movies' })
export class SavedMovies {
  @Prop({ required: true })
  user_id: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: Movies.name })
  media: Types.ObjectId;

  @Prop({ required: false, default: null })
  last_visited: Date;
}

export const SavedMoviesSchema = SchemaFactory.createForClass(SavedMovies);
