import { Module } from '@nestjs/common';
import { TimerService } from './timer.service';
import { TimerController } from './timer.controller';
import { Series, SeriesSchema } from 'src/series/series.model';
import { MongooseModule } from '@nestjs/mongoose';
import { Movies, MoviesSchema } from 'src/movies/movies.model';
import { Timer, TimerSchema } from './timer.model';
import { TimerCronService } from './timer-cron.service';
import { Episodes, EpisodesSchema } from 'src/episodes/episodes.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Timer.name, schema: TimerSchema },
      { name: Series.name, schema: SeriesSchema },
      { name: Episodes.name, schema: EpisodesSchema },
      { name: Movies.name, schema: MoviesSchema },
    ]),
  ],
  controllers: [TimerController],
  providers: [TimerService, TimerCronService],
})
export class TimerModule {}
