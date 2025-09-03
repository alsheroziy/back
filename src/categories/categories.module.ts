import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Categories, CategoriesSchema } from './categories.model';
import { Series, SeriesSchema } from 'src/series/series.model';
import { Movies, MoviesSchema } from 'src/movies/movies.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Categories.name, schema: CategoriesSchema },
      { name: Movies.name, schema: MoviesSchema },
      { name: Series.name, schema: SeriesSchema },
    ]),
  ],
  controllers: [CategoriesController],
  providers: [CategoriesService],
})
export class CategoriesModule {}
