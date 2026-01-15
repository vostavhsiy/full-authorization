export interface ProviderOptions {
  name: string;
  clientId: string;
  clientSecret: string;
  scopes: string[];
  authUrl: string;
  tokensUrl: string;
  userInfoUrl: string;
}

export interface TokensResponse {
  access_token: string;
  refresh_token?: string;
  expires_in?: number; // seconds
  refresh_token_expires_in?: number; // seconds
}

export interface UserInfo {
  id: string;
  avatarUrl: string;
  email: string;
  provider: string;
}
