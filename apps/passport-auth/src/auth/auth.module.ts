import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserService } from '@/user/user.service';
import { MailService } from '@/mail/mail.service';
import { LocalStrategy } from './strategies/local.strategy';
import { GoogleAuthStrategy } from './strategies/google.strategy';
import { GithubAuthStrategy } from './strategies/github.strategy';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    UserService,
    MailService,
    LocalStrategy,
    GoogleAuthStrategy,
    GithubAuthStrategy,
  ],
})
export class AuthModule {}
