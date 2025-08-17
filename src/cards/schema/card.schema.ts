// src/cards/schema/card.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from 'src/users/schema/user.schema';

export type CardDocument = Card & Document;

@Schema({ timestamps: true })
export class Card {
  @Prop({ required: true })
  name: string; // Ej: BBVA, Naranja, etc.

  @Prop({ required: true })
  color: string; // Para mostrar en UI, ej: #0EA5E9

  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  user: Types.ObjectId;

  @Prop({ default: 0 })  // balance inicial en 0
  balance: number;
}

export const CardSchema = SchemaFactory.createForClass(Card);
