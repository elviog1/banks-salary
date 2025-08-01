import { IsNotEmpty, IsString, MinLength } from "class-validator";

export class CreateUserDTO{
    @IsString()
    @IsNotEmpty()
    @MinLength(4)
    username:string

    @IsString()
    @IsNotEmpty()
    email:string

    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    password:string
}