import { Body, Controller, Patch } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user-dto';
import { UserService } from './user.service';
import { Authorized } from '@/auth/decorators/authorized.decorator';
import { Auth } from '@/auth/decorators/auth.decorator';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Auth()
  @Patch()
  async update(@Authorized('id') userId: string, @Body() dto: UpdateUserDto) {
    return this.userService.update(userId, dto);
  }
}
