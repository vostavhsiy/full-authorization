import { Validate } from '@nestjs/class-validator';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { IsRepeatsPassword } from '../validators/repeat-password.validator';

export class RegisterDto {
  @IsEmail(undefined, { message: 'Неверный формат email' })
  @IsNotEmpty()
  email!: string;

  @MinLength(6, { message: 'Минимальная длина пароля 6 символов' })
  password!: string;

  avatarUrl?: string;

  @Validate(IsRepeatsPassword)
  repeatPassword!: string;
}
