import { Module } from "@nestjs/common";
import { WebSocketGateway } from "@nestjs/websockets";
import { HandleSocketService } from "./store.service";
import { WebSocketMessages } from "./socket.gateway";
import { PrismaModule } from "src/prisma/prisma.module";



@Module({
    providers:[HandleSocketService,WebSocketMessages]
    ,
    imports:[PrismaModule]
})
export class SocketModule {};