import { Injectable } from "@nestjs/common";
import { connected } from "process";
import { Socket } from "socket.io"
import { IUser } from "src/user/user.service"

export interface AuthSocket extends Socket {
    user?:IUser;
};


@Injectable()
export class HandleSocketService {
    private connectedUsers=new Map<number,AuthSocket>()
    setSocket(id:number,socket:AuthSocket){
        this.connectedUsers.set(id,socket);
    };
    getSocket(id:number){
        return this.connectedUsers.get(id);
    };
    deleteSocket(id:number){
        this.connectedUsers.delete(id);
    };
};