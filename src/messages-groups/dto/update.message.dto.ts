import { IsInt, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class UpdateGroupMessageDto {
    @IsOptional()
    @IsString()
    content:string;
    
};