import { HttpException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { IUser } from "src/user/user.service";


@Injectable()
export class FriendService {
    constructor( private prisma:PrismaService ){};
    async getFriends(user:IUser){
        const friends=await this.prisma.friend.findMany({
            where:{
                OR : [
                    {senderId:user.id},
                    {recieverId:user.id}
                ]
            },
            skip:0,
            take:15
        });
        return { friends }
    };
    async deleteFriend(userId:number,user:IUser){
        const friendExist=await this.prisma.friend.findFirst({
            where:{
                OR : [
                    { senderId:user.id , recieverId : userId },
                    { recieverId:user.id , senderId : userId }
                ]
            }
        });
        if(!friendExist){
            throw new HttpException("you are not friends",400);
        };
        await this.prisma.request.deleteMany({
            where : { 
                AND : [
                    {
                        OR : [
                            { senderId:user.id , recieverId : userId },
                            { recieverId:user.id , senderId : userId }
                        ]
                    },
                    {
                        status : "accepted"
                    }
                ]
            }
        });
        await this.prisma.friend.deleteMany({
            where : {
                    OR : [
                        { senderId:user.id , recieverId : userId },
                        { recieverId:user.id , senderId : userId }
                    ]
            }
        });
        return { status : "deleted" };
    };
};