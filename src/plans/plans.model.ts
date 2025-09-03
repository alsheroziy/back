import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type PlanDocument = HydratedDocument<Plan>;

@Schema({ timestamps: true, collection: 'plans' })
export class Plan {
  @Prop({
    type: {
      uz: { type: String, required: true, default: '' },
      ru: { type: String, required: true, default: '' },
    },
    required: true,
  })
  name: {
    uz: string;
    ru: string;
  };

  @Prop({ required: true })
  price: number;

  @Prop({ required: false, default: 1 })
  time: number;
}

export const PlanSchema = SchemaFactory.createForClass(Plan);
