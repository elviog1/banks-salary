import {
  BadRequestException,
  ConflictException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schema/user.schema';
import { Model } from 'mongoose';
import { CreateUserDTO } from './dto/create-user.dto';
import * as bcrypt from 'bcryptjs';
import { UpdateUserDTO } from './dto/update-user.dto';
import { randomBytes } from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { EmailService } from 'src/email/email.service';
import { ResetPasswordDTO } from './dto/reset-password.dto';
@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private emailService: EmailService,
  ) {}

  async create(dto: CreateUserDTO): Promise<User> {
    try {
      const existingEmail = await this.userModel.findOne({ email: dto.email });
      if (existingEmail) {
        throw new ConflictException('El email ya está en uso.');
      }

      const existingUsername = await this.userModel.findOne({
        username: dto.username,
      });
      if (existingUsername) {
        throw new ConflictException('El nombre de usuario ya está en uso.');
      }

      const hashedPassword = await bcrypt.hash(dto.password, 10);

      const verificationToken = randomBytes(32).toString('hex');

      const createdUser = new this.userModel({
        email: dto.email,
        username: dto.username,
        password: hashedPassword,
        verificationToken,
      });

      return await createdUser.save();
    } catch (error) {
      if (error instanceof HttpException) {
        throw error; // Reenviá las excepciones conocidas
      }
      // Para errores internos no previstos (problemas de DB, por ejemplo)
      throw new BadRequestException('Error interno al crear usuario');
    }
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find();
  }

  async findUserByEmail(email: string): Promise<User> {
    try {
      const user = await this.userModel.findOne({ email });
      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }
      return user;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException('Error al buscar el usuario');
    }
  }

  async remove(id: string): Promise<{ message: string }> {
    try {
      const result = await this.userModel.findByIdAndDelete(id);
      if (!result) {
        throw new NotFoundException('Usuario no encontrado');
      }
      return { message: 'Usuario eliminado' };
    } catch (error) {
      throw new BadRequestException('Error al eliminar el usuario');
    }
  }
  async updateUser(id: string, dto: UpdateUserDTO): Promise<User> {
    try {
      const user = await this.userModel.findById(id);
      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }

      if (dto.username && dto.username !== user.username) {
        const existingUsername = await this.userModel.findOne({
          username: dto.username,
        });
        if (existingUsername) {
          throw new ConflictException('El nombre de usuario ya está en uso.');
        }
        user.username = dto.username;
      }

      if (dto.password) {
        const hashedPassword = await bcrypt.hash(dto.password, 10);
        user.password = hashedPassword;
      }

      return await user.save();
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException('Error al actualizar el usuario');
    }
  }

  async verifyUserByToken(token: string): Promise<User> {
    try {
      const user = await this.userModel.findOne({ verificationToken: token });

      if (!user) {
        throw new BadRequestException('Token inválido o expirado');
      }

      user.isVerified = true;
      user.verificationToken = undefined; // elimina el token una vez usado
      await user.save();

      return user;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException('Error al verificar el usuario');
    }
  }

  async requestPasswordReset(email: string): Promise<string> {
    try {
      const user = await this.userModel.findOne({ email });
      if (!user) {
        throw new BadRequestException('Usuario no encontrado');
      }

      const resetToken = uuidv4();
      user.resetToken = resetToken;
      user.resetTokenExpires = new Date(Date.now() + 60 * 1000); // 1 min

      await user.save();

      await this.emailService.sendPasswordResetEmail(email);

      return 'Se ha enviado un correo con instrucciones para restablecer tu contraseña.';
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException('Error al enviar la solicitud de cambio de contraseña');
    }
  }

  async resetPassword(token: string, newPassword: ResetPasswordDTO): Promise<any> {
    try {
      const user = await this.userModel.findOne({
        resetToken: token,
        resetTokenExpires: { $gt: new Date() },
      });

      if (!user) {
        throw new BadRequestException('Token inválido o expirado.');
      }

      // Encriptar nueva contraseña
      user.password = await bcrypt.hash(newPassword.password, 10);
      user.resetToken = undefined;
      user.resetTokenExpires = undefined;
      await user.save();
      return 'Tu contraseña ha sido restablecida con éxito.';
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
