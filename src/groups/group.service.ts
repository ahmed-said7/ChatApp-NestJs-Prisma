import { HttpException , Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateGroupDto } from "./dto/create.group.dto";
import { IUser } from "src/user/user.service";
import { EventEmitter2 } from "@nestjs/event-emitter";

@Injectable()
export class GroupService {
    constructor( private prisma:PrismaService,private events:EventEmitter2 ){};
    async createGroup(body:CreateGroupDto,user:IUser){
        const users=await this.prisma.user.findMany({
            where:{id:{in:body.users}},
            select:{id:true}
        });
        if( users.length !== body.users.length ){
            throw new HttpException("users not found",400);
        };
        if( !users.includes({id:user.id}) ){
            users.push({id:user.id});
        };
        const group=await this.prisma.group.create({
            data:{
                name:body.name,
                users:{connect:users},
                creatorId:user.id
            },
            include : { users:true,creator:true }
        });
        this.events.emit("group.created", group );
        return { group };
    };
    async getUserGroup(user:IUser){
        const groups=await this.prisma.group.findMany({
            where:{
                users: {
                    some : {
                        id: user.id
                    }
                }
            },
            include : {
                messages : {
                    orderBy : { createdAt : "desc"  } ,
                    skip:0 , take:1 , include : { creator : true }
                }
            }
        });
        return { groups }
    };
    async getGroupPeople(id:number,user:IUser){
        const group=await this.prisma.group.findMany({
            where:{
                id,
                users: {
                    some : {
                        id: user.id
                    }
                }
            },
            include : {
                users: true,
                creator: true
            }
        });
        return { group }
    };
    async getGroup(id:number,user:IUser){
        const group=await this.prisma.group.findMany({
            where:{
                id,
                users: {
                    some : {
                        id: user.id
                    }
                }
            },
            include : {
                messages : {
                    orderBy : { createdAt : "desc"  } ,
                    skip:0 , take:10 , include : { creator : true }
                }
            }
        });
        return { group }
    };
    async removeUserFromGroup(userId:number,groupId:number,user:IUser){
        const group=await this.prisma.group.findFirst({
            where:{
                id:groupId,
                users: {
                    some : {
                        id: userId
                    }
                }
            },
            include : { users : true }
        });
        if(!group){
            throw new HttpException("Group not found",400);
        };
        const existingUser=await this.prisma.user.findFirst({
            where : { id : userId }
        });
        if(!existingUser){
            throw new HttpException("User not found",400);
        };
        if( user.id !== group.creatorId){
            throw new HttpException("you are not allowed to remove a user",400);
        };
        if( user.id == userId ){
            throw new HttpException("can not remove group owner",400);
        };
        const groupUsers=await this.prisma.group.update({
            where:{
                id:groupId
            },
            data : {
                users : {
                    disconnect : [{id:userId}]
                }
            }
            ,include:{users:true}
        });
        this.events.emit("group.user.removed", {group:groupUsers,user:existingUser} );
        return { group:groupUsers };
    };
    async addUserToGroup(userId:number,groupId:number,user:IUser){
        const group=await this.prisma.group.findFirst({
            where:{
                id:groupId
            },
            include : { users : { select : { id:true } } }
        });
        if(!group){
            throw new HttpException("Group not found",400);
        };
        const existingUser=await this.prisma.user.findFirst({
            where : { id : userId }
        });
        if(!existingUser){
            throw new HttpException("User not found",400);
        }
        if( user.id !== group.creatorId){
            throw new HttpException("you are not allowed to add a user",400);
        };
        if( group.users.includes({id:userId}) ){
            throw new HttpException("user already joined group",400);
        };
        const groupUsers=await this.prisma.group.update({
            where:{
                id:groupId
            },
            data : {
                users : {
                    connect : [{id:userId}]
                }
            }
            ,select:{users:true,id:true}
        });
        this.events.emit("group.user.added", {group,user:existingUser} );
        return { group:groupUsers };
    };
    async changeGroupOwner( userId:number , groupId:number , user:IUser ){
        let group=await this.prisma.group.findFirst({
            where : {
                id : groupId,
                users : {
                    some : {
                        id : userId
                    }
                }
            },
            include : { creator:true,users:true }
        });
        if(!group){
            throw new HttpException("group not found",400);
        };
        if(group.creatorId !== user.id){
            throw new HttpException("you are not allowed to change group admin",400);
        };
        const userExisting=await this.prisma.user.findFirst({
            where:{
                id:userId
            }
        });
        if(!userExisting){
            throw new HttpException("user not found",400);
        };
        group=await this.prisma.group.update({
            where : { id : groupId },
            data : {
                creatorId : userId
            },
            include : { creator:true,users:true }
        });
        this.events.emit("group.user.owner" , { group });
        return {group};
    };
    async leaveGroup( groupId:number , user:IUser ){
        let group=await this.prisma.group.findFirst({
            where : {
                id : groupId,
                users : {
                    some : {
                        id : user.id
                    }
                }
            },
            include : { users : true }
        });
        if(!group){
            throw new HttpException("group not found",400);
        };
        group=await this.prisma.group.update({
            where : {
                id : groupId
            },
            data : {
                users : {
                    disconnect : [
                        {id:user.id}
                    ]
                }
            },
            include : { users : true }
        });
        this.events.emit("group.user.left",{ group,user });
        return { group };
    };
};