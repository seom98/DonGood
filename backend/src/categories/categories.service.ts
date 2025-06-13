import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, createCategoryDto: CreateCategoryDto) {
    return this.prisma.category.create({
      data: {
        name: createCategoryDto.name,
        userId: userId,
      },
    });
  }

  async findAll(userId: number) {
    return this.prisma.category.findMany({
      where: { userId },
      include: {
        goals: true,
        spendings: true,
      },
    });
  }

  async findOne(id: number) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        goals: true,
        spendings: true,
      },
    });

    if (!category) {
      throw new NotFoundException('카테고리를 찾을 수 없습니다.');
    }

    return category;
  }

  async getPopularCategories() {
    return this.prisma.popularCategory.findMany({
      orderBy: {
        usageCount: 'desc',
      },
      take: 10,
    });
  }

  async incrementPopularCategory(name: string) {
    return this.prisma.popularCategory.upsert({
      where: { name },
      create: {
        name,
        usageCount: 1,
      },
      update: {
        usageCount: {
          increment: 1,
        },
      },
    });
  }
} 