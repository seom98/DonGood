import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSpendingDto } from './dto/create-spending.dto';

@Injectable()
export class SpendingService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, createSpendingDto: CreateSpendingDto) {
    const category = await this.prisma.category.findUnique({
      where: { id: createSpendingDto.categoryId },
    });

    if (!category) {
      throw new NotFoundException('카테고리를 찾을 수 없습니다.');
    }

    const spending = await this.prisma.spending.create({
      data: {
        ...createSpendingDto,
        userId,
      },
    });

    // 레벨 포인트 증가 (소비 금액의 1%로 설정)
    const points = Math.floor(createSpendingDto.amount * 0.01);
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        levelPoint: {
          increment: points,
        },
      },
    });

    return spending;
  }

  async findAll(userId: number, month?: number, year?: number) {
    const where: any = { userId };

    if (month && year) {
      where.date = {
        gte: new Date(year, month - 1, 1),
        lt: new Date(year, month, 1),
      };
    }

    return this.prisma.spending.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: {
        date: 'desc',
      },
    });
  }

  async getMonthlyStatistics(userId: number, month: number, year: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const spendings = await this.prisma.spending.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        category: true,
      },
    });

    const totalAmount = spendings.reduce((sum, spending) => sum + spending.amount, 0);
    const avoidableAmount = spendings
      .filter((spending) => spending.avoidable)
      .reduce((sum, spending) => sum + spending.amount, 0);

    const categoryStatistics = spendings.reduce((acc, spending) => {
      const categoryName = spending.category.name;
      if (!acc[categoryName]) {
        acc[categoryName] = 0;
      }
      acc[categoryName] += spending.amount;
      return acc;
    }, {});

    return {
      totalAmount,
      avoidableAmount,
      categoryStatistics,
    };
  }

  async getCategoryAverage(userId: number, categoryId: number) {
    const spendings = await this.prisma.spending.findMany({
      where: {
        categoryId,
      },
      select: {
        amount: true,
      },
    });

    if (spendings.length === 0) {
      return 0;
    }

    const totalAmount = spendings.reduce((sum, spending) => sum + spending.amount, 0);
    return Math.floor(totalAmount / spendings.length);
  }
} 