import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type CategoriesDocument = HydratedDocument<Categories>;

@Schema({ timestamps: true, collection: 'categories' })
export class Categories {
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
    unique: true,
    required: true,
  })
  slug: string;

  @Prop({ required: false, default: true })
  status: boolean;
}

export const CategoriesSchema = SchemaFactory.createForClass(Categories);
