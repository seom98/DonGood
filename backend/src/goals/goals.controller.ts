import { Controller, Get, Post, Body, UseGuards, Req, Query, Param } from '@nestjs/common';
import { GoalsService } from './goals.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('goals')
@Controller('goals')
@UseGuards(JwtAuthGuard)
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @Post('spending')
  @ApiOperation({ summary: '소비 목표 생성' })
  @ApiResponse({ status: 201, description: '소비 목표 생성 성공' })
  async createSpendingGoal(@Req() req, @Body() createGoalDto: CreateGoalDto) {
    return this.goalsService.createSpendingGoal(req.user.id, createGoalDto);
  }

  @Post('category/:categoryId')
  @ApiOperation({ summary: '카테고리별 목표 생성' })
  @ApiResponse({ status: 201, description: '카테고리별 목표 생성 성공' })
  @ApiResponse({ status: 404, description: '카테고리를 찾을 수 없음' })
  async createCategoryGoal(
    @Param('categoryId') categoryId: string,
    @Body() createGoalDto: CreateGoalDto,
  ) {
    return this.goalsService.createCategoryGoal(+categoryId, createGoalDto);
  }

  @Get()
  @ApiOperation({ summary: '사용자의 모든 목표 조회' })
  @ApiResponse({ status: 200, description: '목표 목록 조회 성공' })
  async getUserGoals(@Req() req) {
    return this.goalsService.getUserGoals(req.user.id);
  }

  @Get('progress')
  @ApiOperation({ summary: '목표 진행 상황 조회' })
  @ApiResponse({ status: 200, description: '목표 진행 상황 조회 성공' })
  @ApiQuery({ name: 'month', required: true, type: Number })
  @ApiQuery({ name: 'year', required: true, type: Number })
  async getGoalProgress(
    @Req() req,
    @Query('month') month: number,
    @Query('year') year: number,
  ) {
    return this.goalsService.getGoalProgress(req.user.id, month, year);
  }
} 