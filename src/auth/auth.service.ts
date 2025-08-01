import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcryptjs';
@Injectable()
export class AuthService {
    constructor(private readonly usersService:UsersService, private readonly jwtService:JwtService){}

    async validateEmail(email:string,password:string): Promise<any>{
        const user = await this.usersService.findUserByEmail(email)
        if(!user.isVerified){
            throw new UnauthorizedException('No estas verificado')
        }

        const isPasswordValid = await bcrypt.compare(password,user.password)
        if(!isPasswordValid){
            throw new UnauthorizedException('Credenciales incorrecta')
        }
        return{name:user.username,email:user.email}
    }

    async login(user:any){
        const payload = {email:user.email,username: user.username}
        return {access_token:this.jwtService.sign(payload)}
    }
}
