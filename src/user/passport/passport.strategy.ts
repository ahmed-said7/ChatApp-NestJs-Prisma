import { HttpException, Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport"
import { Strategy } from "passport-local";
import { PrismaService } from "src/prisma/prisma.service";
import * as bcryptjs from "bcryptjs";


@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy){
    constructor(private prisma:PrismaService){
        super({usernameField:"email",passwordField:"password"});
    };
    async validate(email:string,password:string){
        const user=await this.prisma.user.findFirst({where:{email}});
        if( ! user ){
            throw new HttpException("user not found",400);
        };
        const valid= await bcryptjs.compare(password,user.password);
        if(!valid){
            throw new HttpException("password is not incorrect",400);
        };
        console.log(user,"@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
        return user;
    };
};