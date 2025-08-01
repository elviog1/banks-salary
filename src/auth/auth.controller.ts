import { Body, Controller, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { loginDTO } from './dto/login.dto';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService:AuthService){}

    @Post('login')
    async login(@Body() loginDTO:loginDTO, @Res({passthrough:true}) res:Response){
        const user = await this.authService.validateEmail(loginDTO.email,loginDTO.password)
        const token = await this.authService.login(user)

        res.cookie('access_token', token.access_token,{
            httpOnly:true,
            sameSite: 'lax',
            maxAge: 1000 * 60 * 60 *24 // 1 dia
        })
        return {message: 'Login exitoso'}
    }

    
}
