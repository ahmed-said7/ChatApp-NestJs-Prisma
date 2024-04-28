import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { CreateUserDto } from "./dtos/create.user.dtos";
import { AuthService, IUser } from "./user.service";
import { LocalGuard } from "src/user/passport/passport.guard";
import { Request } from "express";
import { AuthenticationGuard } from "src/guards/auth.guard";
import { AuthUser } from "src/decorator/auth.decorator";


@Controller("user")
export class AuthController {
    constructor(private authService: AuthService){};
    @Post("register")
    createUser(@Body() body:CreateUserDto){
        return this.authService.register(body);
    };
    @Post("login")
    @UseGuards(LocalGuard)
    Login(@Req() req:Request){
        return { session:req.session }
    };
    @Get()
    @UseGuards(AuthenticationGuard)
    getAllUsers(@Req() req:Request){
        return {"users":req.user}
    };
    // @Get("conversations")
    // getLoggedUserConversations(@AuthUser() user:IUser){
    //     return this.authService.getUserConversation(user);
    // };
}