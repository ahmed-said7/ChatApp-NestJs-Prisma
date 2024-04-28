import { HttpException, Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { PrismaService } from "src/prisma/prisma.service";
import { IUser } from "src/user/user.service";
import { EventEmitter } from "stream";


@Injectable()
export class RequestService {
    constructor( private prisma:PrismaService, private events:EventEmitter2 ){};
    async createFriendRequest(user:IUser,userId:number){
        const reciver=await this.prisma.user.findFirst({
            where:{ id : userId }
        });
        if( !reciver ){
            throw new HttpException(" user not found ",400);
        };
        const requestExisting= this.prisma.request.findFirst({ 
            where : {
                AND:[
                {
                    OR : [
                        { senderId : user.id , recieverId : userId  },
                        { senderId : userId , recieverId : user.id  } 
                    ]
                },
                {
                    OR : [
                        { status : "pending" },
                        { status : "accepted" } 
                    ]
                }
                ]
            }
        });
        if(requestExisting){
            throw new HttpException("can not send request",400);
        };
        const request = await this.prisma.request.create({
            data : {
                senderId : user.id,
                recieverId:userId,
                status:"pending"
            },
            include : { sender:true }
        });
        this.events.emit("friend.request.received",{ receiverId:request.recieverId, sender:user });
        return { request };
    };
    async acceptFriendRequest(user:IUser,id:number){
        const requestExisting=await this.prisma.request.findFirst({
            where : {
                id,
                senderId : user.id
            }
        });
        if( ! requestExisting ){
            throw new HttpException("request not found",400);
        };
        const request=await this.prisma.request.update({
            where : {
                id
            },
            data : {
                status : "accepted"
            }
        });
        const friend=await this.prisma.friend.create({
            data : {
                senderId : request.senderId,
                recieverId:user.id
            }
        });
        this.events.emit("friend.request.accepted",{ receiverId:request.senderId, sender:user });
        return { friend };
    };
    async rejectFriendRequest(user:IUser,id:number){
        const requestExisting=await this.prisma.request.findFirst({
            where : {
                id,
                senderId : user.id
            }
        });
        if( ! requestExisting ){
            throw new HttpException("request not found",400);
        };
        const request=await this.prisma.request.update({
            where : {
                id
            },
            data : {
                status : "blocked"
            }
        });
        this.events.emit("friend.request.rejected",{ receiverId:request.senderId, sender:user });
        return { request };
    };
    async getMyPendingRequests(user:IUser){
        const requests=await this.prisma.request.findMany({
            where : {
                recieverId : user.id
            }
        });
        return { requests };
    };
    async getMyRequests(user:IUser){
        const requests=await this.prisma.request.findMany({
            where : {
                senderId : user.id
            }
        });
        return { requests };
    };
};