import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { RoleUser } from './user.interface';
import { Transaction } from 'src/transactions/transactions.model';
import { Subscription } from 'src/subscriptions/subscriptions.model';
import { Movies } from 'src/movies/movies.model';
import { Series } from 'src/series/series.model';
import { Type } from 'class-transformer';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true, collection: 'users' })
export class User {
  @Prop({ required: false, default: '' })
  name: string;

  @Prop({ required: true })
  unique_id: number;

  @Prop({ sparse: true, required: false, default: null })
  email: string;

  @Prop({ unique: true, sparse: true, required: false, default: null })
  phone_number: number;

  @Prop({
    unique: false,
    required: false,
    default: '/uploads/profile_not_found.png',
  })
  image: string;

  @Prop({ required: false, default: 0 })
  balance: number;

  @Prop({ type: Types.ObjectId, ref: Transaction.name, default: [] })
  transactions: Transaction[];

  @Prop({
    required: false,
    type: Types.ObjectId,
    ref: Subscription.name,
    default: null,
  })
  subscription: Subscription;

  @Prop({ required: false, default: 'USER', enum: ['USER', 'ADMIN'] })
  role: RoleUser;

  @Prop({ required: false, default: false })
  activated: boolean;

  @Prop({
    required: false,
    type: String,
    enum: [Movies.name, Series.name],
    default: 'Movies',
  })
  last_anime_type: string;

  @Prop({
    required: false,
    type: Types.ObjectId,
    refPath: 'last_anime_type',
    default: null,
  })
  last_anime: Types.ObjectId;
  @Prop({
    required: false,
    type: Boolean,
    default: false,
  })
  created_by_admin: boolean;

  @Prop({
    required: false,
    type: Types.ObjectId,
    default: null,
  })
  telegram_token: Types.ObjectId;
}

export const UserSchema = SchemaFactory.createForClass(User);
