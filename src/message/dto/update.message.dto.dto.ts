import { IsInt, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class UpdateMessageDto {
    @IsOptional()
    @IsString()
    content:string;
    
};