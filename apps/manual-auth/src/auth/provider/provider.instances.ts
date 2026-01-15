import { BaseProvider } from './base-provider';
import { ProviderOptions, UserInfo } from './types';

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

  override extractUserInfo(data: any): UserInfo {
    return {
      id: data.sub,
      avatarUrl: data.picture,
      email: data.email,
      provider: this.options.name,
    };
  }
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

  override extractUserInfo(data: any): UserInfo {
    return {
      id: data.sub,
      avatarUrl: data.picture,
      email: data.email,
      provider: this.options.name,
    };
  }
}
