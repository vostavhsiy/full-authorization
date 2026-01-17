import { ProviderService } from './../provider/provider.service';
import { Request } from 'express';
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  NotFoundException,
} from '@nestjs/common';

@Injectable()
export class ProviderGuard implements CanActivate {
  constructor(private readonly providerService: ProviderService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    const providerName = request.params.provider;
    if (!providerName) return false;
    const provider = await this.providerService.getProvider(providerName);
    if (!provider) {
      throw new NotFoundException(`Провайдер ${providerName} не найден`);
    }
    return true;
  }
}
