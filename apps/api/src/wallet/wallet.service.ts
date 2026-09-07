import { BadRequestException, ConflictException, Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";

@Injectable()
export class WalletService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async getWallet(userId: string) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
      select: { id: true, balancePaise: true, lockedPaise: true },
    });

    if (!wallet) throw new BadRequestException("Wallet not found");

    const availablePaise = wallet.balancePaise - wallet.lockedPaise;
    return {
      id: wallet.id,
      balancePaise: wallet.balancePaise.toString(),
      lockedPaise: wallet.lockedPaise.toString(),
      availablePaise: availablePaise.toString(),
    };
  }

  async getTransactions(userId: string, limit = 50) {
    const safeLimit = Math.min(Math.max(limit, 1), 100);
    const transactions = await this.prisma.walletTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: safeLimit,
      select: {
        id: true,
        type: true,
        status: true,
        amountPaise: true,
        balanceBefore: true,
        balanceAfter: true,
        referenceId: true,
        description: true,
        createdAt: true,
      },
    });

    return transactions.map((transaction) => ({
      ...transaction,
      amountPaise: transaction.amountPaise.toString(),
      balanceBefore: transaction.balanceBefore.toString(),
      balanceAfter: transaction.balanceAfter.toString(),
    }));
  }

  async createDeposit(userId: string, amountRupees: number, utr: string, proofUrl?: string) {
    if (!Number.isSafeInteger(amountRupees) || amountRupees < 1) {
      throw new BadRequestException("Deposit amount must be a positive whole number of rupees");
    }

    const amountPaise = BigInt(amountRupees) * 100n;
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    const existingToday = await this.prisma.deposit.findFirst({
      where: {
        userId,
        createdAt: { gte: startOfDay, lt: endOfDay },
      },
      select: { id: true },
    });

    if (existingToday) {
      throw new ConflictException("Only one deposit request is allowed per day");
    }

    const existingUtr = await this.prisma.deposit.findUnique({ where: { utr } });
    if (existingUtr) throw new ConflictException("This UTR has already been submitted");

    const deposit = await this.prisma.deposit.create({
      data: {
        userId,
        amountPaise,
        utr,
        proofUrl: proofUrl || null,
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

    return {
      message: "Deposit submitted successfully",
      deposit: {
        ...deposit,
        amountPaise: deposit.amountPaise.toString(),
      },
    };
  }

  async devTopUp(userId: string, amountRupees: number) {
    if (process.env.NODE_ENV === "production") {
      throw new BadRequestException("Development top-up is disabled in production");
    }

    if (!Number.isSafeInteger(amountRupees) || amountRupees < 1) {
      throw new BadRequestException("Top-up amount must be a positive whole number of rupees");
    }

    const amountPaise = BigInt(amountRupees) * 100n;

    return this.prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({ where: { userId } });
      if (!wallet) throw new BadRequestException("Wallet not found");

      const balanceBefore = wallet.balancePaise;
      const balanceAfter = balanceBefore + amountPaise;
      const referenceId = `dev:topup:${crypto.randomUUID()}`;

      await tx.wallet.update({
        where: { id: wallet.id },
        data: { balancePaise: balanceAfter },
      });

      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          userId,
          type: "DEPOSIT",
          status: "COMPLETED",
          amountPaise,
          balanceBefore,
          balanceAfter,
          referenceId,
          description: "Development test wallet top-up",
        },
      });

      return {
        message: "Development wallet top-up completed",
        amountPaise: amountPaise.toString(),
        balancePaise: balanceAfter.toString(),
      };
    });
  }
}
