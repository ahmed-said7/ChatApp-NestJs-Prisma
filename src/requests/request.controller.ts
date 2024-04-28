import { Controller, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from "@nestjs/common";
import { RequestService } from "./request.service";
import { AuthenticationGuard } from "src/guards/auth.guard";
import { AuthUser } from "src/decorator/auth.decorator";
import { IUser } from "src/user/user.service";

@Controller("friendrequest")
@UseGuards(AuthenticationGuard)
export class FriendRequestController {
    constructor(private requestService : RequestService ){};
    @Post(":id")
    createRequest(
        @Param("id",ParseIntPipe) id:number,
        @AuthUser() user:IUser
    ){
        this.requestService.createFriendRequest(user,id)
    };
    @Get("pending")
    getPendingRequest(
        @AuthUser() user:IUser
    ){
        return this.requestService.getMyPendingRequests(user);
    };
    @Get()
    getMyRequests(
        @AuthUser() user:IUser
    ){
        return this.requestService.getMyRequests(user);
    };
    @Patch("accept/:id")
    acceptRequest(
        @Param("id",ParseIntPipe) id:number,
        @AuthUser() user:IUser
    ){
        return this.requestService.acceptFriendRequest(user,id);
    };
    @Patch("reject/:id")
    rejectRequest(
        @Param("id",ParseIntPipe) id:number,
        @AuthUser() user:IUser
    ){
        return this.requestService.rejectFriendRequest(user,id);
    };
};