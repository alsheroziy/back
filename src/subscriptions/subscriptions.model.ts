import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Plan } from 'src/plans/plans.model';
import { User } from 'src/user/user.model';

console.log(User);

export type SubscriptionDocument = HydratedDocument<Subscription>;

@Schema({ timestamps: true, collection: 'subscriptions' })
export class Subscription {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  user_id: User;

  @Prop({ required: true, type: Types.ObjectId, ref: Plan.name })
  plan_id: Plan;

  @Prop({ required: true, default: Date.now() })
  start_date: Date;

  @Prop({ required: true })
  end_date: Date;
}

export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);
