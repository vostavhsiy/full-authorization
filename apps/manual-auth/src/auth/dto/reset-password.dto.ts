import { IsNotEmpty, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @MinLength(6, { message: 'Пароль должен быть не менее 6 символов' })
  password!: string;

  @IsNotEmpty({ message: 'Токен сброса пароля не должен быть пустым' })
  token!: string;
}
