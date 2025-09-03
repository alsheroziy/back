import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { getJwtConfig } from 'src/config/jwt.config';
import { User, UserSchema } from 'src/user/user.model';
import { Session, SessionSchema } from './sessions.model';
import { JwtStrategy } from './strategies/jwt.strategy';
import { Otp, OtpSchema } from './otp.model';
import { PassportModule } from '@nestjs/passport';
import { GoogleStrategy } from './strategies/google.strategy';
import { TelegramService } from './telegram.service';
import { TokenService } from './token.service';
import { TelegramToken, TelegramTokenSchema } from './telegram-tokens.model';
import { TelegramModule } from './telegram.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: TelegramToken.name, schema: TelegramTokenSchema },
      { name: Session.name, schema: SessionSchema },
      { name: Otp.name, schema: OtpSchema },
    ]),
    PassportModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getJwtConfig,
    }),
    TelegramModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, GoogleStrategy, TokenService],
})
export class AuthModule {}
