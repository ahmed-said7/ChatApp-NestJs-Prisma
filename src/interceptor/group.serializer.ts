import { CallHandler , ExecutionContext , Injectable , NestInterceptor } from "@nestjs/common";
import { Exclude , Expose } from "class-transformer";
import { map } from "rxjs"
import { IUser } from "src/user/user.service";

interface IGroup {
    id:number;
    creatorId:number;
    users : number[];
    name:string;
    messages: {
        creator:IUser;
        creatorId:number;
        content:string;
        id:number;
        createdAt:Date; }[];
};

export class SerializerGroupDto {
    id:number;
    creatorId:number;
    users : number[];
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
    constructor (properties:Partial<SerializerGroupDto>){
        Object.assign(this,properties );
    };
};

@Injectable()
export class GroupSerializerInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler<any>){
        return next.handle().pipe( map( ({groups}:{ groups:IGroup[] })=>{
            return { groups
                : 
                groups.map( ( field ) => new SerializerGroupDto(field) || undefined  ) };
        } ) );
    }
};