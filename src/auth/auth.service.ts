import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from 'src/user/user.model';
import { Model } from 'mongoose';
import { generateUserId } from 'src/modules/generate-user-id.module';
import { compare, genSalt, hash } from 'bcryptjs';
import { TokenDto } from './dto/token.dto';
import { JwtService } from '@nestjs/jwt';
import { v4 } from 'uuid';
import { Session, SessionDocument } from './sessions.model';
import { Request } from 'express';
import { Otp, OtpDocument } from './otp.model';
import { sendSms } from 'src/modules/send-sms.module';
import * as crypto from 'crypto';
import { TokenService } from './token.service';
import { isArrayBufferView } from 'util/types';
import { TelegramToken, TelegramTokenDocument } from './telegram-tokens.model';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Session.name)
    private readonly sessionModel: Model<SessionDocument>,
    @InjectModel(Otp.name) private readonly otpModel: Model<OtpDocument>,
    @InjectModel(TelegramToken.name)
    private readonly telegramTokenModel: Model<TelegramTokenDocument>,
    private readonly jwtService: JwtService,
    private readonly tokenService: TokenService,
  ) {}
  async register(dto: RegisterDto, req: Request) {
    try {
      const user_agent =
        (req.headers['x-device'] as string) || req.headers['user-agent'];
      const device = user_agent ? user_agent : 'unknown';
      const ip =
        req.headers['x-forwarded-for']?.toString() ||
        req.socket.remoteAddress ||
        req.ip;
      const exist_user = await this.userModel.findOne({
        phone_number: dto.phone_number,
      });
      console.log(exist_user);
      if (exist_user && exist_user.activated && exist_user.name)
        throw new BadRequestException('user_exist');

      if (
        exist_user &&
        exist_user.activated &&
        !exist_user.name &&
        // @ts-ignore
        exist_user.createdAt &&
        // @ts-ignore
        new Date() < new Date(new Date(exist_user.createdAt).getTime() + 300000)
      ) {
        await this.userModel.deleteOne({ phone_number: dto.phone_number });

        let unique_id = generateUserId();

        let exist_user_with_unique_id = await this.userModel.findOne({
          unique_id,
        });

        while (exist_user_with_unique_id) {
          unique_id = generateUserId();
          exist_user_with_unique_id = await this.userModel.findOne({
            unique_id,
          });
        }

        const credentials = {
          ...dto,
          activated: true,
          balance: 0,
          transactions: [],
          unique_id,
          role: 'USER',
          name: dto.name || '+' + dto.phone_number,
        };
        const user = await this.userModel.create(credentials);

        const token = await this.issueTokenPair(
          String(user._id),
          device,
          ip || 'not defined',
        );

        return { user: this.getUserField(user), token };
      } else {
        throw new BadRequestException('first_register_otp');
      }
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
  async registerMobileGoogle(dto: RegisterDto, req: Request) {
    try {
      const user_agent =
        (req.headers['x-device'] as string) || req.headers['user-agent'];
      const device = user_agent ? user_agent : 'unknown';
      const ip =
        req.headers['x-forwarded-for']?.toString() ||
        req.socket.remoteAddress ||
        req.ip;
      const exist_user = await this.userModel.findOne({
        email: dto.email,
      });
      // if (exist_user && exist_user.activated && exist_user.name)
      //   throw new BadRequestException('user_exist');

      let unique_id = generateUserId();

      const exist_user_with_unique_id = await this.userModel.findOne({
        unique_id,
      });

      while (exist_user_with_unique_id) {
        unique_id = generateUserId();
      }

      const credentials = {
        ...dto,
        activated: true,
        balance: 0,
        transactions: [],
        unique_id,
        role: 'USER',
        name: dto.name || '+' + dto.email,
      };
      let user: any = null;
      if (!exist_user) {
        user = await this.userModel.create(credentials);
      } else {
        user = exist_user;
      }

      const token = await this.issueTokenPair(
        String(user._id),
        device,
        ip || 'not defined',
      );

      return { user: this.getUserField(user), token };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async registerOtp(dto: { phone_number: string; hash: string }) {
    if (!dto.phone_number)
      throw new BadRequestException('phone_number_is_riquired');

    const exist_user = await this.userModel.findOne({
      phone_number: +dto.phone_number,
    });

    if (exist_user && exist_user.activated)
      throw new BadRequestException('user_exist');

    await this.userModel.deleteOne({ phone_number: +dto.phone_number });

    let unique_id = generateUserId();

    const exist_user_with_unique_id = await this.userModel.findOne({
      unique_id,
    });

    while (exist_user_with_unique_id) {
      unique_id = generateUserId();
    }

    const create_user = await this.userModel.create({
      phone_number: dto.phone_number,
      unique_id,
      role: 'USER',
    });

    if (!create_user) {
      throw new BadRequestException('user_not_created');
    }

    const code = Math.floor(1000 + Math.random() * 9000);

    const message = `<#> amediatv ga kirish uchun kod: ${code}\n${dto.hash}`;

    const sms = await sendSms(create_user.phone_number, message);
    if (sms?.success) {
      await this.otpModel.deleteMany({
        login: dto.phone_number,
      });
      const otp = await this.otpModel.create({
        login: dto.phone_number,
        code,
        expires_at: new Date(Date.now() + 5 * 60 * 1000),
      });
      if (!otp) throw new BadRequestException('otp_create_error');

      return { login: dto.phone_number };
    } else {
      if (sms?.error) return sms?.error;
      throw new BadRequestException(sms?.message);
    }
  }

  async login(dto: LoginDto) {
    try {
      let existUser: UserDocument | null = null;
      if (dto.phone_number) {
        existUser = (await this.userModel.findOne({
          phone_number: dto.phone_number,
        })) as UserDocument;
        if (!existUser) throw new NotFoundException('user_not_found');
      }

      if (!existUser) throw new NotFoundException('user_not_found');

      if (!existUser.activated) throw new BadRequestException('user_not_found');

      const code = Math.floor(1000 + Math.random() * 9000);

      const message = `<#> amediatv ga kirish uchun kod: ${code}\n${dto.hash}`;

      const sms = await sendSms(existUser.phone_number, message);
      if (sms?.success) {
        await this.otpModel.deleteMany({
          login: dto.phone_number,
        });
        const otp = await this.otpModel.create({
          login: dto.phone_number,
          code,
          expires_at: new Date(Date.now() + 5 * 60 * 1000),
        });
        if (!otp) throw new BadRequestException('otp_create_error');

        return { login: dto.phone_number };
      } else {
        if (sms?.error) return sms?.error;
        throw new BadRequestException(sms?.message);
      }
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async signIn(
    user: { email: string },
    req: Request,
  ): Promise<
    | {
        user: UserDocument;
        token: { accessToken: string; refreshToken: string };
      }
    | undefined
  > {
    const user_agent =
      (req.headers['x-device'] as string) || req.headers['user-agent'];
    const device = user_agent ? user_agent : 'unknown';
    const ip =
      req.headers['x-forwarded-for']?.toString() ||
      req.socket.remoteAddress ||
      req.ip;
    console.log(user);
    if (!user) {
      throw new BadRequestException('Unauthenticated');
    }

    let userExists = await this.userModel.findOne({ email: user.email });

    if (!userExists) {
      const credentials = {
        ...user,
        activated: true,
        balance: 0,
        transactions: [],
        unique_id: generateUserId(),
        role: 'USER',
      };
      userExists = await this.userModel.create(credentials);
      if (userExists) {
        const token = await this.issueTokenPair(
          String(userExists._id),
          device,
          ip || 'not defined',
        );
        return {
          user: this.getUserField(userExists) as UserDocument,
          token,
        };
      }
    }
  }

  async checkTelegramAuth(data: any) {
    const authData = Object.entries(data)
      .filter(([key]) => key !== 'hash')
      .map(([key, value]) => `${key}=${value}`)
      .sort()
      .join('\n');
    const TELEGRAM_BOT_TOKEN = '7780355480:AAERPnlG7JB7MkC70ugtq0kBSICcgpS2SuE';
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(TELEGRAM_BOT_TOKEN)
      .digest();

    const hash = crypto
      .createHmac('sha256', secretKey)
      .update(authData)
      .digest('hex');

    return hash === data.hash;
  }

  async verify(dto: { login: string; code: number }, req: Request) {
    const user_agent =
      (req.headers['x-device'] as string) || req.headers['user-agent'];
    const device = user_agent ? user_agent : 'unknown';
    const ip =
      req.headers['x-forwarded-for']?.toString() ||
      req.socket.remoteAddress ||
      req.ip;
    const { login, code } = dto;
    try {
      const otp = await this.otpModel.findOne({
        login,
      });
      const userFilter = {
        phone_number: +login,
      };
      console.log(userFilter);
      const user = await this.userModel.findOne(userFilter);
      if (!user) throw new NotFoundException('user_not_found');
      if (!user.activated) {
        if (otp) {
          if (otp.code === code + '') {
            await this.otpModel.findByIdAndDelete(otp._id);
            if (new Date(otp.expires_at) < new Date())
              throw new BadRequestException('otp_expired');

            await this.userModel.findOneAndUpdate(userFilter, {
              activated: true,
            });
            return {
              message: 'otp_verified',
              data: true,
            };
          } else {
            throw new BadRequestException('invalid_code');
          }
        } else {
          throw new BadRequestException('otp_not_found');
        }
      }
      if (otp) {
        if (otp.code === code + '') {
          await this.otpModel.findByIdAndDelete(otp._id);
          if (new Date(otp.expires_at) < new Date())
            throw new BadRequestException('otp_expired');
          const token = await this.issueTokenPair(
            String(user._id),
            device,
            ip || 'not defined',
          );

          return { user: this.getUserField(user), token };
        } else {
          throw new BadRequestException('invalid_code');
        }
      } else {
        throw new BadRequestException('otp_not_found');
      }
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error.message);
    }
  }

  async checkToken(token: string, req: Request) {
    const user_agent =
      (req.headers['x-device'] as string) || req.headers['user-agent'];
    const device = user_agent ? user_agent : 'unknown';
    const ip =
      req.headers['x-forwarded-for']?.toString() ||
      req.socket.remoteAddress ||
      req.ip;

    const existToken = await this.telegramTokenModel.findOne({
      token,
    });
    if (!existToken) throw new UnauthorizedException('token_does_not_exist');

    if (!existToken.activated)
      throw new UnauthorizedException('token_not_activated');

    const user = await this.userModel.findById(existToken.linked_user);
    if (!user) throw new UnauthorizedException('user_not_found');

    const tokenPair = await this.issueTokenPair(
      String(user._id),
      device,
      ip || 'not defined',
    );
    return {
      user: this.getUserField(user),
      token: tokenPair,
    };
  }

  // custom telegram login
  async loginWithCustomTelegram() {
    let token = this.tokenService.generate();

    let existToken = await this.telegramTokenModel.findOne({
      token,
    });
    while (existToken) {
      token = this.tokenService.generate();
      existToken = await this.telegramTokenModel.findOne({
        token,
      });
    }

    await this.telegramTokenModel.create({
      token,
      activated: false,
    });

    const telegram_bot_url = process.env.TELEGRAM_BOT_URL;

    return {
      success: true,
      data: `https://t.me/aniblaAuthBot?start=${token}`,

      error: null,
      message: 'token_created_successfully',
    };
  }

  async getNewTokens({ refreshToken, device, ip }: TokenDto) {
    if (!refreshToken) throw new NotFoundException('token_error');

    let result: { user_id: string; token_id: string; type: string } | null =
      null;
    try {
      // @ts-expect-error: error is not defined
      result = await this.jwtService.verifyAsync(refreshToken);
    } catch (e) {
      throw new BadRequestException('token_invalid_or_expired');
    }

    if (!result) throw new BadRequestException('token_invalid_or_expired');

    const session = await this.sessionModel.findOne({
      token_id: result.token_id,
    });

    if (result.type !== 'refresh')
      throw new BadRequestException('token_type_error');

    if (!session) throw new BadRequestException('session_expired');

    const user = await this.userModel.findById(result.user_id);

    if (!user) throw new NotFoundException('user_not_found');

    await this.sessionModel.deleteOne({ token_id: result.token_id });

    const token = await this.issueTokenPair(String(user._id), device!, ip);

    return { user: this.getUserField(user), ...token };
  }

  async issueTokenPair(userId: string, device: string, ip: string) {
    const data = { user_id: userId, token_id: v4() };

    await this.sessionModel.create({
      ...data,
      device,
      ip,
      last_login_ip: ip,
      last_login: new Date().toISOString(),
    });

    const refreshToken = await this.jwtService.signAsync(
      { ...data, type: 'refresh' },
      {
        expiresIn: '15w',
      },
    );
    const accessToken = await this.jwtService.signAsync(
      { ...data, type: 'access' },
      {
        expiresIn: '2w',
      },
    );

    return { accessToken, refreshToken };
  }

  getUserField(user: UserDocument) {
    return {
      _id: user._id,
      email: user.email,
      name: user.name,
      phone_number: user.phone_number,
      image: user.image,
      activated: user.activated,
      balance: user.balance,
      role: user.role,
      subscription: user.subscription,
      transactions: user.transactions,
    };
  }
}
