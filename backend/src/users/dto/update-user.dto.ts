import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({ example: 'user@example.com', description: '사용자 이메일', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: '홍길동', description: '사용자 닉네임', required: false })
  @IsString()
  @IsOptional()
  nickname?: string;

  @ApiProperty({ example: 'newpassword123', description: '사용자 비밀번호 (최소 6자)', required: false })
  @IsString()
  @IsOptional()
  @MinLength(6)
  password?: string;
} 