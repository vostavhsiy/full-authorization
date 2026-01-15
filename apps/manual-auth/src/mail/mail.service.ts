import { ConfirmationTemplate } from './templates/confirmation.template';
import { MailerService } from '@nestjs-modules/mailer';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { render } from '@react-email/render';
import { ResetPasswordTemplate } from './templates/reset-password.template';
import { ConfigService } from '@nestjs/config';
import { envNames } from '@/constants';

@Injectable()
export class MailService {
  logger = new Logger(MailService.name);

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  async sendConfirmationEmail(to: string, token: string) {
    const domain = this.configService.get<string>(envNames.DOMAIN);
    if (!domain) {
      throw new InternalServerErrorException(
        'DOMAIN is not set in environment variables',
      );
    }
    const html = await render(ConfirmationTemplate({ domain, token }));
    return this.sendMail(to, 'Активация аккаунта', html);
  }

  async sendResetPasswordEmail(to: string, domain: string, token: string) {
    const html = await render(ResetPasswordTemplate({ domain, token }));
    return this.sendMail(to, 'Сброс пароля', html);
  }

  sendMail(to: string, subject: string, html: string) {
    try {
      return this.mailerService.sendMail({
        to,
        subject,
        html,
      });
    } catch (error) {
      this.logger.error('Failed to send email', error);
      throw new InternalServerErrorException(
        'Не удалось отправить письмо. Попробуйте позже.',
      );
    }
  }
}
