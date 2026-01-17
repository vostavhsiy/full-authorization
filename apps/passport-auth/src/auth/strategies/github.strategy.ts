import { ConfigService } from '@nestjs/config';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-oauth2';
import { envNames } from '@/constants';
import { UserInfo } from './user-info';
import axios from 'axios';

interface GithubUserInfo {
  id: number;
  name: string;
  avatar_url: string;
  email: string;
}

@Injectable()
export class GithubAuthStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(private readonly configService: ConfigService) {
    super({
      authorizationURL: 'https://github.com/login/oauth/authorize',
      tokenURL: 'https://github.com/login/oauth/access_token',
      clientID: configService.getOrThrow<string>(
        envNames.OAUTH_GITHUB_CLIENT_ID,
      ),
      clientSecret: configService.getOrThrow<string>(
        envNames.OAUTH_GITHUB_CLIENT_SECRET,
      ),
      callbackURL: `${configService.getOrThrow<string>(envNames.DOMAIN)}/oauth/github/callback`,
      scope: 'user',
    });
  }

  override authorizationParams(): { [key: string]: string } {
    return {
      access_type: 'offline',
      prompt: 'select_account',
    };
  }

  async validate(
    accessToken: string,
    refreshToken?: string,
  ): Promise<UserInfo> {
    try {
      const userInfoResponse = await axios.post<GithubUserInfo>(
        'https://api.github.com/user',
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      const userInfo = userInfoResponse.data;

      return {
        id: String(userInfo.id),
        avatarUrl: userInfo.avatar_url,
        email: userInfo.email,
        provider: 'github',
        accessToken,
        refreshToken,
      };
    } catch (error) {
      throw new UnauthorizedException('Ошибка при входе через github');
    }
  }
}
