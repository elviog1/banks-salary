// src/transactions/dto/create-transaction.dto.ts
import { IsNumber, IsString, IsDateString, IsNotEmpty } from 'class-validator';

export class CreateTransactionDto {
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  amount: number; // puede ser negativo

  @IsDateString()
  date: string;
}
