import { Controller, Post, Body } from '@nestjs/common';
import { RabbitMQService } from './rabbit.service';


@Controller('rabbitmq')
export class RabbitMQController {
  constructor(private readonly rabbitMQService: RabbitMQService) {}

  // Endpoint để gửi message vào queue
  @Post('send')
  async sendMessage(@Body() body: { queue: string; text: string }) {
    const { queue, text } = body;
    await this.rabbitMQService.sendMessage(queue, { text });
    return { message: 'Message sent to queue', data: { queue, text } };
  }

  // Endpoint để nhận message từ queue
  @Post('consume')
  async consumeMessage(@Body() body: { queue: string }) {
    const { queue } = body;
    await this.rabbitMQService.consumeQueue(queue, (message) => {
      console.log('Received message:', message);
    });
    return { message: `Consuming messages from queue ${queue}` };
  }
}
