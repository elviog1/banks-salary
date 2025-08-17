import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  Get,
  Delete,
  HttpException,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { TransactionsService } from './transaction.service';

@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get('me')
  async getByUser(@Req() req) {
    try {
      const transactions = await this.transactionsService.findByUser(req.user.userId);
      return transactions;
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(':cardId')
  async create(
    @Param('cardId') cardId: string,
    @Body() dto: CreateTransactionDto,
    @Req() req,
  ) {
    return await this.transactionsService.create(dto, cardId, req.user.userId);
  }

  @Get(':cardId')
  async getByCard(@Param('cardId') cardId: string) {
    try {
      const transactions = await this.transactionsService.findByCard(cardId);
      return transactions;
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':transactionId')
  async delete(@Param('transactionId') transactionId: string) {
    try {
      await this.transactionsService.delete(transactionId);
      return {
        message: 'Transacción eliminada con éxito',
      };
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
