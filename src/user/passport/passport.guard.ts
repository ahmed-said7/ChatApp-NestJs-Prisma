import { ExecutionContext, Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
@Injectable()
export class LocalGuard extends AuthGuard("local") {
    constructor(){
        super();
    };
    async canActivate(context: ExecutionContext){
        const result=await super.canActivate(context) as boolean;
        const req=context.switchToHttp().getRequest();
        await super.logIn(req)
        return result;
    };
};