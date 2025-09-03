import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { Movies } from 'src/movies/movies.model';
import { Series } from 'src/series/series.model';
import { User } from 'src/user/user.model';

export type CommentsDocument = HydratedDocument<Comments>;

@Schema({ timestamps: true, collection: 'comments' })
export class Comments {
  @Prop({ required: true })
  message: string;

  @Prop({ required: true, type: Types.ObjectId, ref: User.name })
  user_id: mongoose.Schema.Types.ObjectId;

  @Prop({ required: false, default: null, type: Types.ObjectId, ref: 'Comments' })
  replied_id: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, refPath: 'mediaType' })
  media: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true, type: String, enum: [Movies.name, Series.name] })
  mediaType: string;

  @Prop({required: false, default: true})
  is_active: boolean;

  @Prop({required: false, default: []})
  likes: Types.ObjectId[]
}

export const CommentsSchema = SchemaFactory.createForClass(Comments);
