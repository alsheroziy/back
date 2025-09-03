import {
  type MiddlewareConsumer,
  Module,
  type NestModule,
} from '@nestjs/common';
import { UserModule } from './user/user.module';
import { SeriesModule } from './series/series.module';
import { SeasonsModule } from './seasons/seasons.module';
import { EpisodesModule } from './episodes/episodes.module';
import { MoviesModule } from './movies/movies.module';
import { SavedSeriesModule } from './saved-series/saved-series.module';
import { SavedMoviesModule } from './saved-movies/saved-movies.module';
import { CategoriesModule } from './categories/categories.module';
import { GenresModule } from './genres/genres.module';
import { CastsModule } from './casts/casts.module';
import { PlansModule } from './plans/plans.module';
import { TransactionsModule } from './transactions/transactions.module';
import { PaymentProvidersModule } from './payment-providers/payment-providers.module';
import { NewsModule } from './news/news.module';
import { RatingsModule } from './ratings/ratings.module';
import { CommentsModule } from './comments/comments.module';
import { CountriesModule } from './countries/countries.module';
import { ViewsModule } from './views/views.module';
import { SessionsModule } from './sessions/sessions.module';
import { SlidersModule } from './sliders/sliders.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getMongoDBConfig } from './config/mongoose.config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { PaymentModule } from './payments/payment.module';
import { UploadModule } from './upload/upload.module';
import { StatisticsModule } from './statistics/statistics.module';
import { TimerModule } from './timer/timer.module';
import { AvatarModule } from './avatars/avatars.module';
import { ScheduleModule } from '@nestjs/schedule';
import { GeoLocationMiddleware } from 'src/middleware/geo-location.middleware';
import { HistoryModule } from './history/history.module';
import { HistoryMiddleware } from 'src/middleware/history.middleware';
import { AppStatusModule } from './app-status/app-status.module';
import { NotificationsModule } from './notifications/notifications.module';
import { FirebaseModule } from './firebase/firebase.module';
import { CheckCountryModule } from './check-country/check-country.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getMongoDBConfig,
    }),
    UserModule,
    SubscriptionsModule,
    SeriesModule,
    SeasonsModule,
    EpisodesModule,
    MoviesModule,
    SavedSeriesModule,
    SavedMoviesModule,
    CategoriesModule,
    GenresModule,
    CastsModule,
    PlansModule,
    TransactionsModule,
    PaymentProvidersModule,
    NewsModule,
    RatingsModule,
    CommentsModule,
    CountriesModule,
    ViewsModule,
    SessionsModule,
    SlidersModule,
    AuthModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    PaymentModule,
    UploadModule,
    StatisticsModule,
    TimerModule,
    AvatarModule,
    HistoryModule,
    TimerModule,
    AppStatusModule,
    FirebaseModule,
    NotificationsModule,
    CheckCountryModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(GeoLocationMiddleware).forRoutes('*');
    consumer.apply(HistoryMiddleware).forRoutes('*'); // barcha route'larda ishlaydi
  }
}
