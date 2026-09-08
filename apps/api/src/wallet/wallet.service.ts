import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { PrismaService } from "../prisma.service";

const DAILY_DEPOSIT_LIMIT = 5;
const MIN_WITHDRAWAL_RUPEES = 10;

@Injectable()
export class WalletService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async getWallet(userId: string) {
    const wallet = await this.prisma.wallet.findUnique({ where: { userId }, select: { id: true, balancePaise: true, lockedPaise: true } });
    if (!wallet) throw new BadRequestException("Wallet not found");
    const availablePaise = wallet.balancePaise - wallet.lockedPaise;
    return { id: wallet.id, balancePaise: wallet.balancePaise.toString(), lockedPaise: wallet.lockedPaise.toString(), availablePaise: availablePaise.toString() };
  }

  async getTransactions(userId: string, limit = 50) {
    const safeLimit = Math.min(Math.max(limit, 1), 100);
    const transactions = await this.prisma.walletTransaction.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: safeLimit, select: { id: true, type: true, status: true, amountPaise: true, balanceBefore: true, balanceAfter: true, referenceId: true, description: true, createdAt: true } });
    return transactions.map((transaction) => ({ ...transaction, amountPaise: transaction.amountPaise.toString(), balanceBefore: transaction.balanceBefore.toString(), balanceAfter: transaction.balanceAfter.toString() }));
  }

  async getWithdrawals(userId: string, limit = 20) {
    const safeLimit = Math.min(Math.max(limit, 1), 50);
    const withdrawals = await this.prisma.withdrawal.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: safeLimit, select: { id: true, amountPaise: true, upiId: true, status: true, rejectionReason: true, createdAt: true, reviewedAt: true } });
    return withdrawals.map((withdrawal) => ({ ...withdrawal, amountPaise: withdrawal.amountPaise.toString() }));
  }

  private getTodayRange() {
    const now = new Date();
    return { startOfDay: new Date(now.getFullYear(), now.getMonth(), now.getDate()), endOfDay: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1) };
  }

  async getDepositLimit(userId: string) {
    const { startOfDay, endOfDay } = this.getTodayRange();
    const used = await this.prisma.deposit.count({ where: { userId, createdAt: { gte: startOfDay, lt: endOfDay } } });
    return { dailyLimit: DAILY_DEPOSIT_LIMIT, usedToday: used, remainingToday: Math.max(DAILY_DEPOSIT_LIMIT - used, 0) };
  }

  async createDeposit(userId: string, amountRupees: number, utr: string, proofUrl?: string) {
    if (!Number.isSafeInteger(amountRupees) || amountRupees < 1) throw new BadRequestException("Deposit amount must be a positive whole number of rupees");
    const amountPaise = BigInt(amountRupees) * 100n;
    const { startOfDay, endOfDay } = this.getTodayRange();
    const depositsToday = await this.prisma.deposit.count({ where: { userId, createdAt: { gte: startOfDay, lt: endOfDay } } });
    if (depositsToday >= DAILY_DEPOSIT_LIMIT) throw new ConflictException(`Daily deposit limit reached. Only ${DAILY_DEPOSIT_LIMIT} deposit requests are allowed per day.`);
    const existingUtr = await this.prisma.deposit.findUnique({ where: { utr } });
    if (existingUtr) throw new ConflictException("This UTR has already been submitted");
    const deposit = await this.prisma.deposit.create({ data: { userId, amountPaise, utr, proofUrl: proofUrl || null, status: "PENDING" }, select: { id: true, amountPaise: true, utr: true, proofUrl: true, status: true, createdAt: true } });
    return { message: "Deposit submitted successfully", remainingToday: Math.max(DAILY_DEPOSIT_LIMIT - depositsToday - 1, 0), deposit: { ...deposit, amountPaise: deposit.amountPaise.toString() } };
  }

  async createWithdrawal(userId: string, amountRupees: number, upiId: string) {
    if (!Number.isSafeInteger(amountRupees) || amountRupees < MIN_WITHDRAWAL_RUPEES) throw new BadRequestException(`Minimum withdrawal is ₹${MIN_WITHDRAWAL_RUPEES}`);
    const normalizedUpi = upiId.trim().toLowerCase();
    if (normalizedUpi.length < 3 || normalizedUpi.length > 255 || !normalizedUpi.includes("@")) throw new BadRequestException("Enter a valid UPI ID");
    const amountPaise = BigInt(amountRupees) * 100n;
    return this.prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({ where: { userId } });
      if (!wallet) throw new NotFoundException("Wallet not found");
      const availablePaise = wallet.balancePaise - wallet.lockedPaise;
      if (availablePaise < amountPaise) throw new BadRequestException("Insufficient available wallet balance");

      const withdrawal = await tx.withdrawal.create({ data: { userId, amountPaise, upiId: normalizedUpi, status: "PENDING" }, select: { id: true, amountPaise: true, upiId: true, status: true, createdAt: true } });
      await tx.wallet.update({ where: { id: wallet.id }, data: { lockedPaise: wallet.lockedPaise + amountPaise } });
      await tx.walletTransaction.create({ data: { walletId: wallet.id, userId, type: "WITHDRAWAL", status: "PENDING", amountPaise, balanceBefore: wallet.balancePaise, balanceAfter: wallet.balancePaise, referenceId: `withdrawal:${withdrawal.id}`, description: `Withdrawal requested to ${normalizedUpi}` } });
      return { message: "Withdrawal request submitted successfully", withdrawal: { ...withdrawal, amountPaise: withdrawal.amountPaise.toString() }, availablePaise: (availablePaise - amountPaise).toString() };
    });
  }

  async devTopUp(userId: string, amountRupees: number) {
    if (process.env.NODE_ENV === "production") throw new BadRequestException("Development top-up is disabled in production");
    if (!Number.isSafeInteger(amountRupees) || amountRupees < 1) throw new BadRequestException("Top-up amount must be a positive whole number of rupees");
    const amountPaise = BigInt(amountRupees) * 100n;
    return this.prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({ where: { userId } });
      if (!wallet) throw new BadRequestException("Wallet not found");
      const balanceBefore = wallet.balancePaise;
      const balanceAfter = balanceBefore + amountPaise;
      const referenceId = `dev:topup:${randomUUID()}`;
      await tx.wallet.update({ where: { id: wallet.id }, data: { balancePaise: balanceAfter } });
      await tx.walletTransaction.create({ data: { walletId: wallet.id, userId, type: "DEPOSIT", status: "COMPLETED", amountPaise, balanceBefore, balanceAfter, referenceId, description: "Development test wallet top-up" } });
      return { message: "Development wallet top-up completed", amountPaise: amountPaise.toString(), balancePaise: balanceAfter.toString() };
    });
  }
}
