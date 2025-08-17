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
  Res,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDTO } from './dto/create-user.dto';
import { User } from './schema/user.schema';
import { UpdateUserDTO } from './dto/update-user.dto';
import { EmailService } from 'src/email/email.service';
import { ResetPasswordDTO } from './dto/reset-password.dto';
import { Response } from 'express';

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
  
  @Patch(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() dto: UpdateUserDTO,
  ): Promise<User> {
    const user = await this.usersService.updateUser(id, dto);
    return user;
  }

  @Get('verify/:token')
  async verify(@Param('token') token: string, @Res() res: Response) {
    const user = await this.usersService.verifyUserByToken(token);

    if (!user) {
      return res.status(400).send('Token inválido o ya usado');
    }

    // ✅ Redireccionar al login del frontend
    return res.redirect('http://localhost:3000/login');
  }

  @Post('request-password-reset')
  async requestPasswordReset(@Body('email') email: string) {
    await this.usersService.requestPasswordReset(email);
    return { message: 'Se ha enviado el correo de recuperación' };
  }

  @Post('reset-password/:token')
  async resetPassword(
    @Param('token') token: string,
    @Body() newPassword: ResetPasswordDTO,
  ) {
    await this.usersService.resetPassword(token, newPassword);
    return { message: 'Tu contraseña ha sido restablecida con éxito.' };
  }
}
