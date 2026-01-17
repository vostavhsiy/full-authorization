import { applyDecorators, UseGuards } from '@nestjs/common';
import { AuthUrlGuard } from '../guards/auth-url.guard';

export const OAuthUrl = () => {
  return applyDecorators(UseGuards(AuthUrlGuard));
};
