import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty()
  twoFactorSecret?: string | null;

  @ApiProperty()
  isEmailVerified?: boolean;

  @ApiProperty()
  avatarUrl?: string;
}
