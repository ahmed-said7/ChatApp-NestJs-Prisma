import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateConversationDto {
    @IsNotEmpty()
    @IsString()
    name:string;
    @IsOptional()
    @IsInt()
    recipientId:number;
};