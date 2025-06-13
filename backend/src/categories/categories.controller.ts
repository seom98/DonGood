import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('categories')
@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @ApiOperation({ summary: '카테고리 생성' })
  @ApiResponse({ status: 201, description: '카테고리 생성 성공' })
  async create(@Req() req, @Body() createCategoryDto: CreateCategoryDto) {
    const category = await this.categoriesService.create(req.user.id, createCategoryDto);
    await this.categoriesService.incrementPopularCategory(createCategoryDto.name);
    return category;
  }

  @Get()
  @ApiOperation({ summary: '사용자의 모든 카테고리 조회' })
  @ApiResponse({ status: 200, description: '카테고리 목록 조회 성공' })
  async findAll(@Req() req) {
    return this.categoriesService.findAll(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: '특정 카테고리 조회' })
  @ApiResponse({ status: 200, description: '카테고리 조회 성공' })
  @ApiResponse({ status: 404, description: '카테고리를 찾을 수 없음' })
  async findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(+id);
  }

  @Get('popular')
  @ApiOperation({ summary: '인기 카테고리 조회' })
  @ApiResponse({ status: 200, description: '인기 카테고리 목록 조회 성공' })
  async getPopularCategories() {
    return this.categoriesService.getPopularCategories();
  }
} 