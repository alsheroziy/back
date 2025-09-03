import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { PassportStrategy } from '@nestjs/passport';
import { Model } from 'mongoose';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User, UserDocument } from 'src/user/user.model';
import { Session, SessionDocument } from '../sessions.model';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Session.name) private sessionModel: Model<SessionDocument>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('SECRET_JWT'),
      passReqToCallback: true,
    });
  }

  async validate(
    req: any,
    {
      user_id,
      token_id,
      type,
      // @ts-expect-error: error is not defined
    }: Pick<SessionDocument, 'user_id' | 'token_id' | 'type'>,
  ) {
    const ip =
      req.headers['x-forwarded-for']?.toString() ||
      req.socket.remoteAddress ||
      req.ip;

    const loginTime = new Date().toISOString();

    const session = await this.sessionModel.findOne({ token_id });

    if (!session) throw new UnauthorizedException('session_not_found');
    const user = await this.userModel.findById(user_id);

    if (!user) throw new UnauthorizedException('user_not_found_this_session');

    await this.sessionModel.updateOne(
      { token_id },
      {
        last_login_ip: ip,
        last_login: loginTime,
      },
    );

    if (type !== 'access')
      throw new UnauthorizedException('token_is_not_access_token');

    return user;
  }
}
