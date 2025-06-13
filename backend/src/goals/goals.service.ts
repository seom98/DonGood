import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { GoalType } from './types/goal-type.enum';

@Injectable()
export class GoalsService {
  constructor(private prisma: PrismaService) {}

  async createSpendingGoal(userId: number, createGoalDto: CreateGoalDto) {
    return this.prisma.spendingGoal.create({
      data: {
        ...createGoalDto,
        userId,
      },
    });
  }

  async createCategoryGoal(categoryId: number, createGoalDto: CreateGoalDto) {
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new NotFoundException('카테고리를 찾을 수 없습니다.');
    }

    return this.prisma.categoryGoal.create({
      data: {
        ...createGoalDto,
        categoryId,
      },
    });
  }

  async getUserGoals(userId: number) {
    const [spendingGoals, categories] = await Promise.all([
      this.prisma.spendingGoal.findMany({
        where: { userId },
        orderBy: { date: 'desc' },
      }),
      this.prisma.category.findMany({
        where: { userId },
        include: {
          goals: {
            orderBy: { date: 'desc' },
          },
        },
      }),
    ]);

    return {
      spendingGoals,
      categoryGoals: categories.flatMap((category) => category.goals),
    };
  }

  async getGoalProgress(userId: number, month: number, year: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const [monthlyGoal, dailyGoals, spendings] = await Promise.all([
      this.prisma.spendingGoal.findFirst({
        where: {
          userId,
          type: GoalType.MONTHLY,
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
      }),
      this.prisma.spendingGoal.findMany({
        where: {
          userId,
          type: GoalType.DAILY,
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
      }),
      this.prisma.spending.findMany({
        where: {
          userId,
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
      }),
    ]);

    const totalSpent = spendings.reduce((sum, spending) => sum + spending.amount, 0);
    const dailySpent = spendings.reduce((acc, spending) => {
      const date = spending.date.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date] += spending.amount;
      return acc;
    }, {});

    return {
      monthlyGoal,
      dailyGoals,
      totalSpent,
      dailySpent,
    };
  }
} 