import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { Body, Controller, Get, Post, Query, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Auth } from './decorators/auth.decorator';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Authorized } from './decorators/authorized.decorator';
import { Recaptcha } from '@nestlab/google-recaptcha';
import { envNames } from '@/constants';
import { Verify2FADto } from './dto/verify-2fa.dto';
import { OAuthCallback } from './provider/decorators/user-info.decorator';
import { OAuthUrl } from './provider/decorators/auth-url.decorator';

@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Auth()
  @Get('auth/profile')
  getProfile(@Authorized('id') userId: string) {
    return this.authService.getProfile(userId);
  }

  @Recaptcha()
  @Post('auth/register')
  register(@Body() dto: RegisterDto) {
    return this.authService.registerWithCredentials(dto);
  }

  @Recaptcha()
  @Post('auth/login')
  login(@Req() req: Request, @Body() dto: LoginDto) {
    return this.authService.loginWithCredentials(req, dto);
  }

  @Post('auth/send-verification')
  sendVerificationEmail(@Body('email') email: string) {
    return this.authService.sendVerificationEmail(email);
  }

  @Get('auth/confirm')
  confirmEmail(
    @Res({ passthrough: true }) res: Response,
    @Query('token') token: string,
  ) {
    return this.authService.confirmEmail(res, token);
  }

  @Post('auth/send-reset-password')
  sendResetPasswordEmail(@Body('email') email: string) {
    return this.authService.sendResetPasswordEmail(email);
  }

  @Post('auth/reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Auth()
  @Post('auth/logout')
  logout(@Req() req: Request) {
    return this.authService.logout(req);
  }

  @OAuthUrl()
  @Get('oauth/:provider/url')
  async getOAuthProviderUrl() {}

  @OAuthCallback()
  @Get('oauth/:provider/callback')
  async oauthCallback(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      await this.authService.loginWithOAuth(req, req.providerInfo!);
    } catch (error) {
      return res.redirect(
        this.configService.get(envNames.CLIENT_ORIGIN) +
          '/auth/login?error=true',
      );
    }

    return res.redirect(
      this.configService.get(envNames.CLIENT_ORIGIN) + '/dashboard/profile',
    );
  }

  @Auth()
  @Post('auth/2fa/enable')
  enable2FA(@Authorized() user: { id: string; email: string }) {
    return this.authService.generate2FASecret(user.id, user.email);
  }

  @Auth()
  @Post('auth/2fa/disable')
  disable2FA(@Authorized('id') userId: string) {
    return this.authService.disable2FA(userId);
  }

  @Post('auth/2fa/verify')
  verify2FA(@Req() req: Request, @Body() dto: Verify2FADto) {
    return this.authService.verify2FACode(req, dto.tempToken, dto.code);
  }
}
