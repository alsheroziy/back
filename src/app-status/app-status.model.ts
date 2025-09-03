// app-status.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class AppStatus extends Document {
  @Prop({ default: false })
  maintenance: boolean;

  @Prop()
  latestVersion: string;

  @Prop({ default: false })
  forceUpdate: boolean;

  @Prop()
  message?: string;
}

export const AppStatusSchema = SchemaFactory.createForClass(AppStatus);
