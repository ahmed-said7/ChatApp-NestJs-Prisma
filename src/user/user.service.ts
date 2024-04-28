import { HttpException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateUserDto } from "./dtos/create.user.dtos";
import * as bcryptjs from "bcryptjs";

export interface IUser {
    id:number;
    email:string;
    password:string;
    username:string;
};

@Injectable()
export class AuthService {
    constructor(private prisma:PrismaService){};
    async register(body:CreateUserDto){
        let user =await this.prisma.user.findFirst({where:{email:body.email}});
        if(user){
            throw new HttpException("user email already exists",400);
        };
        body.password=await bcryptjs.hash(body.password,10);
        user=await this.prisma.user.create({data:body});
        return {user};
    };
    // async getUserConversation(user:IUser){
    //     const conversation= await this.prisma.user.findFirst({
    //         where : {id:user.id},
    //         select: { conversations:true , id : true }
    //     });
    //     if(!conversation){
    //         throw new HttpException("no conversation found",400);
    //     };
    //     return { conversation };
    // };
    async getUser(id:number){
        const user= await this.prisma.user.findFirst({
            where : {id:id}
        });
        if(!user){
            throw new HttpException("no user found",400);
        };
        return { user };
    };
    async login(email:string,password:string){
        let user =await this.prisma.user.findFirst({where:{email}});
        if(!user){
            throw new HttpException("user email not found",400);
        };
        const valid=await bcryptjs.compare(password,user.password);
        console.log(valid);
        if(!valid){
            throw new HttpException("password or email is not valid",400);
        };
        return {status:`login successfully with username=> ${user.username}` }
    };
};