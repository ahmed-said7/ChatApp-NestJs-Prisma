import { Body, Controller, Delete, Param, ParseIntPipe, Patch, Post, UseGuards } from "@nestjs/common";
import { CreateMessageDto } from "./dto/create.message.dto";
import { AuthUser } from "src/decorator/auth.decorator";
import { IUser } from "src/user/user.service";
import { MessageService } from "./message.service";
import { UpdateMessageDto } from "./dto/update.message.dto.dto";
import { AuthenticationGuard } from "src/guards/auth.guard";

@Controller("message")
@UseGuards(AuthenticationGuard)
export class MessageController {
    constructor(private messageService:MessageService){};
    @Post()
    createMessage(@Body() body:CreateMessageDto,@AuthUser() user:IUser){
        return this.messageService.createMessage(body,user);
    };
    
    @Patch(":id")
    updateMessage(
        @Body() body:UpdateMessageDto,
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