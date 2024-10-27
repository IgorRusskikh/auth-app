import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.enableCors({
    origin: 'http://localhost:3001', // Укажите адрес вашего клиента
    credentials: true, // Разрешите отправку куков
  });
  await app.listen(3000);
}
bootstrap();
