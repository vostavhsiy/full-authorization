import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail(undefined, { message: 'Неверный формат email' })
  @IsNotEmpty()
  email!: string;

  @MinLength(6, { message: 'Минимальная длина пароля 6 символов' })
  password!: string;
}
