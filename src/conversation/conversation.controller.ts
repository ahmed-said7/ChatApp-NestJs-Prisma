import { Body, ClassSerializerInterceptor, Controller, Get, Param, ParseIntPipe, Post, UseGuards, UseInterceptors } from "@nestjs/common";
import { ConversationService } from "./conversation.service";
import { CreateConversationDto } from "./dto/create.conversation.dto";
import { AuthUser } from "src/decorator/auth.decorator";
import { IUser } from "src/user/user.service";
import { AuthenticationGuard } from "src/guards/auth.guard";
import { ChatSerializerInterceptor } from "src/interceptor/serializer";

@Controller("conversation")
@UseGuards(AuthenticationGuard)
export class ConversationController {
    constructor(private conversationService: ConversationService){};
    @Post()
    createConversation( @Body() body:CreateConversationDto,@AuthUser()  user:IUser ){
        return this.conversationService.createConversation(body,user);
    };
    
    @Get()
    @UseInterceptors(ClassSerializerInterceptor,ChatSerializerInterceptor)
    getLoggedUserConversations(@AuthUser() user:IUser){
        return this.conversationService.getLoggedUserConversations(user);
    };
    @Get(":id")
    getConversationParticipations( @Param("id",ParseIntPipe) id:number,@AuthUser() user:IUser ){
        return this.conversationService.getConversationPeopleById(id,user);
    };
};