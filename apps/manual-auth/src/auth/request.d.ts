import { Roles } from '@full-auth/common';
import { UserInfo } from './provider/types';

declare module 'express' {
  interface Request {
    user?: {
      id: string;
      email: string;
      role: Roles;
    };
    providerInfo?: UserInfo;
  }
}
