// google.strategy.ts
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-token';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google-token') {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID || "994589270016-kc3ulc8feq53en6bck7qnsj1ktfp7l1f.apps.googleusercontent.com",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "5e8f16062ea3cd2c4a0d547876baa6f38cabf625",
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: Function) {
    const { id, displayName, emails, photos } = profile;
    const user = {
      googleId: id,
      email: emails[0].value,
      name: displayName,
      photo: photos[0].value,
    };
    done(null, user);
  }
}
