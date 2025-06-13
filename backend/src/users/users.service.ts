import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany();
  }

  async findOne(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: createUserDto.email },
          { nickname: createUserDto.nickname }
        ]
      }
    });

    if (existingUser) {
      throw new ConflictException('이미 사용 중인 이메일 또는 닉네임입니다.');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    return this.prisma.user.create({
      data: {
        email: createUserDto.email,
        password: hashedPassword,
        nickname: createUserDto.nickname,
        level: 1,
        levelPoint: 0,
      },
    });
  }

  async update(id: number, data: UpdateUserDto) {
    const userData = { ...data };
    
    if (data.password) {
      userData.password = await bcrypt.hash(data.password, 10);
    }
    
    return this.prisma.user.update({
      where: { id },
      data: userData,
    });
  }

  async remove(id: number) {
    return this.prisma.user.delete({
      where: { id },
    });
  }

  async updateLevelPoints(userId: number, points: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('사용자를 찾을 수 없습니다.');
    }

    let newLevel = user.level;
    let newLevelPoint = user.levelPoint + points;

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
