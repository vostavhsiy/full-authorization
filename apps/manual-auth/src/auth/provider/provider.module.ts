import { DynamicModule, Module } from '@nestjs/common';
import { ProviderService } from './provider.service';
import {
  ProviderModuleAsyncOptions,
  ProviderModuleOptions,
  PROVIDERS_OPTIONS_SYMBOL,
} from './provider.constants';
import { ConfigModule, ConfigService } from '@nestjs/config'

@Module({})
export class ProviderModule {
  static register(options: ProviderModuleOptions): DynamicModule {
    return {
      module: ProviderModule,
      providers: [
        {
          provide: PROVIDERS_OPTIONS_SYMBOL,
          useValue: options,
        },
        ProviderService,
      ],
      exports: [ProviderService],
    };
  }

  static registerAsync(options: ProviderModuleAsyncOptions): DynamicModule {
    return {
      module: ProviderModule,
      imports: options.imports,
      providers: [
        ProviderService,
        {
          provide: PROVIDERS_OPTIONS_SYMBOL,
          inject: options.inject,
          useFactory: options.useFactory,
        },
      ],
      exports: [ProviderService],
    };
  }
}
