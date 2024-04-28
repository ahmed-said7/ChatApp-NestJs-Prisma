import { Controller, Delete, Get, Param, ParseIntPipe, UseGuards } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { FriendService } from "./friend.service";
import { AuthenticationGuard } from "src/guards/auth.guard";
import { AuthUser } from "src/decorator/auth.decorator";
import { IUser } from "src/user/user.service";




@Controller("friend")
@UseGuards(AuthenticationGuard)
export class FriendController {
    constructor( private friendService:FriendService ){};
    @Get()
    getFriends(@AuthUser() user:IUser ){
        return this.friendService.getFriends(user);
    };
    @Delete(":id")
    deleteFriend( @AuthUser() user:IUser,@Param("id",ParseIntPipe) id:number ){
        return this.friendService.deleteFriend(id,user);
    };
};