import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { ProviderService } from '../provider.service';

@Injectable()
export class AuthUrlGuard implements CanActivate {
  constructor(private readonly providerService: ProviderService) {}

  async canActivate(context: ExecutionContext) {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const providerName = request.params.provider;
    if (!providerName) return false;

    const provider = await this.providerService.getProvider(providerName);
    if (!provider) {
      throw new NotFoundException(`Провайдер ${providerName} не найден`);
    }

    const authUrl = provider.getAuthUrl();
    response.redirect(authUrl);

    return false;
  }
}
