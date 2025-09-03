import { Module } from '@nestjs/common';
import { SlidersService } from './sliders.service';
import { SlidersController } from './sliders.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Movies, MoviesSchema } from 'src/movies/movies.model';
import { Series, SeriesSchema } from 'src/series/series.model';
import { Sliders, SlidersSchema } from './sliders.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      {name: Sliders.name, schema: SlidersSchema},
      {name: Movies.name, schema: MoviesSchema},
      {name: Series.name, schema: SeriesSchema}
    ])
  ],
  controllers: [SlidersController],
  providers: [SlidersService],
})
export class SlidersModule {}
