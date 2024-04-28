





import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Request } from "express";
import { Observable } from "rxjs";


@Injectable()
export class AuthenticationGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean  {
        const req=context.switchToHttp().getRequest<Request>();
        console.log(req.session);
        return req.isAuthenticated();
    };
}