import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
  HttpException,
  HttpStatus,
  Patch,
} from '@nestjs/common';
import { Request } from 'express';
import { CardsService } from './cards.service';
import { CreateCardDto } from './dto/create-card.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UpdateCardDto } from './dto/update-card.dto';

@UseGuards(JwtAuthGuard)
@Controller('cards')
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Post()
  async create(@Body() dto: CreateCardDto, @Req() req: Request) {
    const user = req.user as any;
    if (!user?.userId) {
      throw new HttpException('Usuario no autenticado', HttpStatus.UNAUTHORIZED);
    }

    return this.cardsService.create(dto, user.userId);
  }

  @Get()
  async findAll(@Req() req: Request) {
    const user = req.user as any;
    if (!user?.userId) {
      throw new HttpException('Usuario no autenticado', HttpStatus.UNAUTHORIZED);
    }

    return this.cardsService.findAllByUser(user.userId);
  }

  @Delete(':cardId')
  async delete(@Param('cardId') cardId: string) {
    return this.cardsService.deleteCard(cardId);
  }

  @Get('total-balance')
  async getTotalBalance(@Req() req) {
    const userId = req.user.userId;
    const totalBalance = await this.cardsService.getTotalBalanceByUser(userId);
    return totalBalance
  }

  @Patch(':id')
  async updateCard(
    @Param('id') cardId: string,
    @Body() updateCardDto: UpdateCardDto,
  ) {
    return this.cardsService.updateCard(cardId, updateCardDto);
  }
}

