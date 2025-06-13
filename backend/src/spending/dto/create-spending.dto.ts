import { IsNumber, IsString, IsBoolean, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSpendingDto {
  @ApiProperty({ example: 1, description: '카테고리 ID' })
  @IsNumber()
  categoryId: number;

  @ApiProperty({ example: '2024-04-28', description: '소비 날짜' })
  @IsDateString()
  date: Date;

  @ApiProperty({ example: '14:30', description: '소비 시간' })
  @IsString()
  time: string;

  @ApiProperty({ example: 15000, description: '소비 금액' })
  @IsNumber()
  amount: number;

  @ApiProperty({ example: true, description: '아낄 수 있는 돈인지 여부' })
  @IsBoolean()
  avoidable: boolean;

  @ApiProperty({ example: '점심 식사', description: '소비 항목 이름' })
  @IsString()
  title: string;

  @ApiProperty({ example: '회사 근처 식당', description: '소비 설명', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: '서울시 강남구', description: '소비 장소', required: false })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({ example: '김철수, 이영희', description: '함께한 사람들', required: false })
  @IsString()
  @IsOptional()
  companions?: string;
} 