import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { DbModule } from './db/db.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailModule } from './mail/mail.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { GoogleRecaptchaModule } from '@nestlab/google-recaptcha';
import { getRecaptchaFactory } from './configs/recaptcha.config';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.register({
      global: true,
    }),
    GoogleRecaptchaModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getRecaptchaFactory,
      inject: [ConfigService],
    }),
    DbModule,
    MailModule,
    AuthModule,
    UserModule,
  ],
  providers: [AppService],
})
export class AppModule {}
