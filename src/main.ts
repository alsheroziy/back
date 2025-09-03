import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // 🔵 Form-data (xususan, urlencoded) so‘rovlar uchun
  app.use(express.urlencoded({ extended: true }));

  // 🌍 CORS sozlamalari
  app.enableCors({
    origin: [
      'http://192.168.214.74:3000',
      'https://amediatv.up-it.uz',
      'http://localhost:3000',
      'https://amediapanel.up-it.uz',
    ],
    methods: 'GET,PUT,PATCH,POST,DELETE',
    allowedHeaders: ['Content-Type', 'Authorization', 'x-app-version'],
    credentials: true,
  });

  // 🟢 XML so‘rovlar uchun Paynet middleware
  app.use('/api/v1/payments/paynet', express.text({ type: '*/xml' }));

  // 🔁 Global prefix
  app.setGlobalPrefix('api/v1');

  // 🖼 Statik fayllar yo‘li
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads',
  });

  // 🚀 Serverni ishga tushirish
  const port = process.env.PORT ?? 1000;
  await app.listen(port);
  console.log(`🚀 Server running on http://localhost:${port}`);
}
bootstrap();
