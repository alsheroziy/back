import { Module } from '@nestjs/common';
import { SeriesService } from './series.service';
import { SeriesController } from './series.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Series, SeriesSchema } from './series.model';
import { User, UserSchema } from 'src/user/user.model';
import { Episodes, EpisodesSchema } from 'src/episodes/episodes.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Series.name, schema: SeriesSchema },
      { name: Episodes.name, schema: EpisodesSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [SeriesController],
  providers: [SeriesService],
})
export class SeriesModule {}
