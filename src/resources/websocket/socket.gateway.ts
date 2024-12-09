import { Logger } from "@nestjs/common";
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { EventsService } from "./socket.service";

@WebSocketGateway(8000, {namespace: '/events',
    cors: {
        origin: 'http://192.168.0.37:3000',  // Cho phép frontend kết nối từ localhost:3000
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type'],
      },
})
export class EventsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect{
    @WebSocketServer() server : Server;
    private logger : Logger = new Logger('EventsGateway');

    constructor(private readonly eventsService: EventsService){}
    afterInit() : void{
        this.logger.log('Websocket server initialized');
    }
    handleConnection(client: Socket) : void{
        this.logger.log(`Client connected :${client.id}`);
    }
    handleDisconnect(client: Socket) : void{
        this.logger.log(`Client disconnected : ${client.id}`);
    }
    //
    @SubscribeMessage('events')
    handleEvent(@MessageBody() data: any, @ConnectedSocket() client : Socket) : void {
        this.logger.log(`Received event: ${JSON.stringify(data)}`);
        const response = this.eventsService.processEvent(data);
        client.emit('events_response', response);
    }
}