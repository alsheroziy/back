import { Injectable } from '@nestjs/common';
import { NextFunction } from 'grammy';
import { MyContext } from './custom-context.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TelegramUser, TelegramUserDocument } from './telegram-user.model';

@Injectable()
export class AuthTelegramMiddleware {
  constructor(
    @InjectModel(TelegramUser.name)
    private readonly telegramUserModel: Model<TelegramUserDocument>,
  ) {}

  async handle(ctx: MyContext, next: NextFunction) {
    const chat_id = ctx.from?.id;
    if (!chat_id) return;

    let user = await this.telegramUserModel.findOne({ telegram_id: chat_id });
    if (!user) {
      const profile = await ctx.api.getChat(chat_id);
      user = await this.telegramUserModel.create({
        telegram_id: chat_id,
        first_name: ctx.from.first_name ?? '',
        last_name: ctx.from.last_name ?? '',
        username: ctx.from.username ?? '',
        image: profile.photo?.big_file_id ?? null,
      });
    }

    ctx.user = user.toObject();
    await next();
  }
}
