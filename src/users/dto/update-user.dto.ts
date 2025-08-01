import { IsOptional, IsString, MinLength } from "class-validator";

export class UpdateUserDTO{
    @IsString()
    @IsOptional()
    @MinLength(4)
    username?:string
    
    @IsString()
    @IsOptional()
    @MinLength(6)
    password?:string
}