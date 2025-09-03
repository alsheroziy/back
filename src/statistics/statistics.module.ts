import { Module } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { StatisticsController } from './statistics.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Movies, MoviesSchema } from 'src/movies/movies.model';
import { Series, SeriesSchema } from 'src/series/series.model';
import { Casts, CastsSchema } from 'src/casts/casts.model';
import { User, UserSchema } from 'src/user/user.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Movies.name, schema: MoviesSchema },
      { name: Series.name, schema: SeriesSchema },
      { name: Casts.name, schema: CastsSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [StatisticsController],
  providers: [StatisticsService],
})
export class StatisticsModule {}
