import { DbService } from '@/db/db.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { hash } from 'argon2';
import { UpdateUserDto } from './dto/update-user-dto';

@Injectable()
export class UserService {
  constructor(private readonly dbService: DbService) {}

  async findById(id: string) {
    const user = await this.dbService.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException();
    return user;
  }

  async findByEmail(email: string) {
    const user = await this.dbService.user.findUnique({ where: { email } });
    if (!user) throw new NotFoundException();
    return user;
  }

  async create(dto: CreateUserDto) {
    const password = dto.password ? await hash(dto.password) : undefined;
    const user = await this.dbService.user.create({
      data: {
        email: dto.email,
        password,
        avatarUrl: dto.avatarUrl,
      },
    });
    return user;
  }
  async update(id: string, dto: UpdateUserDto) {
    const user = await this.dbService.user.update({
      where: { id },
      data: dto,
    });
    return user;
  }
}
