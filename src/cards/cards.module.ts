// src/cards/cards.module.ts
import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Card, CardSchema } from './schema/card.schema';
import { CardsService } from './cards.service';
import { CardsController } from './cards.controller';
import { UsersModule } from 'src/users/users.module';
import { TransactionsModule } from 'src/transaction/transaction.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Card.name, schema: CardSchema }]),UsersModule,forwardRef(() => TransactionsModule),
  ],
  controllers: [CardsController],
  providers: [CardsService],
  exports: [CardsService], // Por si lo usás desde transactions
})
export class CardsModule {}
