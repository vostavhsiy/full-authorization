import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserService } from '@/user/user.service';
import { MailService } from '@/mail/mail.service';
import { ProviderModule } from './provider/provider.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getProviderFactory } from './provider.config';

@Module({
  controllers: [AuthController],
  providers: [AuthService, UserService, MailService],
  imports: [
    ProviderModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getProviderFactory,
    }),
  ],
})
export class AuthModule {}
