import { FactoryProvider, ModuleMetadata } from '@nestjs/common';
import { BaseProvider } from './base-provider';

export const PROVIDERS_OPTIONS_SYMBOL = Symbol();

export interface ProviderModuleOptions {
  providers: BaseProvider[];
}

export interface ProviderModuleAsyncOptions
  extends Omit<FactoryProvider<ProviderModuleOptions>, 'provide'> {
  imports: ModuleMetadata['imports'];
}
