import { Module } from '@nestjs/common';
import { SeasonsService } from './seasons.service';
import { SeasonsController } from './seasons.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Seasons, SeasonsSchema } from './seasons.model';
import { Series, SeriesSchema } from 'src/series/series.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Seasons.name, schema: SeasonsSchema },
      { name: Series.name, schema: SeriesSchema },
    ]),
  ],
  controllers: [SeasonsController],
  providers: [SeasonsService],
})
export class SeasonsModule {}
