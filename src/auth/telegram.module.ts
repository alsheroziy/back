import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TelegramUser, TelegramUserSchema } from './telegram-user.model';
import { TelegramService } from './telegram.service';
import { AuthTelegramMiddleware } from './telegram-auth.middleware'; // <-- E'tibor bering
import { TokenService } from './token.service';
import { TelegramToken, TelegramTokenSchema } from './telegram-tokens.model';
import { User, UserSchema } from 'src/user/user.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TelegramUser.name, schema: TelegramUserSchema },
      { name: TelegramToken.name, schema: TelegramTokenSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  providers: [TelegramService, AuthTelegramMiddleware, TokenService], // <-- Qo‘shildi
  exports: [MongooseModule],
})
export class TelegramModule {}
