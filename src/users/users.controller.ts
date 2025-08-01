import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDTO } from './dto/create-user.dto';
import { User } from './schema/user.schema';
import { UpdateUserDTO } from './dto/update-user.dto';
import { EmailService } from 'src/email/email.service';
import { ResetPasswordDTO } from './dto/reset-password.dto';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly emailService: EmailService,
  ) {}

  @Post('register')
  async register(@Body() createUserDTO: CreateUserDTO) {
    try {
      const user = await this.usersService.create(createUserDTO);

      await this.emailService.sendVerificationEmail(user.username, user.email);

      return {
        message:
          'Usuario creado exitosamente. Revisa tu correo para verificar tu cuenta.',
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error; // ya te devuelve 409 con el mensaje correcto
      }
      throw new BadRequestException('No se pudo registrar el usuario.');
    }
  }

  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  @Get(':email')
  async findUserByEmail(@Param('email') email: string) {
    return this.usersService.findUserByEmail(email);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.usersService.remove(id);
  }

  /* @Patch('verify/:email')
  async verifyUser(@Param('email') email: string) {
    const user = await this.usersService.userVerified(email);
    return user;
  } */

  @Patch(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() dto: UpdateUserDTO,
  ): Promise<User> {
    const user = await this.usersService.updateUser(id, dto);
    return user;
  }

  @Get('verify/:token')
  async verify(@Param('token') token: string) {
    const user = await this.usersService.verifyUserByToken(token);
    return { message: 'Cuenta verificada con éxito. Ya podés iniciar sesión.' };
  }

  @Post('request-password-reset')
  async requestPasswordReset(@Body('email') email: string) {
    return this.usersService.requestPasswordReset(email);
  }

  @Post('reset-password/:token')
  async resetPassword(
    @Param('token') token: string,
    @Body() newPassword: ResetPasswordDTO,
  ) {
    return this.usersService.resetPassword(token, newPassword);
  }
}
