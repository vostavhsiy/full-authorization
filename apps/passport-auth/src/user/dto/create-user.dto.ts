import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @IsEmail(undefined, { message: 'Неверный формат email' })
  @IsNotEmpty()
  email!: string;

  password?: string;

  avatarUrl?: string;

  isEmailVerified?: boolean;
}
