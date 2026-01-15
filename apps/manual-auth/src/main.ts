import dotenv from 'dotenv';
dotenv.config();

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/app.module';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import { envNames } from '@/constants';
import session from 'express-session';
import Redis from 'ioredis';
import { RedisStore } from 'connect-redis';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService);

  app.enableCors({
    origin: config.getOrThrow<string>(envNames.ALLOWED_ORIGINS).split(','),
    credentials: true,
  });

  app.use(cookieParser(config.getOrThrow<string>(envNames.COOKIE_SECRET)));

  const redis = new Redis({
    host: config.getOrThrow<string>(envNames.REDIS_HOST),
    port: config.getOrThrow<number>(envNames.REDIS_PORT),
    password: config.getOrThrow<string>(envNames.REDIS_PASSWORD),
  });

  app.use(
    session({
      secret: config.getOrThrow<string>(envNames.SESSION_SECRET),
      saveUninitialized: false,
      store: new RedisStore({ client: redis, prefix: 'manual-auth:sess:' }),
    }),
  );

  const port = config.getOrThrow<number>(envNames.PORT);
  const host = config.get<string>(envNames.HOST) || 'localhost';
  await app.listen(port);
  Logger.log(`🚀 Application is running on: http://${host}:${port}`);
}

bootstrap();
