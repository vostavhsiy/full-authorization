import dotenv from 'dotenv';
dotenv.config();

import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/app.module';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import { envNames } from '@/constants';
import session from 'express-session';
import Redis from 'ioredis';
import RedisStore from 'connect-redis';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { GoogleRecaptchaFilter } from './filters/recaptcha.filter';
import { apiReference } from '@scalar/nestjs-api-reference';

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
      resave: false,
      cookie: {
        httpOnly: true,
        secure: config.get<string>(envNames.NODE_ENV) === 'production',
        signed: true,
      },
    }),
  );

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.useGlobalFilters(new GoogleRecaptchaFilter());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Manual Auth API')
    .setVersion('1.0')
    .build();
  const documentFactory = () =>
    SwaggerModule.createDocument(app, swaggerConfig, {
      deepScanRoutes: true,
    });

  app.use(
    '/docs',
    apiReference({
      content: documentFactory,
    }),
  );

  const port = config.getOrThrow<number>(envNames.PORT);
  const host = config.get<string>(envNames.HOST) || 'localhost';
  await app.listen(port);
  if (host === 'localhost') {
    Logger.log(`🚀 Application is running on: http://${host}:${port}`);
    Logger.log(
      `📚 API documentation available at: http://${host}:${port}/docs`,
    );
  } else {
    Logger.log(`🚀 Application is running on: https://${host}`);
    Logger.log(`📚 API documentation available at: https://${host}/docs`);
  }
}

bootstrap();
