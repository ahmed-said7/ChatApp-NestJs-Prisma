import { Body, ClassSerializerInterceptor, Controller, Get, Param, ParseIntPipe, Patch, Post, UseGuards, UseInterceptors } from "@nestjs/common";
import { CreateGroupDto } from "./dto/create.group.dto";
import { AuthUser } from "src/decorator/auth.decorator";
import { IUser } from "src/user/user.service";
import { GroupService } from "./group.service";
import { AuthenticationGuard } from "src/guards/auth.guard";
import { GroupSerializerInterceptor } from "src/interceptor/group.serializer";


@Controller("group")
@UseGuards(AuthenticationGuard)
export class GroupController {
    constructor(private groupService:GroupService){};
    @Post()
    createGroup(@Body() body:CreateGroupDto,@AuthUser() user:IUser){
        return this.groupService.createGroup(body,user);
    };
    @Get()
    @UseInterceptors(ClassSerializerInterceptor,GroupSerializerInterceptor)
    getGroups(@AuthUser() user:IUser){
        return this.groupService.getUserGroup(user);
    };
    @Get("participant/:id")
    getParticipant(@AuthUser() user:IUser,@Param("id",ParseIntPipe) id:number ){
        return this.groupService.getGroupPeople(id,user);
    };
    @Get(":id")
    getGroup(@AuthUser() user:IUser,@Param("id",ParseIntPipe) id:number ){
        return this.groupService.getGroup(id,user);
    };
    @Patch("add/:groupId/:userId")
    addUserToGroup(
        @AuthUser() user:IUser,
        @Param("userId",ParseIntPipe) userId:number,
        @Param("groupId",ParseIntPipe) groupId:number
    ){
        return this.groupService.addUserToGroup(userId,groupId,user);
    };
    @Patch("remove/:groupId/:userId")
    removeUserFromGroup(
        @AuthUser() user:IUser,
        @Param("userId",ParseIntPipe) userId:number,
        @Param("groupId",ParseIntPipe) groupId:number
    ){
        return this.groupService.removeUserFromGroup(userId,groupId,user);
    };
};