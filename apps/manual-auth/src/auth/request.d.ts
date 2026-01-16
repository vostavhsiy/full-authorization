import { Roles } from '@full-auth/common';

declare module 'express' {
  interface Request {
    user?: {
      id: string;
      email: string;
      role: Roles;
    };
  }
}
