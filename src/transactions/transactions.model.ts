import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from 'src/user/user.model';

export type TransactionDocument = HydratedDocument<Transaction>;

@Schema({ timestamps: true, collection: 'transactions' })
export class Transaction {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  user_id: User;

  @Prop({ required: true, unique: true })
  transaction_id: string;

  @Prop({ required: true })
  state: number;

  @Prop({ required: true })
  amount: number;

  @Prop({ default: Date.now() })
  create_time: number;

  @Prop({ default: 0 })
  perform_time: number;

  @Prop({ default: 0 })
  cancel_time: number;

  @Prop({ required: false, default: null })
  reason: number;

  @Prop()
  provider: string;

  @Prop()
  prepare_id: string;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
