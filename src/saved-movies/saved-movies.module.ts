import { Module } from '@nestjs/common';
import { SavedMoviesService } from './saved-movies.service';
import { SavedMoviesController } from './saved-movies.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { SavedMovies, SavedMoviesSchema } from './saved-movies.model';
import { Movies, MoviesSchema } from 'src/movies/movies.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SavedMovies.name, schema: SavedMoviesSchema },
      { name: Movies.name, schema: MoviesSchema },
    ]),
  ],
  controllers: [SavedMoviesController],
  providers: [SavedMoviesService],
})
export class SavedMoviesModule {}
