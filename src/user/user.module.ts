import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './user.model';
import {
  Transaction,
  TransactionSchema,
} from 'src/transactions/transactions.model';
import {
  Subscription,
  SubscriptionSchema,
} from 'src/subscriptions/subscriptions.model';
import { Session, SessionSchema } from 'src/auth/sessions.model';
import {
  SavedSeries,
  SavedSeriesSchema,
} from 'src/saved-series/saved-series.model';
import {
  SavedMovies,
  SavedMoviesSchema,
} from 'src/saved-movies/saved-movies.model';
import { Winner, WinnerSchema } from './winner.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Winner.name, schema: WinnerSchema },
      { name: Transaction.name, schema: TransactionSchema },
      { name: Subscription.name, schema: SubscriptionSchema },
      { name: Session.name, schema: SessionSchema },
      { name: SavedSeries.name, schema: SavedSeriesSchema },
      { name: SavedMovies.name, schema: SavedMoviesSchema },
    ]),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
