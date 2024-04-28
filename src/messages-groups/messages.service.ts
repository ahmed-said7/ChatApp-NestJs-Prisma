import { PrismaService } from "src/prisma/prisma.service";
import { IUser } from "src/user/user.service";
import { HttpException, Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { CreateGroupMessageDto } from "./dto/create.message.dto";
import { UpdateGroupMessageDto } from "./dto/update.message.dto";


@Injectable()
export class GroupMessageService {
    constructor(private prisma:PrismaService,private events:EventEmitter2){ };
    async createMessage(body:CreateGroupMessageDto,user:IUser){
        const group=await this.prisma.group.findFirst({
            where : { 
                id:body.groupId ,
                users : {
                    some : {
                        id : user.id
                    }
                }
            }
        });
        if(!group){
            throw new HttpException("No group found",400);
        };
        const message=await this.prisma.groupMessage.create({
            data : {
                ... body ,
                creatorId:user.id
            },
            include : { group: { include : { users:true } } ,creator:true }
        });
        try{
            this.events.emit( "message.group.created" , message );
        }catch(e){
            console.log(e);
        }
        delete message.group;
        return { message }
    };
    async DeleteMessage(id:number,user:IUser){
        let existingMessage = await this.prisma.
            groupMessage.findFirst({where:{id,creatorId:user.id}});
        if(!existingMessage){
            throw new HttpException("No message found",400);
        };
        let message=await this.prisma.groupMessage.delete({
            where : {id},
            include : {
                group:{ include : { users:true } }
                ,creator:true
            }
        });
        this.events.emit( "message.group.deleted" , message );
        delete message.group;
        return { status : "deleted" , message };
    };

    async UpdateMessage(body:UpdateGroupMessageDto,id:number,user:IUser){
        let existingMessage = await this.prisma.
            groupMessage.findFirst({where:{id,creatorId:user.id}});
        if(!existingMessage){
            throw new HttpException("No message found",400);
        };
        if( Date.now() - existingMessage.createdAt.getTime() > 15*60*1000 ){
            throw new HttpException("can not edit message",400);
        };
        let message=await this.prisma.groupMessage.update({
            data: body,
            where : {id},
            include : {
                group:{ include : { users:true } }
                ,creator:true
            }
        });
        this.events.emit( "message.group.updated" , message );
        delete message.group;
        return { message };
    };
};