import { Request } from 'express';
import { createParamDecorator, UnauthorizedException } from '@nestjs/common';

export const Authorized = createParamDecorator(
  (data: 'id' | 'email' | 'role', ctx) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const user = request.user;
    if (!user)
      throw new UnauthorizedException('Пользователь не аутентифицирован');
    return data ? user?.[data] : user;
  },
);
