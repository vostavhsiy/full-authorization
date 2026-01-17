import { Global, Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getMailFactory } from './mail.config';

@Global()
@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getMailFactory,
      inject: [ConfigService],
    }),
  ],
  exports: [MailService],
  providers: [MailService],
})
export class MailModule {}
