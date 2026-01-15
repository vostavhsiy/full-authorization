import { IsNotEmpty } from 'class-validator';

export class UpdateUserDto {
  @IsNotEmpty()
  isTwoFactorEnabled?: boolean;

  avatarUrl?: string;
}
