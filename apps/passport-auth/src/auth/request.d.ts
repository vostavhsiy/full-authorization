import { User } from '@full-auth/common';

declare module 'express' {
  interface Request {
    user?: Omit<User, 'password' | 'twoFactorSecret'> & {
      twoFactorRequired?: boolean;
      accessToken: string;
      refreshToken: string;
      provider: string;
    };
  }
}
