import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma.service";

@Injectable()
export class AdminService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async getDashboard() {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [pendingDeposits, pendingWithdrawals, totalUsers, gamesToday] = await Promise.all([
      this.prisma.deposit.count({ where: { status: "PENDING" } }),
      this.prisma.withdrawal.count({ where: { status: "PENDING" } }),
      this.prisma.user.count(),
      this.prisma.game.count({ where: { createdAt: { gte: startOfDay } } }),
    ]);

    return { pendingDeposits, pendingWithdrawals, totalUsers, gamesToday };
  }

  async getDeposits(status?: "PENDING" | "APPROVED" | "REJECTED") {
    const deposits = await this.prisma.deposit.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { user: { select: { phoneNumber: true } } },
    });

    return deposits.map((deposit) => ({
      id: deposit.id,
      amountPaise: deposit.amountPaise.toString(),
      utr: deposit.utr,
      proofUrl: deposit.proofUrl,
      status: deposit.status,
      rejectionReason: deposit.rejectionReason,
      createdAt: deposit.createdAt,
      reviewedAt: deposit.reviewedAt,
      phoneNumber: deposit.user.phoneNumber,
    }));
  }

  async approveDeposit(depositId: string) {
    return this.prisma.$transaction(async (tx) => {
      const deposit = await tx.deposit.findUnique({ where: { id: depositId } });
      if (!deposit) throw new NotFoundException("Deposit not found");
      if (deposit.status !== "PENDING") throw new BadRequestException("Only pending deposits can be approved");

      const wallet = await tx.wallet.findUnique({ where: { userId: deposit.userId } });
      if (!wallet) throw new NotFoundException("Wallet not found");

      const balanceBefore = wallet.balancePaise;
      const balanceAfter = balanceBefore + deposit.amountPaise;

      await tx.wallet.update({ where: { id: wallet.id }, data: { balancePaise: balanceAfter } });
      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          userId: deposit.userId,
          type: "DEPOSIT",
          status: "COMPLETED",
          amountPaise: deposit.amountPaise,
          balanceBefore,
          balanceAfter,
          referenceId: `deposit:${deposit.id}`,
          description: `Deposit approved - UTR ${deposit.utr}`,
        },
      });

      const updatedDeposit = await tx.deposit.update({
        where: { id: deposit.id },
        data: { status: "APPROVED", reviewedAt: new Date(), rejectionReason: null },
      });

      return {
        message: "Deposit approved successfully",
        deposit: { id: updatedDeposit.id, amountPaise: updatedDeposit.amountPaise.toString(), utr: updatedDeposit.utr, status: updatedDeposit.status },
        wallet: { balancePaise: balanceAfter.toString() },
      };
    });
  }

  async rejectDeposit(depositId: string, reason: string) {
    const trimmedReason = reason.trim();
    if (!trimmedReason) throw new BadRequestException("Rejection reason is required");

    const deposit = await this.prisma.deposit.findUnique({ where: { id: depositId } });
    if (!deposit) throw new NotFoundException("Deposit not found");
    if (deposit.status !== "PENDING") throw new BadRequestException("Only pending deposits can be rejected");

    const updatedDeposit = await this.prisma.deposit.update({
      where: { id: depositId },
      data: { status: "REJECTED", reviewedAt: new Date(), rejectionReason: trimmedReason },
    });

    return {
      message: "Deposit rejected successfully",
      deposit: {
        id: updatedDeposit.id,
        amountPaise: updatedDeposit.amountPaise.toString(),
        utr: updatedDeposit.utr,
        status: updatedDeposit.status,
        rejectionReason: updatedDeposit.rejectionReason,
      },
    };
  }
}
