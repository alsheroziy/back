import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from 'src/user/user.model';

export type OtpDocument = HydratedDocument<Otp>;

@Schema({ timestamps: true, collection: 'otps' })
export class Otp {
  @Prop({ required: true, type: String })
  login: string;

  @Prop({ unique: true, required: true })
  code: string;

  @Prop({ required: true })
  expires_at: Date;
}

export const OtpSchema = SchemaFactory.createForClass(Otp);
