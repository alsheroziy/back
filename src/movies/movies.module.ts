import { Module } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { MoviesController } from './movies.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Movies, MoviesSchema } from './movies.model';
import { User, UserSchema } from 'src/user/user.model';
import {
  Subscription,
  SubscriptionSchema,
} from 'src/subscriptions/subscriptions.model';
import { Timer, TimerSchema } from 'src/timer/timer.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Movies.name, schema: MoviesSchema },
      { name: User.name, schema: UserSchema },
      { name: Subscription.name, schema: SubscriptionSchema },
      { name: Timer.name, schema: TimerSchema },
    ]),
  ],
  controllers: [MoviesController],
  providers: [MoviesService],
})
export class MoviesModule {}
