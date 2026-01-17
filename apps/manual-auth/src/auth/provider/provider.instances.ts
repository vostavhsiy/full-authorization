import { BaseProvider } from './base-provider';
import { ExtractUserResponse, ProviderOptions } from './types';

interface GoogleUserInfo {
  sub: string;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  email: string;
  email_verified: boolean;
}

export class GoogleProvider extends BaseProvider {
  constructor(options: Pick<ProviderOptions, 'clientId' | 'clientSecret'>) {
    super({
      name: 'google',
      clientId: options.clientId,
      clientSecret: options.clientSecret,
      scopes: ['openid', 'email', 'profile'],
      authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokensUrl: 'https://oauth2.googleapis.com/token',
      userInfoUrl: 'https://www.googleapis.com/oauth2/v3/userinfo',
    });
  }

  override extractUserInfo(data: GoogleUserInfo): ExtractUserResponse {
    return {
      id: data.sub,
      avatarUrl: data.picture,
      email: data.email,
      provider: this.options.name,
    };
  }
}

interface GithubUserInfo {
  id: number;
  name: string;
  avatar_url: string;
  email: string;
}

export class GithubProvider extends BaseProvider {
  constructor(options: Pick<ProviderOptions, 'clientId' | 'clientSecret'>) {
    super({
      name: 'github',
      clientId: options.clientId,
      clientSecret: options.clientSecret,
      scopes: ['user'],
      authUrl: 'https://github.com/login/oauth/authorize',
      tokensUrl: 'https://github.com/login/oauth/access_token',
      userInfoUrl: 'https://api.github.com/user',
    });
  }

  override extractUserInfo(data: GithubUserInfo): ExtractUserResponse {
    return {
      id: String(data.id),
      avatarUrl: data.avatar_url,
      email: data.email,
      provider: this.options.name,
    };
  }
}
