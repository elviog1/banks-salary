import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Card, CardDocument } from './schema/card.schema';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';

@Injectable()
export class CardsService {
  constructor(
    @InjectModel(Card.name)
    private cardModel: Model<CardDocument>,
  ) {}

  async create(createCardDto: CreateCardDto, userId: string): Promise<Card> {
    try {
      const newCard = new this.cardModel({
        ...createCardDto,
        user: userId,
      });
      return await newCard.save();
    } catch (error) {
      throw new InternalServerErrorException('Error al crear la tarjeta');
    }
  }

  async findAllByUser(userId: string): Promise<Card[]> {
    try {
      return await this.cardModel.find({ user: userId }).exec();
    } catch (error) {
      throw new InternalServerErrorException('Error al obtener tarjetas');
    }
  }

  async deleteCard(cardId: string): Promise<void> {
    try {
      const result = await this.cardModel.findByIdAndDelete(cardId);
      if (!result) {
        throw new NotFoundException('Tarjeta no encontrada');
      }
    } catch (error) {
      throw new InternalServerErrorException('Error al eliminar la tarjeta');
    }
  }

  async updateBalance(cardId: string, amountChange: number): Promise<void> {
  try {
    await this.cardModel.findByIdAndUpdate(cardId, {
      $inc: { balance: amountChange },
    });
  } catch (error) {
    throw new InternalServerErrorException('Error al actualizar balance de la tarjeta');
  }
}

async getTotalBalanceByUser(userId: string): Promise<number> {
  try {
    const result = await this.cardModel.aggregate([
      { $match: { user: new Types.ObjectId(userId) } },
      { $group: { _id: null, totalBalance: { $sum: "$balance" } } },
    ]);
    return result.length > 0 ? result[0].totalBalance : 0;
  } catch (error) {
    throw new InternalServerErrorException('Error al obtener el balance total');
  }
}

async updateCard(cardId: string, updateDto: UpdateCardDto): Promise<Card> {
  try {
    const updatedCard = await this.cardModel.findByIdAndUpdate(
      cardId,
      { $set: updateDto },
      { new: true, runValidators: true }
    );

    if (!updatedCard) {
      throw new NotFoundException('Tarjeta no encontrada');
    }

    return updatedCard;
  } catch (error) {
    throw new InternalServerErrorException('Error al actualizar la tarjeta');
  }
}

}
