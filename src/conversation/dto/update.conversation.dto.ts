import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class UpdateConversationDto {
    @IsOptional()
    @IsString()
    name:string;
    @IsOptional()
    @IsInt()
    authorId:number;
};