import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Movies, MoviesSchema } from 'src/movies/movies.model';
import { Series, SeriesSchema } from 'src/series/series.model';
import { Comments, CommentsSchema } from './comments.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Comments.name, schema: CommentsSchema },
      { name: Series.name, schema: SeriesSchema },
      { name: Movies.name, schema: MoviesSchema },
    ]),
  ],
  controllers: [CommentsController],
  providers: [CommentsService],
})
export class CommentsModule {}
