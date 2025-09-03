import { BadRequestException, Injectable } from '@nestjs/common';
import type { CreateEpisodeDto } from './dto/create-episode.dto';
import type { UpdateEpisodeDto } from './dto/update-episode.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Episodes, type EpisodesDocument } from './episodes.model';
import type { Model } from 'mongoose';
import { Series, type SeriesDocument } from 'src/series/series.model';
import { Seasons, type SeasonsDocument } from 'src/seasons/seasons.model';
import { User, type UserDocument } from 'src/user/user.model';
import {
  Subscription,
  type SubscriptionDocument,
} from 'src/subscriptions/subscriptions.model';
import { NotificationsService } from 'src/notifications/notifications.service';
import {
  SavedSeries,
  type SavedSeriesDocument,
} from 'src/saved-series/saved-series.model';

@Injectable()
export class EpisodesService {
  constructor(
    @InjectModel(Seasons.name)
    private readonly seasonModel: Model<SeasonsDocument>,
    @InjectModel(Series.name)
    private readonly seriesModel: Model<SeriesDocument>,
    @InjectModel(Episodes.name)
    private readonly episodesModel: Model<EpisodesDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(Subscription.name)
    private readonly subscriptionModel: Model<SubscriptionDocument>,
    @InjectModel(SavedSeries.name)
    private readonly savedSeriesModel: Model<SavedSeriesDocument>,
    private readonly notificationsService: NotificationsService,
  ) {}
  async create(createEpisodesDto: CreateEpisodeDto) {
    try {
      const series = await this.seriesModel.findOne({
        _id: createEpisodesDto.series_id,
      });
      if (!series) throw new Error('series_not_found');
      const season = await this.seasonModel.findOne({
        _id: createEpisodesDto.season_id,
        series_id: series._id,
      });
      if (!season) throw new Error('season_not_found');
      const existEpisode = await this.episodesModel.findOne({
        series_id: series._id,
        season_id: season._id,
        slug: createEpisodesDto.slug,
      });
      if (existEpisode) throw new Error('episode_already_exist');
      const episodeExistWithEpisodeID = await this.episodesModel.findOne({
        series_id: series._id,
        episode_number: createEpisodesDto.episode_number,
      });
      if (episodeExistWithEpisodeID) {
        const lastEpisodeWithLargeEpisodeNumber = await this.episodesModel
          .find({
            series_id: series._id,
          })
          .sort({ episode_number: -1 })
          .limit(1);

        throw new Error(
          `Ushbu qism raqami bilan allaqachon qism qo'shilgan, oxirgi qism raqami: ${lastEpisodeWithLargeEpisodeNumber[0].episode_number}`,
        );
      }
      delete (createEpisodesDto as any)._id;
      delete (createEpisodesDto as any).ru._id;
      delete (createEpisodesDto as any).uz._id;
      const episodes = await this.episodesModel.create(createEpisodesDto);
      if (!episodes) throw new Error('an_occured_error');

      // Yangi qism qo'shilganda bildirishnoma yuborish
      // Ushbu serialni saqlagan barcha foydalanuvchilarni topish
      const savedSeriesUsers = await this.savedSeriesModel.find({
        media: series._id,
      });

      // Har bir foydalanuvchiga bildirishnoma yuborish
      for (const savedSeries of savedSeriesUsers) {
        await this.notificationsService.sendNewEpisodeNotification(
          savedSeries.user_id.toString(),
          series.uz.title,
          season.uz.title.includes('fasl')
            ? Number.parseInt(season.uz.title.match(/\d+/)![0])
            : 1,
          episodes.episode_number,
          series._id.toString(),
          season._id.toString(),
          episodes._id.toString(),
        );
      }

      return {
        success: true,
        message: 'episodes_created_successfully',
        data: episodes,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error,
      };
    }
  }

  async findAll({ series, season }: { series: string; season: string }) {
    try {
      const existSeries = await this.seriesModel.findOne({ slug: series });
      if (!existSeries) throw new BadRequestException('series_not_found');
      const existSeason = await this.seasonModel.findOne({
        slug: season,
        series_id: existSeries._id,
      });
      if (!existSeason) throw new BadRequestException('season_not_found');
      const episodes = await this.episodesModel
        .find({
          series_id: existSeries._id,
          season_id: existSeason._id,
        })
        .populate('series_id')
        .populate('season_id')
        .sort({
          episode_number: 1, // 1 = ASC (o'sish bo'yicha)
          createdAt: 1, // agar episode_number bir xil bo'lsa, createdAt ishlaydi
        });
      return {
        success: true,
        message: 'episodes_fetch_successfully',
        data: episodes,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error,
      };
    }
  }
  async findBySeries({ series }: { series: string }) {
    try {
      const existSeries = await this.seriesModel.findOne({ slug: series });
      if (!existSeries) throw new BadRequestException('series_not_found');
      const episodes = await this.episodesModel
        .find({
          series_id: existSeries._id,
        })
        .populate('series_id')
        .populate('season_id')
        .sort({
          episode_number: 1, // 1 = ASC (o'sish bo'yicha)
          createdAt: 1, // agar episode_number bir xil bo'lsa, createdAt ishlaydi
        });
      return {
        success: true,
        message: 'episodes_fetch_successfully',
        data: episodes,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error,
      };
    }
  }

  async findOne(
    slug: string,
    series: string,
    season_slug: string,
    user: UserDocument,
  ) {
    try {
      let subscribed = true;
      const user_subscription = await this.userModel
        .findById(user._id)
        .populate('subscription');

      if (user_subscription?.subscription) {
        const subscription = await this.subscriptionModel
          .findById(user_subscription.subscription)
          .populate('plan_id');
        if (!subscription) subscribed = false;

        const now = new Date().getTime();
        if (Number(subscription?.end_date) < now) subscribed = false;
      } else {
        subscribed = false;
      }
      const existSeries = await this.seriesModel.findOne({ slug: series });
      if (!existSeries) throw new BadRequestException('series_not_found');
      const season = await this.seasonModel.findOne({
        slug: season_slug,
        series_id: existSeries._id,
      });
      if (!season) throw new BadRequestException('season_not_found');
      const episodeType = await this.episodesModel
        .findOne({ slug, series_id: existSeries?._id, season_id: season._id })
        .select('type');
      if (!episodeType) throw new BadRequestException('episode_not_found');
      const episode = await this.episodesModel
        .findOne({ slug, series_id: existSeries?._id, season_id: season._id })
        .select(!subscribed && episodeType?.type === 'paid' ? '-video' : '')
        .populate('series_id')
        .populate('season_id')
        .populate({
          path: 'timer_id',
          select: 'time',
        });
      if (!episode) throw new BadRequestException('episode_not_found');
      if (!subscribed && episode?.type === 'paid') {
        episode.video = null as any;
      }
      return {
        success: true,
        message: 'Episodes fetched successfully',
        data: episode,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error,
      };
    }
  }

  async update(
    slug: string,
    series: string,
    season: string,
    updateEpisodesDto: UpdateEpisodeDto,
  ) {
    try {
      console.log(updateEpisodesDto);
      const existSeries = await this.seriesModel.findOne({ slug: series });
      if (!existSeries) throw new Error('series_not_found');
      const existSeason = await this.seasonModel.findOne({
        slug: season,
        series_id: existSeries._id,
      });
      if (!existSeason) throw new Error('season_not_found');
      const episodes = await this.episodesModel.findOne({
        slug,
        series_id: existSeries._id,
        season_id: existSeason._id,
      });
      if (!episodes) throw new Error('episodes_not_found');
      const updated = await this.episodesModel.findOneAndUpdate(
        { slug, series_id: existSeries._id, season_id: existSeason._id },
        updateEpisodesDto,
      );
      return {
        success: true,
        message: 'episodes_updated_successfully',
        data: updated,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error,
      };
    }
  }

  async remove(slug: string) {
    try {
      const episodes = await this.episodesModel.findByIdAndDelete(slug);
      if (!episodes) throw new BadRequestException('episodes_not_found');
      return {
        success: true,
        message: 'episodes_deleted_successfully',
        data: episodes,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error,
      };
    }
  }
}
