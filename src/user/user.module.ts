import { Module } from "@nestjs/common";
import { AuthService } from "./user.service";
import { LocalStrategy } from "src/user/passport/passport.strategy";
import { PrismaModule } from "src/prisma/prisma.module";
import { AuthController } from "./user.controller";
import { UserSerializer } from "src/user/passport/passport.serializer";
import { PassportModule } from "@nestjs/passport";

@Module({
    providers:[AuthService,LocalStrategy,UserSerializer],
    controllers:[AuthController],
    imports:[PrismaModule
        ,PassportModule.register({session:true})
    ]
})
export class AuthModule {};