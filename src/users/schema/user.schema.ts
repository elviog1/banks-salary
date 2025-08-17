import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;
@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({default:false})
  isVerified:boolean

  @Prop()
  verificationToken: string;

  @Prop()
  resetToken?:string

  @Prop()
  resetTokenExpires?:Date
}

export const UserSchema = SchemaFactory.createForClass(User);
