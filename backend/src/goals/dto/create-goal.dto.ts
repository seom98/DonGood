import { IsNumber, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { GoalType } from '../types/goal-type.enum';

export class CreateGoalDto {
  @ApiProperty({ example: 100000, description: '목표 금액' })
  @IsNumber()
  amount: number;

  @ApiProperty({ example: 'MONTHLY', description: '목표 유형 (DAILY/MONTHLY)' })
  @IsEnum(GoalType)
  type: GoalType;

  @ApiProperty({ example: '2024-04-28', description: '목표 날짜' })
  @IsDateString()
  date: Date;
} 