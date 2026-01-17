import { ConfigService } from '@nestjs/config';
import { GithubProvider, GoogleProvider } from './provider/provider.instances';
import { envNames } from '@/constants';

export const getProviderFactory = (configService: ConfigService) => {
  return {
    providers: [
      new GoogleProvider({
        clientId: configService.getOrThrow<string>(
          envNames.OAUTH_GOOGLE_CLIENT_ID,
        ),
        clientSecret: configService.getOrThrow<string>(
          envNames.OAUTH_GOOGLE_CLIENT_SECRET,
        ),
      }),
      new GithubProvider({
        clientId: configService.getOrThrow<string>(
          envNames.OAUTH_GITHUB_CLIENT_ID,
        ),
        clientSecret: configService.getOrThrow<string>(
          envNames.OAUTH_GITHUB_CLIENT_SECRET,
        ),
      }),
    ],
  };
};
