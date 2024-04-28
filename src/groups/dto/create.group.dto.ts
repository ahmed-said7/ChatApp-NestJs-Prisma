import { ArrayMinSize, IsArray, IsNotEmpty, IsNumber, IsString } from "class-validator";
export class CreateGroupDto {
    @IsNotEmpty()
    @IsString()
    name: string;
    @IsArray()
    @ArrayMinSize(1)
    @IsNumber({},{each:true})
    users: number[];
};