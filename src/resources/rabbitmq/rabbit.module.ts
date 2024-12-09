import { Module } from '@nestjs/common';
import { RabbitMQService } from './rabbit.service';
import { RabbitMQController } from './rabbit.controller';
import { EventsModule } from '../websocket/socket.module';


@Module({
  imports: [EventsModule],  
  providers: [RabbitMQService],
  controllers: [RabbitMQController],
})
export class RabbitMQModule {}
