import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import rateLimit from 'express-rate-limit';
import { AppModule } from './app.module';
import { RoutePaths } from './routes/route-paths';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.setGlobalPrefix('api');

  app.use(
    `/api/${RoutePaths.auth}/`,
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 2,
      message: { statusCode: 429, message: 'Too many auth attempts, please try again later.' },
      standardHeaders: 'draft-8',
      legacyHeaders: false,
    }),
  );

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
}
bootstrap();
