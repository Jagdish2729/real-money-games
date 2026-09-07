import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { randomInt, randomUUID } from "node:crypto";
import { PrismaService } from "../prisma.service";

@Injectable()
export class GameService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async playDice(userId: string, prediction: number, stakeRupees: number) {
    if (!Number.isInteger(prediction) || prediction < 1 || prediction > 6) {
      throw new BadRequestException("Prediction must be a number from 1 to 6");
    }

    if (!Number.isFinite(stakeRupees) || stakeRupees <= 0) {
      throw new BadRequestException("Stake must be greater than zero");
    }

    const stakePaise = Math.round(stakeRupees * 100);
    if (!Number.isSafeInteger(stakePaise) || stakePaise <= 0) {
      throw new BadRequestException("Invalid stake amount");
    }

    const result = randomInt(1, 7);
    const won = result === prediction;
    const payoutPaise = won ? BigInt(stakePaise * 6) : 0n;
    const referenceId = `game:dice:${randomUUID()}`;

    return this.prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({ where: { userId } });
      if (!wallet) throw new NotFoundException("Wallet not found");

      const availablePaise = wallet.balancePaise - wallet.lockedPaise;
      const stake = BigInt(stakePaise);
      if (availablePaise < stake) {
        throw new BadRequestException("Insufficient wallet balance");
      }

      const balanceBeforeStake = wallet.balancePaise;
      const balanceAfterStake = balanceBeforeStake - stake;

      await tx.wallet.update({
        where: { id: wallet.id },
        data: { balancePaise: balanceAfterStake },
      });

      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          userId,
          type: "GAME_STAKE",
          status: "COMPLETED",
          amountPaise: stake,
          balanceBefore: balanceBeforeStake,
          balanceAfter: balanceAfterStake,
          referenceId: `${referenceId}:stake`,
          description: `Dice stake - prediction ${prediction}`,
        },
      });

      let finalBalance = balanceAfterStake;

      if (won) {
        finalBalance += payoutPaise;
        await tx.wallet.update({
          where: { id: wallet.id },
          data: { balancePaise: finalBalance },
        });

        await tx.walletTransaction.create({
          data: {
            walletId: wallet.id,
            userId,
            type: "GAME_WIN",
            status: "COMPLETED",
            amountPaise: payoutPaise,
            balanceBefore: balanceAfterStake,
            balanceAfter: finalBalance,
            referenceId: `${referenceId}:win`,
            description: `Dice win - result ${result}`,
          },
        });
      }

      const game = await tx.game.create({
        data: {
          userId,
          type: "DICE",
          status: "RESOLVED",
          prediction,
          result,
          stakePaise: stake,
          payoutPaise,
          referenceId,
        },
      });

      return {
        gameId: game.id,
        prediction,
        result,
        stakePaise: stake.toString(),
        payoutPaise: payoutPaise.toString(),
        won,
        balancePaise: finalBalance.toString(),
      };
    });
  }

  async getHistory(userId: string, limit = 20) {
    const safeLimit = Math.min(Math.max(limit, 1), 100);
    const games = await this.prisma.game.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: safeLimit,
      select: {
        id: true,
        type: true,
        status: true,
        prediction: true,
        result: true,
        stakePaise: true,
        payoutPaise: true,
        createdAt: true,
      },
    });

    return games.map((game) => ({
      ...game,
      stakePaise: game.stakePaise.toString(),
      payoutPaise: game.payoutPaise.toString(),
    }));
  }
}
