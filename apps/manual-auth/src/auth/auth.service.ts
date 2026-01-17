import { ConfigService } from '@nestjs/config';
import { UserService } from '@/user/user.service';
import { DbService } from './../db/db.service';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { MailService } from '@/mail/mail.service';
import { v4 as uuid } from 'uuid';
import { Request, Response } from 'express';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { hash, verify } from 'argon2';
import { User } from '@full-auth/common';
import { envNames } from '@/constants';
import { ResetPasswordDto } from './dto/reset-password.dto';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import { JwtService } from '@nestjs/jwt';
import { UserInfo } from './provider/types';

@Injectable()
export class AuthService {
  constructor(
    private readonly dbService: DbService,
    private readonly userService: UserService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async getProfile(userId: string) {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

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

    if (!existingUser.isEmailVerified) {
      const token = await this.generateVerificationToken(existingUser.email);
      await this.mailService.sendConfirmationEmail(
        existingUser.email,
        token.value,
      );

      throw new UnauthorizedException(
        'Пожалуйста, подтвердите ваш email перед входом',
      );
    }

    if (existingUser.twoFactorSecret) {
      const tempToken = await this.signTempToken(existingUser.id);
      return {
        twoFactorRequired: true,
        tempToken,
      };
    }

    const { password, ...userWithoutPassword } = existingUser;
    return this.saveSession(req, userWithoutPassword);
  }

  async sendVerificationEmail(email: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new BadRequestException('Пользователь с таким email не найден');
    }
    const token = await this.generateVerificationToken(email);
    await this.mailService.sendConfirmationEmail(email, token.value);
    return {
      message: 'Письмо с подтверждением отправлено на ваш email',
    };
  }

  async confirmEmail(res: Response, tokenValue: string) {
    const token = await this.dbService.token.findFirst({
      where: {
        value: tokenValue,
        type: 'EMAIL_VERIFICATION',
      },
    });
    await this.dbService.token.deleteMany({
      where: {
        value: tokenValue,
        type: 'EMAIL_VERIFICATION',
      },
    });
    if (!token) {
      return res.redirect(
        this.configService.get(envNames.CLIENT_ORIGIN) +
          '/auth/confirmed-invalid',
      );
    }
    if (token.expiresAt > new Date()) {
      const user = await this.userService.findByEmail(token.email);
      if (!user) {
        return res.redirect(
          this.configService.get(envNames.CLIENT_ORIGIN) +
            '/auth/confirmed-invalid',
        );
      }
      await this.userService.update(user.id, {
        isEmailVerified: true,
      });
      return res.redirect(
        this.configService.get(envNames.CLIENT_ORIGIN) + '/auth/confirmed',
      );
    }

    return res.redirect(
      this.configService.get(envNames.CLIENT_ORIGIN) +
        '/auth/confirmed-expired',
    );
  }

  async sendResetPasswordEmail(email: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new BadRequestException('Пользователь с таким email не найден');
    }
    const token = await this.generateResetPasswordToken(email);
    await this.mailService.sendResetPasswordEmail(email, token.value);
    return {
      message: 'Письмо с инструкциями по сбросу пароля отправлено на ваш email',
    };
  }

  async resetPassword({ password, token: tokenValue }: ResetPasswordDto) {
    const token = await this.dbService.token.findFirst({
      where: {
        value: tokenValue,
        type: 'PASSWORD_RESET',
      },
    });
    await this.dbService.token.deleteMany({
      where: {
        value: tokenValue,
        type: 'PASSWORD_RESET',
      },
    });
    if (!token) {
      throw new BadRequestException('Неверный токен для сброса пароля');
    }
    if (token.expiresAt > new Date()) {
      const user = await this.userService.findByEmail(token.email);
      if (!user) {
        throw new BadRequestException('Пользователь не найден');
      }
      const hashedPassword = await hash(password);
      await this.dbService.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });
      return {
        message: 'Пароль успешно обновлен',
      };
    }

    throw new BadRequestException('Срок действия токена подтверждения истек');
  }

  async logout(req: Request) {
    return new Promise((resolve, reject) => {
      req.session.destroy((err) => {
        if (err) {
          return reject(
            new InternalServerErrorException('Не удалось завершить сессию'),
          );
        }
        resolve({ message: 'Вы успешно вышли из системы' });
      });
    });
  }

  async loginWithOAuth(req: Request, userInfo: UserInfo) {
    let account = await this.dbService.account.findFirst({
      where: {
        provider: userInfo.provider,
        providerId: userInfo.id,
      },
    });

    let user = account?.userId
      ? await this.userService.findById(account.userId)
      : null;

    if (user) {
      return this.saveSession(req, user);
    }

    user = await this.userService.findByEmail(userInfo.email);

    if (!user) {
      user = await this.userService.create({
        email: userInfo.email,
        avatarUrl: userInfo.avatarUrl,
        isEmailVerified: true,
      });
    }

    if (!account) {
      await this.dbService.account.create({
        data: {
          provider: userInfo.provider,
          providerId: userInfo.id,
          accessToken: userInfo.accessToken,
          refreshToken: userInfo.refreshToken,
          expiresAt: userInfo.expiresIn
            ? new Date(Date.now() + userInfo.expiresIn * 1000)
            : null,
          type: 'OAUTH',
          userId: user.id,
        },
      });
    }

    return this.saveSession(req, user);
  }

  async generate2FASecret(userId: string, email: string) {
    const secret = speakeasy.generateSecret({
      length: 20,
      name: `Manual Auth App:${email}`,
      issuer: 'Manual Auth App',
    });

    await this.userService.update(userId, {
      twoFactorSecret: secret.base32,
    });

    const otpauthUrl = secret.otpauth_url;

    if (!otpauthUrl) {
      throw new InternalServerErrorException(
        'Не удалось сгенерировать 2FA URL',
      );
    }

    const qr = await QRCode.toDataURL(otpauthUrl);

    return {
      secret: secret.base32,
      qr,
    };
  }

  async disable2FA(userId: string) {
    await this.userService.update(userId, {
      twoFactorSecret: null,
    });
    return {
      message: 'Двухфакторная авторизация отключена',
    };
  }

  async verify2FACode(req: Request, tempToken: string, code: string) {
    const { userId } = await this.verifyTempToken(tempToken);
    const user = await this.userService.findById(userId);
    if (!user || !user.twoFactorSecret) {
      throw new BadRequestException(
        'Двухфакторная авторизация не настроена для этого пользователя',
      );
    }
    const valid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: code,
    });

    if (!valid) {
      throw new BadRequestException('Неверный код двухфакторной авторизации');
    }

    return this.saveSession(req, user);
  }

  private async generateVerificationToken(email: string) {
    await this.dbService.token.deleteMany({
      where: {
        email,
        type: 'EMAIL_VERIFICATION',
      },
    });
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

  private async generateResetPasswordToken(email: string) {
    await this.dbService.token.deleteMany({
      where: {
        email,
        type: 'PASSWORD_RESET',
      },
    });
    const value = uuid();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);
    try {
      const token = await this.dbService.token.create({
        data: {
          email,
          type: 'PASSWORD_RESET',
          value,
          expiresAt,
        },
      });
      return token;
    } catch (error) {
      throw new BadRequestException(
        'Не удалось создать токен для сброса пароля',
      );
    }
  }

  private async saveSession(
    req: Request,
    user: Omit<User, 'password'>,
  ): Promise<Omit<User, 'password' | 'twoFactorSecret'>> {
    return new Promise((resolve, reject) => {
      req.session.userId = user.id;
      req.session.save((err) => {
        if (err) {
          return reject(
            new InternalServerErrorException('Не удалось сохранить сессию'),
          );
        }
        //@ts-ignore
        const { password, twoFactorSecret, ...userWithoutPassword } = user;
        resolve(userWithoutPassword);
      });
    });
  }

  private verifyPassword(password: string, hashedPassword: string) {
    return verify(hashedPassword, password);
  }

  private signTempToken(userId: string) {
    const payload = { sub: userId };
    return this.jwtService.signAsync(payload, {
      expiresIn: '15m',
      secret: this.configService.get<string>(envNames.TEMP_JWT_SECRET),
    });
  }

  private async verifyTempToken(token: string) {
    try {
      const payload = await this.jwtService.verify<{ sub: string }>(token, {
        secret: this.configService.get<string>(envNames.TEMP_JWT_SECRET),
      });
      return { userId: payload.sub };
    } catch (error) {
      throw new BadRequestException('QR код недействителен, попробуйте снова');
    }
  }
}
