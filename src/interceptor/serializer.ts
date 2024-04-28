import { CallHandler , ExecutionContext , Injectable , NestInterceptor } from "@nestjs/common";
import { Exclude , Expose } from "class-transformer";
import { map } from "rxjs"
import { IUser } from "src/user/user.service";

interface IConversation {
    id:number;
    creatorId:number;
    recipientId:number;
    name:string;
    messages: {
        creator:IUser;
        creatorId:number;
        content:string;
        id:number;
        createdAt:Date; }[];
};

export class SerializerConversationDto {
    id:number;
    creatorId:number;
    recipientId:number;
    name:string;
    @Exclude()
    messages: {
        creator:IUser;
        creatorId:number;
        content:string;
        id:number;
        createdAt:Date; 
        }[];
    // lastMessage: {
    //     creator:IUser;
    //     creatorId:number;
    //     content:string;
    //     id:number;
    //     createdAt:Date; 
    //     }
    @Expose( { name : "lastMessage" } )
    get lastMessage(){
        return this.messages[0];
    };
    constructor (properties:Partial<SerializerConversationDto>){
        Object.assign(this,properties );
    };
};

@Injectable()
export class ChatSerializerInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler<any>){
        return next.handle().pipe( map( ({conversations}:{ conversations:IConversation[] })=>{
            console.log(conversations);
            return { conversations 
                : 
                conversations.map( ( field ) => new SerializerConversationDto(field) || undefined  ) };
        } ) );
    }
};