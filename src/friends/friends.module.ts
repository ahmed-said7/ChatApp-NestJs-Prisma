import { Module } from "@nestjs/common";
import { FriendService } from "./friend.service";
import { FriendController } from "./friends.controller";
import { PrismaModule } from "src/prisma/prisma.module";



@Module({
    providers:[FriendService],
    controllers:[FriendController],
    exports:[PrismaModule]
})
export class FriendModule {};