import { UserService } from '@/user/user.service';
import { DbService } from './../db/db.service';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { MailService } from '@/mail/mail.service';
import { v4 as uuid } from 'uuid';
import { Request } from 'express';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { verify } from 'argon2';
import { User } from '@full-auth/common';
import { ProviderService } from './provider/provider.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly dbService: DbService,
    private readonly userService: UserService,
    private readonly mailService: MailService,
    private readonly providerService: ProviderService,
  ) {}

  async registerWithCredentials(dto: RegisterDto) {
    const existingUser = await this.userService.findByEmail(dto.email);
    if (existingUser) {
      throw new BadRequestException(
        'Пользователь с таким email уже существует',
      );
    }
    const newUser = await this.userService.create({
      email: dto.email,
      password: dto.password,
    });
    const token = await this.generateVerificationToken(newUser.email);

    await this.mailService.sendConfirmationEmail(newUser.email, token.value);

    return {
      message:
        'Регистрация успешна. Пожалуйста, проверьте вашу почту для подтверждения email.',
    };
  }

  async loginWithCredentials(req: Request, dto: LoginDto) {
    const existingUser = await this.userService.findByEmail(dto.email);
    if (!existingUser || !existingUser.password) {
      throw new BadRequestException('Такого пользователя не существует');
    }
    const isPasswordCorrect = await this.verifyPassword(
      dto.password,
      existingUser.password,
    );
    if (!isPasswordCorrect) {
      throw new BadRequestException('Неверный пароль');
    }

    const { password, ...userWithoutPassword } = existingUser;
    return this.saveSession(req, userWithoutPassword);
  }

  async loginWithOAuth(req: Request, providerName: string, code: string) {
    const provider = this.providerService.getProvider(providerName);
    if (!provider) {
      throw new BadRequestException('Неизвестный провайдер аутентификации');
    }
    const userInfo = await provider.getUserFromCode(code);

    let account = await this.dbService.account.findFirst({
      where: {
        provider: providerName,
        providerId: userInfo.id,
      },
    });

    let user = account?.userId
      ? await this.userService.findById(account.userId)
      : null;

    if (user) {
      return this.saveSession(req, user);
    }

    user = await this.userService.create({
      email: userInfo.email,
      avatarUrl: userInfo.avatarUrl,
    });

    if (!account) {
      await this.dbService.account.create({
        data: {
          provider: providerName,
          providerId: userInfo.id,
          accessToken: userInfo.access_token,
          refreshToken: userInfo.refresh_token,
          expiresAt: userInfo.expires_in
            ? new Date(Date.now() + userInfo.expires_in * 1000)
            : null,
          type: 'OAUTH',
          userId: user.id,
        },
      });
    }

    return this.saveSession(req, user);
  }

  private async generateVerificationToken(email: string) {
    const value = uuid();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);
    try {
      const token = await this.dbService.token.create({
        data: {
          email,
          type: 'EMAIL_VERIFICATION',
          value,
          expiresAt,
        },
      });
      return token;
    } catch (error) {
      throw new BadRequestException('Не удалось создать токен подтверждения');
    }
  }

  private async saveSession(req: Request, user: Omit<User, 'password'>) {
    return new Promise((resolve, reject) => {
      req.session.userId = user.id;
      req.session.save((err) => {
        if (err) {
          return reject(
            new InternalServerErrorException('Не удалось сохранить сессию'),
          );
        }
        resolve(user);
      });
    });
  }

  private verifyPassword(password: string, hashedPassword: string) {
    return verify(hashedPassword, hashedPassword);
  }
}
