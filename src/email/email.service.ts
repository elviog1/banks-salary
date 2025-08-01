import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as nodemailer from 'nodemailer';
import { User, UserDocument } from 'src/users/schema/user.schema';
import { UsersModule } from 'src/users/users.module';
@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(
    @InjectModel(User.name) private readonly usersModel: Model<UserDocument>,
  ) {
    this.transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.GOOGLE_EMAIL,
        pass: process.env.GOOGLE_PASSWORD,
      },
    });
  }

  async sendVerificationEmail(name: string, email: string): Promise<void> {
    const user = await this.usersModel.findOne({ email });
    if (!user || !user.verificationToken) {
      throw new Error('No se encontró el usuario o token no definido');
    }
    const verificationLink = `${process.env.URL_BACKEND}/users/verify/${user.verificationToken}`;

    const emailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <div style="background-color: #00638C; color: white; text-align: center; padding: 20px;">
            <h1 style="margin: 0; font-size: 24px;">Bienvenido, ${name}!</h1>
          </div>
          <div style="padding: 20px; background-color: #f9f9f9;">
            <p style="font-size: 18px; color: #333; margin-bottom: 10px;">
              Gracias por registrarte. Haz clic en el enlace para verificar tu cuenta:
            </p>
            <div style="text-align: center; margin-top: 20px;">
              <a href="${verificationLink}" style="padding: 10px 20px; color: white; background-color: #00638C; text-decoration: none; border-radius: 5px;">
                Verificar Cuenta
              </a>
            </div>
          </div>
        </div>`,
    };
    await this.transporter.sendMail(emailOptions);
  }

  async sendPasswordResetEmail(email:string){
    const user = await this.usersModel.findOne({email})
    if (!user) {
      throw new Error('No se encontró el usuario');
    }
    const resetLink =`${process.env.URL_FRONTEND}/reset-password/${user.resetToken}`

    const mailOptions = {
      from: process.env.GOOGLE_EMAIL,
      to: email,
      subject: 'Recuperación de contraseña',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
          <h2 style="color: #00638C;">Hola, ${user.username}</h2>
          <p>Hemos recibido una solicitud para restablecer tu contraseña.</p>
          <p>Haz clic en el siguiente enlace para continuar:</p>
          <a href="${resetLink}" style="padding: 10px 20px; color: white; background-color: #00638C; text-decoration: none; border-radius: 5px;">Restablecer contraseña</a>
          <p>Si no solicitaste este cambio, puedes ignorar este mensaje.</p>
        </div>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }
}
