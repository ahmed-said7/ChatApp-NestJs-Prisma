import { Body, Controller, Delete, Param, ParseIntPipe, Patch, Post, UseGuards, UseInterceptors } from "@nestjs/common";
import { CreateGroupMessageDto} from "./dto/create.message.dto";
import { AuthUser } from "src/decorator/auth.decorator";
import { IUser } from "src/user/user.service";
import { GroupMessageService } from "./messages.service";
import { AuthenticationGuard } from "src/guards/auth.guard";
import { UpdateGroupMessageDto } from "./dto/update.message.dto";


@Controller("messageGroup")
@UseGuards(AuthenticationGuard)
export class MessageGroupController {
    constructor(private messageService:GroupMessageService){};
    @Post()
    createMessage(@Body() body:CreateGroupMessageDto,@AuthUser() user:IUser){
        return this.messageService.createMessage(body,user);
    };
    @Patch(":id")
    updateMessage(
        @Body() body:UpdateGroupMessageDto,
        @AuthUser() user:IUser,
        @Param("id",ParseIntPipe) id:number
    ){
        return this.messageService.UpdateMessage(body,id,user);
    };
    @Delete(":id")
    deleteMessage(
        @AuthUser() user:IUser,
        @Param("id",ParseIntPipe) id:number
    ){
        return this.messageService.DeleteMessage(id,user);
    };
};