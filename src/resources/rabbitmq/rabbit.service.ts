import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as amqp from 'amqplib';
import { EventsGateway } from '../websocket/socket.gateway';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private connection: amqp.Connection;
  private channel: amqp.Channel;
    constructor(private readonly eventsGateway: EventsGateway) {}
  // Kết nối RabbitMQ khi module được khởi tạo
  async onModuleInit() {
    this.connection = await amqp.connect('amqp://guest:guest@rabbitmq:5672');
    this.channel = await this.connection.createChannel();

    // Tạo exchange (nếu chưa có)
    await this.createExchange('cronjob_exchange');

    // Tạo queue và liên kết với exchange
    const queue = 'cronjob_queue';
    await this.channel.assertQueue(queue, { durable: true });
    await this.bindQueueToExchange(queue, 'cronjob_exchange', 'message_from_cronjob');
    await this.consumeQueue(queue, (message) => {
        this.handleMessage(message); // Xử lý message khi nhận được
      });
  }

  // Đóng kết nối khi module bị hủy
  async onModuleDestroy() {
    await this.channel.close();
    await this.connection.close();
  }
  // Xử lý message nhận được và gửi qua WebSocket
  private handleMessage(message: any) {
    console.log('Received message:', message);
    this.eventsGateway.server.emit('events_response', message);// Gửi message qua WebSocket
    console.log("da nhan message");
  }
  // Gửi message lên queue
  async sendMessage(queue: string, message: { text: string }) {
    await this.channel.assertQueue(queue, { durable: true });
    this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
      persistent: true,
    });
    console.log(`Sent message to queue ${queue}:`, message);
  }

  // Tạo một exchange
  async createExchange(exchange: string) {
    await this.channel.assertExchange(exchange, 'direct', { durable: true });
    console.log(`Exchange ${exchange} created`);
  }

  // Gửi message đến exchange
  async sendMessageToExchange(
    exchange: string,
    routingKey: string,
    message: { text: string },
  ) {
    this.channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(message)), {
      persistent: true,
    });
    console.log(
      `Sent message to exchange ${exchange} with routing key ${routingKey}:`,
      message,
    );
  }

  // Liên kết queue với exchange
  async bindQueueToExchange(queue: string, exchange: string, routingKey: string) {
    await this.channel.bindQueue(queue, exchange, routingKey);
    console.log(`Bound queue ${queue} to exchange ${exchange} with routing key ${routingKey}`);
  }

  // Nhận message từ queue
  async consumeQueue(queue: string, callback: (message: { text: string }) => void) {
    console.log('Current channel:', this.channel); // Log để kiểm tra kênh
    if (!this.channel) {
      console.error('Channel is undefined!'); // Kiểm tra nếu kênh là undefined
      return;
    }

    await this.channel.assertQueue(queue, { durable: true });
    this.channel.consume(queue, (msg) => {
      if (msg) {
        let message: { text: string };

        // Kiểm tra xem nội dung có phải là JSON hợp lệ không
        const content = msg.content.toString();
        try {
          // Cố gắng parse nội dung nếu là JSON hợp lệ
          message = JSON.parse(content);
        } catch (error) {
          // Nếu không phải JSON, xử lý như chuỗi thông thường
          message = { text: content }; // Xử lý chuỗi thông thường
          console.error('Message is not valid JSON, treating as plain text:', error);
        }

        // Gọi callback với thông điệp đã xử lý
        callback(message);

        // Xác nhận đã xử lý message
        this.channel.ack(msg);
      }
    });
    console.log(`Waiting for messages in queue ${queue}`);
}


}
