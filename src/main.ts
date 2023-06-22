import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {initTelegramClient} from "./telegram";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  await initTelegramClient()
  await app.listen(8080);
}
bootstrap();
