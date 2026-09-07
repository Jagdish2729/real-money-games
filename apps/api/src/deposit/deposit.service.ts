import { BadRequestException, ConflictException, Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";

@Injectable()
export class DepositService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async createDeposit(userId: string, amountRupees: number, utr: string, proofUrl?: string) {
    if (!Number.isFinite(amountRupees) || amountRupees <= 0) {
      throw new BadRequestException("Deposit amount must be greater than zero");
    }

    const amountPaise = BigInt(Math.round(amountRupees * 100));
    if (amountPaise <= 0n) {
      throw new BadRequestException("Invalid deposit amount");
    }

    const normalizedUtr = utr.trim();
    if (!normalizedUtr) {
      throw new BadRequestException("UTR is required");
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const existingToday = await this.prisma.deposit.findFirst({
      where: { userId, createdAt: { gte: startOfDay } },
      select: { id: true },
    });

    if (existingToday) {
      throw new ConflictException("Only one deposit request is allowed per day");
    }

    try {
      const deposit = await this.prisma.deposit.create({
        data: {
          userId,
          amountPaise,
          utr: normalizedUtr,
          proofUrl: proofUrl?.trim() || undefined,
          status: "PENDING",
        },
        select: {
          id: true,
          amountPaise: true,
          utr: true,
          proofUrl: true,
          status: true,
          createdAt: true,
        },
      });

      return { ...deposit, amountPaise: deposit.amountPaise.toString() };
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
        throw new ConflictException("A deposit with this UTR already exists");
      }
      throw error;
    }
  }

  async getDeposits(userId: string) {
    const deposits = await this.prisma.deposit.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        amountPaise: true,
        utr: true,
        proofUrl: true,
        status: true,
        rejectionReason: true,
        reviewedAt: true,
        createdAt: true,
      },
    });

    return deposits.map((deposit) => ({
      ...deposit,
      amountPaise: deposit.amountPaise.toString(),
    }));
  }
}
