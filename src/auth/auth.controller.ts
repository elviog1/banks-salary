import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { loginDTO } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDTO: loginDTO) {
    const user = await this.authService.validateEmail(
      loginDTO.email,
      loginDTO.password,
    );
    const token = await this.authService.login(user);

    return {
      token: token.access_token,
      userName: user.username
    };
  }
}
