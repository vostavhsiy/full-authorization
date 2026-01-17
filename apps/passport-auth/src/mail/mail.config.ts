import { envNames } from '@/constants';
import { MailerOptions } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

export const getMailFactory = async (
  configService: ConfigService,
): Promise<MailerOptions> => ({
  transport: {
    host: configService.getOrThrow<string>(envNames.SMTP_HOST),
    secure: configService.get<number>(envNames.SMTP_PORT) === 465,
    port: configService.getOrThrow<number>(envNames.SMTP_PORT),
    auth: {
      user: configService.getOrThrow<string>(envNames.SMTP_USER),
      pass: configService.getOrThrow<string>(envNames.SMTP_PASSWORD),
    },
  },
  defaults: {
    from: `"Manual Auth" <${configService.getOrThrow<string>(envNames.SMTP_FROM)}>`,
  },
});
