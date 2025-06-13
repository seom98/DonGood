import { Module } from '@nestjs/common';
import { SpendingService } from './spending.service';
import { SpendingController } from './spending.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [SpendingController],
  providers: [SpendingService, PrismaService],
})
export class SpendingModule {} 