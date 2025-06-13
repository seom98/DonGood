import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ example: '식비', description: '카테고리 이름' })
  @IsString()
  @IsNotEmpty()
  name: string;
} 