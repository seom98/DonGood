import { Module } from '@nestjs/common';
import { GoalsService } from './goals.service';
import { GoalsController } from './goals.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [GoalsController],
  providers: [GoalsService, PrismaService],
})
export class GoalsModule {} 