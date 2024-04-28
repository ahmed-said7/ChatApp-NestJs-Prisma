import { HttpException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateConversationDto } from "./dto/create.conversation.dto";
import { IUser } from "src/user/user.service";
import { EventEmitter2 } from "@nestjs/event-emitter";



@Injectable()
export class ConversationService {
    constructor(private prisma:PrismaService,private events:EventEmitter2){};
    async createConversation(body:CreateConversationDto,user:IUser){
        if( body.recipientId == user.id ){
            throw new HttpException("can not add yourself to conversation",400);
        };
        const recipient=await this.prisma.user.findFirst({where:{id:body.recipientId}});
        if(!recipient){
            throw new HttpException("recipient not found",400);
        };
        const existing=await this.prisma.conversation.findFirst({
            where: {
                OR : [
                    {creatorId:user.id,recipientId:body.recipientId},
                    {recipientId:user.id,creatorId:body.recipientId}
                ]
            }
        });
        if( existing ){
            throw new HttpException("conversation already exists",400);
        };
        const conversation=await this.prisma.conversation.create({
            data : {
                ... body , creatorId:user.id
            },
            include : { creator:true,recipient:true }
        });
        this.events.emit("conversation.created",conversation)
        return { conversation };
    };
    async getConversationMessagesById(id:number,user:IUser){
        const conversation=await this.prisma.conversation.findFirst({
            where:{ id , OR : [ { creatorId:user.id } , { recipientId:user.id } ] },
            include : {
                messages: { 
                    orderBy: { createdAt:"desc" } , include : { creator: true } , skip:0 , take:10 }
                }
        });
        if(!conversation){
            throw new HttpException("No conversation found",400);
        };
        return { conversation };
    };
    async getConversationPeopleById(id:number,user:IUser){
        const conversation=await this.prisma.conversation.findFirst({
            where:{ id , OR : [ { creatorId:user.id } , { recipientId:user.id } ] },
            include : {
                creator:true,recipient:true
        }});
        if(!conversation){
            throw new HttpException("No conversation found",400);
        };
        return { conversation };
    };
    async getLoggedUserConversations(user:IUser){
        const conversations=await this.prisma.conversation.findMany(
            {
            where:{ OR : [ { creatorId:user.id } , { recipientId:user.id } ]  },
            include : {
                    messages : { 
                        orderBy: { createdAt:"desc" } , skip:0 , take:1 ,
                        include : { creator: true  }
                }
            }
        });
        return { conversations }
    };
};