import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@full-auth/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { ConfigService } from '@nestjs/config';
import { envNames } from '@/constants';

@Injectable()
export class DbService extends PrismaClient {
  constructor(private readonly configService: ConfigService) {
    const adapter = new PrismaPg({
      connectionString: configService.getOrThrow<string>(envNames.DATABASE_URL),
    });
    super({
      adapter,
    });
  }
}
