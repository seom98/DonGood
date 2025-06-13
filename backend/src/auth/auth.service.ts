import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다.');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다.');
    }

    const payload = { sub: user.id, email: user.email };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async register(createUserDto: CreateUserDto) {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: createUserDto.email },
          { nickname: createUserDto.nickname }
        ]
      }
    });

    if (existingUser) {
      throw new BadRequestException('이미 사용 중인 이메일 또는 닉네임입니다.');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const newUser = await this.prisma.user.create({
      data: {
        email: createUserDto.email,
        password: hashedPassword,
        nickname: createUserDto.nickname,
        level: 1,
        levelPoint: 0,
      },
    });

    return {
      id: newUser.id,
      email: newUser.email,
      nickname: newUser.nickname,
      level: newUser.level,
      levelPoint: newUser.levelPoint,
    };
  }

  async increaseLevelPoints(userId: number, points: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('사용자를 찾을 수 없습니다.');
    }

    let newLevelPoint = user.levelPoint + points;
    let newLevel = user.level;

    while (newLevelPoint >= 100) {
      newLevel += 1;
      newLevelPoint -= 100;
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        level: newLevel,
        levelPoint: newLevelPoint,
      },
    });
  }
} 