import { Module } from "@nestjs/common";
import { PrismaModule } from "src/prisma/prisma.module";
import { GroupMessageService } from "./messages.service";
import { MessageGroupController } from "./message.controller";





@Module({
    providers:[GroupMessageService],
    controllers:[MessageGroupController],
    imports:[PrismaModule]
})
export class MessageGroupModule {};