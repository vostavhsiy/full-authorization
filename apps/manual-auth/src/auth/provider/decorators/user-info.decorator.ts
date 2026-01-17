import { applyDecorators, UseGuards } from '@nestjs/common';
import { UserInfoGuard } from '../guards/user-info.guard';

export const OAuthCallback = () => {
  return applyDecorators(UseGuards(UserInfoGuard));
};
