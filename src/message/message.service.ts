import { PrismaService } from "src/prisma/prisma.service";
import { CreateMessageDto } from "./dto/create.message.dto";
import { IUser } from "src/user/user.service";
import { HttpException, Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { UpdateMessageDto } from "./dto/update.message.dto.dto";


@Injectable()
export class MessageService {
    constructor(private prisma:PrismaService,private events:EventEmitter2){ };
    async createMessage(body:CreateMessageDto,user:IUser){
        const conversation=await this.prisma.conversation.findFirst({
            where : { id:body.conversationId , OR : [ { creatorId:user.id },{recipientId:user.id} ] }
        });
        if(!conversation){
            throw new HttpException("No conversation found",400);
        };
        const message=await this.prisma.conversationMessage.create({
            data : {
                ... body ,
                creatorId:user.id
            },
            include : { conversation:true,creator:true }
        });
        this.events.emit( "message.created" , message );
        delete message.conversation;
        return { message }
    };
    async DeleteMessage(id:number,user:IUser){
        let existingMessage = await this.prisma.conversationMessage.findFirst({where:{id,creatorId:user.id}});
        if(!existingMessage){
            throw new HttpException("No message found",400);
        };
        let message=await this.prisma.conversationMessage.delete({
            where : {id},
            include : {
                conversation:true
                ,creator:true
            }
        });
        this.events.emit( "message.deleted" , message );
        delete message.conversation;
        return { status : "deleted" , message };
    };

    async UpdateMessage(body:UpdateMessageDto,id:number,user:IUser){
        let existingMessage = await this.prisma.conversationMessage.findFirst({where:{id,creatorId:user.id}});
        if(!existingMessage){
            throw new HttpException("No message found",400);
        };
        if( Date.now() - existingMessage.createdAt.getTime() > 15*60*1000 ){
            throw new HttpException("can not edit message",400);
        };
        let message=await this.prisma.conversationMessage.update({
            where : {id},
            data: body,
            include : {
                conversation:true
                ,creator:true
            }
        });
        this.events.emit( "message.deleted" , message );
        delete message.conversation;
        return { message };
    };
};

