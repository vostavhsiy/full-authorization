import { ConfigService } from '@nestjs/config';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-oauth2';
import { envNames } from '@/constants';
import axios from 'axios';
import { UserInfo } from './user-info';

interface GoogleUserInfo {
  sub: string;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  email: string;
  email_verified: boolean;
}

@Injectable()
export class GoogleAuthStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly configService: ConfigService) {
    super({
      authorizationURL: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenURL: 'https://oauth2.googleapis.com/token',
      clientID: configService.getOrThrow<string>(
        envNames.OAUTH_GOOGLE_CLIENT_ID,
      ),
      clientSecret: configService.getOrThrow<string>(
        envNames.OAUTH_GOOGLE_CLIENT_SECRET,
      ),
      callbackURL: `${configService.getOrThrow<string>(envNames.DOMAIN)}/oauth/google/callback`,
      scope: 'openid email profile',
    });
  }

  override authorizationParams(): { [key: string]: string } {
    return {
      access_type: 'offline',
      prompt: 'select_account',
    };
  }

  async validate(accessToken: string, refreshToken: string): Promise<UserInfo> {
    try {
      const userInfoResponse = await axios.post<GoogleUserInfo>(
        'https://www.googleapis.com/oauth2/v3/userinfo',
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      const userInfo = userInfoResponse.data;

      return {
        id: userInfo.sub,
        avatarUrl: userInfo.picture,
        email: userInfo.email,
        provider: 'google',
        accessToken,
        refreshToken,
      };
    } catch (error) {
      throw new UnauthorizedException('Ошибка при входе через google');
    }
  }
}
