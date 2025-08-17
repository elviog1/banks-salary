import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transaction, TransactionDocument } from './schema/transaction.schema';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { CardsService } from 'src/cards/cards.service';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<TransactionDocument>,
    private readonly cardsService: CardsService,
  ) {}

  async create(
    createTransactionDto: CreateTransactionDto,
    cardId: string,
    userId: string,
  ): Promise<Transaction> {
    try {
      const transaction = await this.transactionModel.create({
        ...createTransactionDto,
        card: cardId,
        user: userId,
      });

      // Actualizar balance de la card
      await this.cardsService.updateBalance(cardId, transaction.amount);

      return transaction;
    } catch (error) {
      throw new InternalServerErrorException('Error al crear la transacción');
    }
  }

 async findByUser(userId: string): Promise<Transaction[]> {
  try {
    const transactions = await this.transactionModel
      .find({ user: userId })
      .populate('card') 
      //.sort({ date: -1 })
      .exec();
      return transactions
  } catch (error) {
    throw new InternalServerErrorException(
      'Error al obtener las transacciones del usuario',
    );
  }
}

  async findByCard(cardId: string): Promise<Transaction[]> {
    try {
      return await this.transactionModel
        .find({ card: cardId })
        .sort({ date: -1 })
        .exec();
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al obtener las transacciones',
      );
    }
  }

  async delete(transactionId: string): Promise<void> {
    try {
      const transaction = await this.transactionModel.findById(transactionId);
      if (!transaction) {
        throw new NotFoundException('Transacción no encontrada');
      }

      await this.transactionModel.findByIdAndDelete(transactionId);

      await this.cardsService.updateBalance(
        transaction.card.toString(),
        -transaction.amount,
      );
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        'Error al eliminar la transacción',
      );
    }
  }
}
