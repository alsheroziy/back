import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type CountriesDocument = HydratedDocument<Countries>;

@Schema({ timestamps: true, collection: 'countries' })
export class Countries {
  @Prop({
    type: {
      uz: {
        type: String,
        required: true,
        default: '',
      },
      ru: {
        type: String,
        required: true,
        default: '',
      },
    },
    required: true,
  })
  name: {
    uz: {
      name: string;
    };
    ru: {
      name: string;
    };
  };

  @Prop({
    required: true,
  })
  flag: string;

  @Prop({ required: false, default: true })
  status: boolean;
}

export const CountriesSchema = SchemaFactory.createForClass(Countries);
