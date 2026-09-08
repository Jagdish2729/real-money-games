import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma.service";

@Injectable()
export class AdminService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async getDashboard() {
    const startOfDay = new Date(); startOfDay.setHours(0, 0, 0, 0);
    const [pendingDeposits, pendingWithdrawals, totalUsers, gamesToday] = await Promise.all([
      this.prisma.deposit.count({ where: { status: "PENDING" } }),
      this.prisma.withdrawal.count({ where: { status: "PENDING" } }),
      this.prisma.user.count(), this.prisma.game.count({ where: { createdAt: { gte: startOfDay } } }),
    ]);
    return { pendingDeposits, pendingWithdrawals, totalUsers, gamesToday };
  }

  async getDeposits(status?: "PENDING" | "APPROVED" | "REJECTED") {
    const deposits = await this.prisma.deposit.findMany({ where: status ? { status } : undefined, orderBy: { createdAt: "desc" }, take: 100, include: { user: { select: { phoneNumber: true } } } });
    return deposits.map((deposit) => ({ id: deposit.id, amountPaise: deposit.amountPaise.toString(), utr: deposit.utr, proofUrl: deposit.proofUrl, status: deposit.status, rejectionReason: deposit.rejectionReason, createdAt: deposit.createdAt, reviewedAt: deposit.reviewedAt, phoneNumber: deposit.user.phoneNumber }));
  }

  async approveDeposit(depositId: string) {
    return this.prisma.$transaction(async (tx) => {
      const deposit = await tx.deposit.findUnique({ where: { id: depositId } });
      if (!deposit) throw new NotFoundException("Deposit not found"); if (deposit.status !== "PENDING") throw new BadRequestException("Only pending deposits can be approved");
      const wallet = await tx.wallet.findUnique({ where: { userId: deposit.userId } }); if (!wallet) throw new NotFoundException("Wallet not found");
      const balanceBefore = wallet.balancePaise; const balanceAfter = balanceBefore + deposit.amountPaise;
      await tx.wallet.update({ where: { id: wallet.id }, data: { balancePaise: balanceAfter } });
      await tx.walletTransaction.create({ data: { walletId: wallet.id, userId: deposit.userId, type: "DEPOSIT", status: "COMPLETED", amountPaise: deposit.amountPaise, balanceBefore, balanceAfter, referenceId: `deposit:${deposit.id}`, description: `Deposit approved - UTR ${deposit.utr}` } });
      const updated = await tx.deposit.update({ where: { id: deposit.id }, data: { status: "APPROVED", reviewedAt: new Date(), rejectionReason: null } });
      return { message: "Deposit approved successfully", deposit: { id: updated.id, amountPaise: updated.amountPaise.toString(), utr: updated.utr, status: updated.status }, wallet: { balancePaise: balanceAfter.toString() } };
    });
  }

  async rejectDeposit(depositId: string, reason: string) {
    const trimmedReason = reason.trim(); if (!trimmedReason) throw new BadRequestException("Rejection reason is required");
    const deposit = await this.prisma.deposit.findUnique({ where: { id: depositId } });
    if (!deposit) throw new NotFoundException("Deposit not found"); if (deposit.status !== "PENDING") throw new BadRequestException("Only pending deposits can be rejected");
    const updated = await this.prisma.deposit.update({ where: { id: depositId }, data: { status: "REJECTED", reviewedAt: new Date(), rejectionReason: trimmedReason } });
    return { message: "Deposit rejected successfully", deposit: { id: updated.id, amountPaise: updated.amountPaise.toString(), utr: updated.utr, status: updated.status, rejectionReason: updated.rejectionReason } };
  }

  async getWithdrawals(status?: "PENDING" | "PROCESSING" | "PAID" | "REJECTED") {
    const withdrawals = await this.prisma.withdrawal.findMany({ where: status ? { status } : undefined, orderBy: { createdAt: "desc" }, take: 100, include: { user: { select: { phoneNumber: true, name: true } } } });
    return withdrawals.map((w) => ({ id: w.id, amountPaise: w.amountPaise.toString(), upiId: w.upiId, status: w.status, rejectionReason: w.rejectionReason, createdAt: w.createdAt, reviewedAt: w.reviewedAt, phoneNumber: w.user.phoneNumber, name: w.user.name }));
  }

  async approveWithdrawal(withdrawalId: string) {
    return this.prisma.$transaction(async (tx) => {
      const withdrawal = await tx.withdrawal.findUnique({ where: { id: withdrawalId } });
      if (!withdrawal) throw new NotFoundException("Withdrawal not found"); if (withdrawal.status !== "PENDING") throw new BadRequestException("Only pending withdrawals can be approved");
      const wallet = await tx.wallet.findUnique({ where: { userId: withdrawal.userId } });
      if (!wallet || wallet.lockedPaise < withdrawal.amountPaise || wallet.withdrawablePaise < withdrawal.amountPaise) throw new BadRequestException("Withdrawal funds are not locked correctly");
      const ledger = await tx.walletTransaction.findUnique({ where: { referenceId: `withdrawal:${withdrawal.id}` } });
      if (!ledger || ledger.status !== "PENDING") throw new BadRequestException("Withdrawal ledger entry not found or already processed");
      const balanceBefore = wallet.balancePaise;
      const balanceAfter = balanceBefore - withdrawal.amountPaise;
      if (balanceAfter < 0n) throw new BadRequestException("Insufficient wallet balance");
      await tx.wallet.update({ where: { id: wallet.id }, data: { balancePaise: balanceAfter, lockedPaise: wallet.lockedPaise - withdrawal.amountPaise, withdrawablePaise: wallet.withdrawablePaise - withdrawal.amountPaise } });
      await tx.walletTransaction.update({ where: { id: ledger.id }, data: { status: "COMPLETED", balanceBefore, balanceAfter, description: `Withdrawal paid to ${withdrawal.upiId}` } });
      const updated = await tx.withdrawal.update({ where: { id: withdrawal.id }, data: { status: "PAID", reviewedAt: new Date(), rejectionReason: null } });
      return { message: "Withdrawal marked as paid", withdrawal: { id: updated.id, amountPaise: updated.amountPaise.toString(), upiId: updated.upiId, status: updated.status } };
    });
  }

  async rejectWithdrawal(withdrawalId: string, reason: string) {
    const trimmedReason = reason.trim(); if (!trimmedReason) throw new BadRequestException("Rejection reason is required");
    return this.prisma.$transaction(async (tx) => {
      const withdrawal = await tx.withdrawal.findUnique({ where: { id: withdrawalId } });
      if (!withdrawal) throw new NotFoundException("Withdrawal not found"); if (withdrawal.status !== "PENDING") throw new BadRequestException("Only pending withdrawals can be rejected");
      const wallet = await tx.wallet.findUnique({ where: { userId: withdrawal.userId } });
      if (!wallet || wallet.lockedPaise < withdrawal.amountPaise) throw new BadRequestException("Withdrawal funds are not locked correctly");
      const ledger = await tx.walletTransaction.findUnique({ where: { referenceId: `withdrawal:${withdrawal.id}` } });
      if (!ledger || ledger.status !== "PENDING") throw new BadRequestException("Withdrawal ledger entry not found or already processed");
      await tx.wallet.update({ where: { id: wallet.id }, data: { lockedPaise: wallet.lockedPaise - withdrawal.amountPaise } });
      await tx.walletTransaction.update({ where: { id: ledger.id }, data: { status: "REJECTED", description: `Withdrawal rejected: ${trimmedReason}` } });
      const updated = await tx.withdrawal.update({ where: { id: withdrawal.id }, data: { status: "REJECTED", reviewedAt: new Date(), rejectionReason: trimmedReason } });
      return { message: "Withdrawal rejected and funds returned to available balance", withdrawal: { id: updated.id, amountPaise: updated.amountPaise.toString(), upiId: updated.upiId, status: updated.status, rejectionReason: updated.rejectionReason } };
    });
  }
}
