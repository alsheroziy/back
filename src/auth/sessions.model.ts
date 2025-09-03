import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from 'src/user/user.model';

export type SessionDocument = HydratedDocument<Session>;

@Schema({ timestamps: true, collection: 'sessions' })
export class Session {
  @Prop({ required: true, type: Types.ObjectId, ref: User.name })
  user_id: User;

  @Prop({ unique: true, required: true })
  token_id: string;

  @Prop({ required: true })
  device: string;

  @Prop({ required: true })
  ip: string;

  @Prop({ required: true })
  last_login: Date;

  @Prop({ required: true })
  last_login_ip: string;
}

export const SessionSchema = SchemaFactory.createForClass(Session);
