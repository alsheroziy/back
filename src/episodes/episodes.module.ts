import { Module } from '@nestjs/common';
import { EpisodesService } from './episodes.service';
import { EpisodesController } from './episodes.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Episodes, EpisodesSchema } from './episodes.model';
import { Series, SeriesSchema } from 'src/series/series.model';
import { Seasons, SeasonsSchema } from 'src/seasons/seasons.model';
import { User, UserSchema } from 'src/user/user.model';
import {
  Subscription,
  SubscriptionSchema,
} from 'src/subscriptions/subscriptions.model';
import { NotificationsModule } from 'src/notifications/notifications.module';
import {
  SavedSeries,
  SavedSeriesSchema,
} from 'src/saved-series/saved-series.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Seasons.name, schema: SeasonsSchema },
      { name: Series.name, schema: SeriesSchema },
      { name: Episodes.name, schema: EpisodesSchema },
      { name: User.name, schema: UserSchema },
      { name: Subscription.name, schema: SubscriptionSchema },
      { name: SavedSeries.name, schema: SavedSeriesSchema },
    ]),
    NotificationsModule,
  ],
  controllers: [EpisodesController],
  providers: [EpisodesService],
})
export class EpisodesModule {}
