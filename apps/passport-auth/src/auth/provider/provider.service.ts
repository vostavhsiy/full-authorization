import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import {
  type ProviderModuleOptions,
  PROVIDERS_OPTIONS_SYMBOL,
} from './provider.constants';
import { ConfigService } from '@nestjs/config';
import { envNames } from '@/constants';

@Injectable()
export class ProviderService implements OnModuleInit {
  constructor(
    @Inject(PROVIDERS_OPTIONS_SYMBOL)
    private readonly options: ProviderModuleOptions,
    private readonly configService: ConfigService,
  ) {}

  onModuleInit() {
    for (const provider of this.options.providers) {
      provider.BaseUrl = this.configService.getOrThrow<string>(envNames.DOMAIN);
    }
  }

  getProvider(name: string) {
    return this.options.providers.find((provider) => provider.name === name);
  }
}
