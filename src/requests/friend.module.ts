import { Module } from "@nestjs/common";
import { RequestService } from "./request.service";
import { FriendRequestController } from "./request.controller";
import { PrismaModule } from "src/prisma/prisma.module";


@Module({
    providers:[RequestService],
    controllers:[FriendRequestController],
    exports:[PrismaModule]
})

export class FriendRequestModule {};