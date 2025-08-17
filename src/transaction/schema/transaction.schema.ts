// src/transactions/schema/transaction.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';
import { Card } from 'src/cards/schema/card.schema';

export type TransactionDocument = Transaction & Document;

@Schema({ timestamps: true })
export class Transaction {
  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  amount: number; // positivo o negativo

  @Prop({ required: true })
  date: Date;

  @Prop({ type: Types.ObjectId, ref: Card.name, required: true })
  card: Types.ObjectId;

   @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
