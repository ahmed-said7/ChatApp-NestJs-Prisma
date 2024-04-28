import { Module } from "@nestjs/common";
import { ConversationController } from "./conversation.controller";
import { ConversationService } from "./conversation.service";
import { PrismaModule } from "src/prisma/prisma.module";



@Module({
    controllers:[ConversationController],
    providers:[ConversationService],
    imports:[PrismaModule]
})

export class ConversationModule {};