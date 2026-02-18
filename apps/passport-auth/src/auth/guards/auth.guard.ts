import { DbService } from '@/db/db.service';
import { Request } from 'express';
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly dbService: DbService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    const userId = request.session?.userId;

    const user = userId
      ? await this.dbService.user.findUnique({
          where: { id: userId },
        })
      : null;

    if (!user) {
      throw new UnauthorizedException();
    }

    request.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      twoFactorRequired: !!user.twoFactorSecret,
      accessToken: '',
      refreshToken: '',
      provider: 'local',
    };

    return true;
  }
}
