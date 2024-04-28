import { Module } from "@nestjs/common";
import { MessageService } from "./message.service";
import { MessageController } from "./message.controller";
import { PrismaModule } from "src/prisma/prisma.module";





@Module({
    providers:[MessageService],
    controllers:[MessageController],
    imports:[PrismaModule]
})
export class MessageModule {};