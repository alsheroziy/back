import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Bot } from 'grammy';
import { AuthTelegramMiddleware } from './telegram-auth.middleware';
import { MyContext } from './custom-context.interface';
import { TokenService } from './token.service';
import { InjectModel } from '@nestjs/mongoose';
import { TelegramToken, TelegramTokenDocument } from './telegram-tokens.model';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/user/user.model';
import { TelegramUser, TelegramUserDocument } from './telegram-user.model';
import { generateUserId } from 'src/modules/generate-user-id.module';

@Injectable()
export class TelegramService implements OnModuleInit {
  private bot: Bot;

  constructor(
    private readonly configService: ConfigService,
    private readonly authMiddleware: AuthTelegramMiddleware,
    private readonly tokenService: TokenService,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(TelegramToken.name)
    private readonly telegramTokenModel: Model<TelegramTokenDocument>,
    @InjectModel(TelegramUser.name)
    private readonly telegramUserModel: Model<TelegramUserDocument>,
  ) {}

  onModuleInit() {
    try {
      const token = this.configService.get<string>('BOT_TOKEN');
      if (!token) throw new Error('BOT_TOKEN topilmadi!');

      this.bot = new Bot<MyContext>(token);

      this.bot.use((ctx, next) =>
        this.authMiddleware.handle(ctx as MyContext, next),
      );

      this.bot.command('start', (ctx) => {
        const user = (ctx as MyContext).user;

        // if (!user?.phone_number) {
        ctx.reply(
          'Iltimos pastdagi "📞 Telefon raqamni ulashish" tugmasini bosib telefon raqamingizni ulashing',
          {
            reply_markup: {
              keyboard: [
                [
                  {
                    text: '📞 Telefon raqamni ulashish',
                    request_contact: true,
                  },
                ],
              ],
              resize_keyboard: true,
            },
          },
        );
        // }
      });

      this.bot.on(':contact', async (ctx) => {
        const user = (ctx as MyContext).user;
        const from_id = ctx.from?.id;
        const phone_number = ctx.message?.contact.phone_number;
        const contact_telegram_id = ctx.message?.contact.user_id;

        if (from_id !== contact_telegram_id)
          return ctx.reply(
            "Ushbu telefon raqam sizga tegishli emas, tilimos pastdagi '📞 Telefon raqamni ulashish' tugmasini bosib telefon raqamingizni ulashing",
            {
              reply_markup: {
                keyboard: [
                  [
                    {
                      text: '📞 Telefon raqamni ulashish',
                      request_contact: true,
                    },
                  ],
                ],
                resize_keyboard: true,
              },
            },
          );

        if (user?.token) {
          const token = await this.telegramTokenModel.findOne({
            _id: user.token,
          });
          await this.telegramUserModel.updateOne(
            { telegram_id: from_id },
            {
              token: token?._id,
              phone_number,
            },
            { new: true },
          );
          return ctx.reply(
            `ilovaga kirish uchun link: https://anibla.uz/auth/token/${token?.token}`,
            {
              reply_markup: {
                remove_keyboard: true,
              },
            },
          );
        }

        const existUser = await this.userModel.findOne({
          phone_number: phone_number,
        });

        if (existUser) {
          let tkn = '';
          if (!existUser.telegram_token) {
            const token = this.tokenService.generate();

            const createToken = await this.telegramTokenModel.create({
              token,
              activated: true,
              linked_user: existUser._id,
            });

            await this.userModel.updateOne(
              { _id: existUser._id },
              {
                phone_number: phone_number,
                telegram_token: createToken._id,
              },
              { new: true },
            );
            tkn = token;

            await this.telegramUserModel.updateOne(
              { telegram_id: from_id, phone_number },
              {
                token: createToken?._id,
                phone_number,
              },
              { new: true },
            );
          } else {
            const token = await this.telegramTokenModel.findOne({
              _id: existUser.telegram_token,
            });
            tkn = token?.token || '';
            await this.telegramUserModel.updateOne(
              { telegram_id: from_id, phone_number },
              {
                token: token?._id,
                phone_number,
              },
              { new: true },
            );
          }
          return ctx.reply(
            `Telegram profilingiz hisobingizga muvaffaqqiyatli ulandi, ilovaga kirish uchun link: https://anibla.uz/auth/token/${tkn}`,
            {
              reply_markup: {
                remove_keyboard: true,
              },
            },
          );
        }

        let unique_id = generateUserId();

        const exist_user_with_unique_id = await this.userModel.findOne({
          unique_id,
        });

        while (exist_user_with_unique_id) {
          unique_id = generateUserId();
        }

        const createUser = await this.userModel.create({
          phone_number,
          unique_id,
          role: 'USER',
        });
        const createdToken = await this.tokenService.generate();
        const createToken = await this.telegramTokenModel.create({
          token: createdToken,
          activated: true,
          linked_user: createUser._id,
        });

        await this.userModel.updateOne(
          { _id: createUser._id },
          {
            phone_number: phone_number,
            telegram_token: createToken._id,
          },
          { new: true },
        );

        await this.telegramUserModel.updateOne(
          { telegram_id: from_id },
          {
            telegram_id: from_id,
            phone_number: phone_number,
            token: createToken._id,
          },
          { new: true },
        );
        ctx.reply(
          `Telefon raqamingiz ulandi, ilovaga kirish uchun link: https://anibla.uz/auth/token/${createdToken}`,
          {
            reply_markup: {
              remove_keyboard: true,
            },
          },
        );
      });
    } catch (error) {
      console.error(error);
    }

    this.bot
      .start()
      .then(() => console.log('Bot ishga tushdi'))
      .catch((err) => console.error('Botda xatolik:', err));
  }

  getBot() {
    return this.bot;
  }
}
