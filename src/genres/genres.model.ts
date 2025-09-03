import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type GenresDocument = HydratedDocument<Genres>;

@Schema({ timestamps: true, collection: 'genres' })
export class Genres {
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

export const GenresSchema = SchemaFactory.createForClass(Genres);
