import { IsJWT, IsNotEmpty } from 'class-validator';

export class Verify2FADto {
  @IsNotEmpty()
  code!: string;

  @IsJWT()
  tempToken!: string;
}
