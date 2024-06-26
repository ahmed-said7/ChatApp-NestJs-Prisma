import { IsInt, IsNotEmpty, IsString } from "class-validator";

export class CreateGroupMessageDto {
    @IsNotEmpty()
    @IsString()
    content:string;
    @IsNotEmpty()
    @IsInt()
    groupId:number;
};