import { InternalServerErrorException } from '@nestjs/common';
import { ProviderOptions, TokensResponse, UserInfo } from './types';
import axios from 'axios';

export class BaseProvider {
  BASE_URL!: string;

  constructor(protected readonly options: ProviderOptions) {}

  getAuthUrl() {
    const params = new URLSearchParams({
      client_id: this.options.clientId,
      redirect_uri: this.getRedirectUrl(),
      scope: (this.options.scopes ?? []).join(' '),
      response_type: 'code',
      access_type: 'offline',
      prompt: 'select_account',
    });
    return `${this.options.authUrl}?${params.toString()}`;
  }

  getRedirectUrl() {
    return `${this.BASE_URL}/oauth/${this.options.name}/callback`;
  }

  extractUserInfo(data: any): UserInfo {
    return {
      ...data,
      provider: this.options.name,
    };
  }

  async getUserFromCode(code: string) {
    const params = new URLSearchParams({
      client_id: this.options.clientId,
      client_secret: this.options.clientSecret,
      code,
      redirect_uri: this.getRedirectUrl(),
      grant_type: 'authorization_code',
    });

    try {
      const response = await axios.post<TokensResponse>(
        this.options.tokensUrl,
        {
          params,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      const {
        access_token,
        refresh_token,
        expires_in,
        refresh_token_expires_in,
      } = response.data;

      const userInfoResponse = await axios.post(this.options.userInfoUrl, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });

      return {
        ...this.extractUserInfo(userInfoResponse.data),
        access_token,
        refresh_token,
        expires_in,
        refresh_token_expires_in,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        `Ошибка при входе через ${this.options.name}`,
      );
    }
  }

  set BaseUrl(url: string) {
    this.BASE_URL = url;
  }

  get BaseUrl() {
    return this.BASE_URL;
  }

  get name() {
    return this.options.name;
  }
}
