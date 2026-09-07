import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";

@Injectable()
export class WalletService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async getWallet(userId: string) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
      select: { id: true, balancePaise: true, lockedPaise: true },
    });

    if (!wallet) {
      throw new BadRequestException("Wallet not found");
    }

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
}
