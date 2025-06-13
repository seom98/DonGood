import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'user@example.com', description: '사용자 이메일' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', description: '사용자 비밀번호 (최소 6자)' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: '홍길동', description: '사용자 닉네임' })
  @IsString()
  nickname: string;
} 