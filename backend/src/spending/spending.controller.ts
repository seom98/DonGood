import { Controller, Get, Post, Body, UseGuards, Req, Query } from '@nestjs/common';
import { SpendingService } from './spending.service';
import { CreateSpendingDto } from './dto/create-spending.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('spending')
@Controller('spending')
@UseGuards(JwtAuthGuard)
export class SpendingController {
  constructor(private readonly spendingService: SpendingService) {}

  @Post()
  @ApiOperation({ summary: '소비 기록 생성' })
  @ApiResponse({ status: 201, description: '소비 기록 생성 성공' })
  @ApiResponse({ status: 404, description: '카테고리를 찾을 수 없음' })
  async create(@Req() req, @Body() createSpendingDto: CreateSpendingDto) {
    return this.spendingService.create(req.user.id, createSpendingDto);
  }

  @Get()
  @ApiOperation({ summary: '소비 기록 조회' })
  @ApiResponse({ status: 200, description: '소비 기록 목록 조회 성공' })
  @ApiQuery({ name: 'month', required: false, type: Number })
  @ApiQuery({ name: 'year', required: false, type: Number })
  async findAll(
    @Req() req,
    @Query('month') month?: number,
    @Query('year') year?: number,
  ) {
    return this.spendingService.findAll(req.user.id, month, year);
  }

  @Get('statistics')
  @ApiOperation({ summary: '월별 소비 통계 조회' })
  @ApiResponse({ status: 200, description: '월별 소비 통계 조회 성공' })
  @ApiQuery({ name: 'month', required: true, type: Number })
  @ApiQuery({ name: 'year', required: true, type: Number })
  async getMonthlyStatistics(
    @Req() req,
    @Query('month') month: number,
    @Query('year') year: number,
  ) {
    return this.spendingService.getMonthlyStatistics(req.user.id, month, year);
  }

  @Get('category-average/:categoryId')
  @ApiOperation({ summary: '카테고리별 평균 소비 금액 조회' })
  @ApiResponse({ status: 200, description: '카테고리별 평균 소비 금액 조회 성공' })
  async getCategoryAverage(@Req() req, @Query('categoryId') categoryId: number) {
    return this.spendingService.getCategoryAverage(req.user.id, categoryId);
  }
} 