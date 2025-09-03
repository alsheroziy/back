import { Module } from '@nestjs/common';
import { SavedSeriesService } from './saved-series.service';
import { SavedSeriesController } from './saved-series.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { SavedSeries, SavedSeriesSchema } from './saved-series.model';
import { Series, SeriesSchema } from 'src/series/series.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SavedSeries.name, schema: SavedSeriesSchema },
      { name: Series.name, schema: SeriesSchema },
    ]),
  ],
  controllers: [SavedSeriesController],
  providers: [SavedSeriesService],
})
export class SavedSeriesModule {}
