import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class History extends Document {
  @Prop()
  ip: string;

  @Prop()
  route: string;

  @Prop()
  platform: 'mobile' | 'web';

  @Prop()
  appVersion: string;

  @Prop()
  method: string;

  @Prop({ type: Object })
  query: Record<string, any>;

  @Prop({ type: Object })
  body: Record<string, any>;

  @Prop({ type: Object })
  headers: Record<string, any>;
}

export const HistorySchema = SchemaFactory.createForClass(History);
