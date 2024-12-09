import { Module } from "@nestjs/common";
import { EventsGateway } from "./socket.gateway";
import { EventsService } from "./socket.service";

@Module({
    providers: [EventsGateway,EventsService],
    exports: [EventsGateway,EventsService]
})
export class EventsModule{}