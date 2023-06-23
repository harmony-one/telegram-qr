import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {initTelegramBot} from "./telegramBot";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const bot = initTelegramBot();
  await bot.start({onStart: (param) => {
    console.log('### param', param);
    }});
  await app.listen(8080);
}
bootstrap();
