import { Injectable } from "@nestjs/common";
import { PassportSerializer } from "@nestjs/passport";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class UserSerializer extends PassportSerializer {
    constructor(private prisma:PrismaService){
        super();
    };
    serializeUser(user: {id:number}, done: Function) {
        console.log(user,"11111111111111111111111");
        return done(null, user.id);
    };
    async deserializeUser(id:number, done: Function) {
        const user=await this.prisma.user.findFirst({where:{id}});
        console.log(id,"222222222222222222");
        if(!user){
            return done(null, false);
        };
        return done(null, user);
    };
};