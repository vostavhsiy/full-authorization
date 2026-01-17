import { Request } from 'express';
import { ProviderService } from '../provider.service';
import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';

@Injectable()
export class UserInfoGuard implements CanActivate {
  constructor(private readonly providerService: ProviderService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    const code = request.query.code as string;
    const providerName = request.params.provider;
    if (!code) {
      throw new BadRequestException('Код аутентификации не предоставлен');
    }
    const provider = this.providerService.getProvider(providerName);
    if (!provider) {
      throw new BadRequestException('Неизвестный провайдер аутентификации');
    }
    const userInfo = await provider.getUserFromCode(code);

    if (!userInfo) {
      throw new BadRequestException(
        'Не удалось получить информацию о пользователе',
      );
    }

    request.providerInfo = userInfo;

    return true;
  }
}
