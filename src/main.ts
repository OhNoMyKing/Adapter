import { RedisIoAdapter } from './resources/redis/redis-io.adapter';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  //create RedisIoAdapter
  const redisIoAdapter = new RedisIoAdapter(app);
  await redisIoAdapter.connectToRedis();
  //ap dung RedisIoAdapter
  app.useWebSocketAdapter(redisIoAdapter);
  await app.listen(process.env.PORT ?? 8083);
}
bootstrap();
