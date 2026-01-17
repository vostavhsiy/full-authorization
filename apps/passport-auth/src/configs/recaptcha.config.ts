import { envNames } from '@/constants';
import { ConfigService } from '@nestjs/config';
import { GoogleRecaptchaModuleOptions } from '@nestlab/google-recaptcha';
export const getRecaptchaFactory = (
  configService: ConfigService,
): GoogleRecaptchaModuleOptions => ({
  secretKey: configService.getOrThrow<string>(envNames.GOOGLE_RECAPTCHA_SECRET),
  response: (req) => req.headers.recaptcha,
  skipIf: true,
});
