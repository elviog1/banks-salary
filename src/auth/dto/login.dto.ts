import { IsNotEmpty, IsString } from "class-validator";

export class loginDTO {
    @IsNotEmpty()
    @IsString()
    email:string
    
    @IsNotEmpty()
    @IsString()
    password:string


}