import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { randomInt, randomUUID } from "node:crypto";
import { PrismaService } from "../prisma.service";

type DicePrediction = "MORE" | "LESS" | "EQUALS";

@Injectable()
export class GameService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  private validateStake(stakeRupees: number) {
    if (!Number.isFinite(stakeRupees) || stakeRupees <= 0) throw new BadRequestException("Stake must be greater than zero");
    const stakePaise = Math.round(stakeRupees * 100);
    if (!Number.isSafeInteger(stakePaise) || stakePaise <= 0) throw new BadRequestException("Invalid stake amount");
    return BigInt(stakePaise);
  }

  async playDice(userId: string, prediction: DicePrediction, stakeRupees: number) {
    if (prediction !== "MORE" && prediction !== "LESS" && prediction !== "EQUALS") {
      throw new BadRequestException("Prediction must be MORE, LESS, or EQUALS");
    }

    const stake = this.validateStake(stakeRupees);
    const dieOne = randomInt(1, 7);
    const dieTwo = randomInt(1, 7);
    const sum = dieOne + dieTwo;
    const won = prediction === "MORE" ? sum > 7 : prediction === "LESS" ? sum < 7 : sum === 7;
    const payoutPaise = won
      ? prediction === "EQUALS" ? (stake * 55n) / 10n : (stake * 225n) / 100n
      : 0n;

    // Store prediction as 1/2/3 for compatibility with the existing integer Game model.
    // Store the two dice as a compact result: dieOne*100 + dieTwo (e.g. 406 means 4 + 6).
    const predictionValue = prediction === "MORE" ? 1 : prediction === "LESS" ? 2 : 3;
    const resultValue = dieOne * 100 + dieTwo;
    const referenceId = `game:dice:${randomUUID()}`;

    return this.settleGame(
      userId,
      "DICE",
      predictionValue,
      resultValue,
      stake,
      payoutPaise,
      won,
      referenceId,
      `Two dice prediction ${prediction}`,
      `Two dice result ${dieOne} + ${dieTwo} = ${sum}`,
    );
  }

  async playCoinToss(userId: string, prediction: "HEADS" | "TAILS", stakeRupees: number) {
    if (prediction !== "HEADS" && prediction !== "TAILS") throw new BadRequestException("Prediction must be HEADS or TAILS");
    const stake = this.validateStake(stakeRupees);
    const result = randomInt(0, 2) === 0 ? "HEADS" : "TAILS";
    const resultValue = result === "HEADS" ? 1 : 2;
    const predictionValue = prediction === "HEADS" ? 1 : 2;
    const won = result === prediction;
    const payoutPaise = won ? (stake * 19n) / 10n : 0n;
    const referenceId = `game:coin:${randomUUID()}`;
    return this.settleGame(userId, "COIN_TOSS", predictionValue, resultValue, stake, payoutPaise, won, referenceId, `Coin toss prediction ${prediction}`, `Coin toss result ${result}`);
  }

  private async settleGame(
    userId: string,
    type: "DICE" | "COIN_TOSS",
    prediction: number,
    result: number,
    stake: bigint,
    payoutPaise: bigint,
    won: boolean,
    referenceId: string,
    stakeDescription: string,
    winDescription: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({ where: { userId } });
      if (!wallet) throw new NotFoundException("Wallet not found");
      const availablePaise = wallet.balancePaise - wallet.lockedPaise;
      if (availablePaise < stake) throw new BadRequestException("Insufficient wallet balance");

      const balanceBeforeStake = wallet.balancePaise;
      const balanceAfterStake = balanceBeforeStake - stake;
      await tx.wallet.update({ where: { id: wallet.id }, data: { balancePaise: balanceAfterStake } });
      await tx.walletTransaction.create({ data: { walletId: wallet.id, userId, type: "GAME_STAKE", status: "COMPLETED", amountPaise: stake, balanceBefore: balanceBeforeStake, balanceAfter: balanceAfterStake, referenceId: `${referenceId}:stake`, description: stakeDescription } });

      let finalBalance = balanceAfterStake;
      if (won) {
        finalBalance += payoutPaise;
        await tx.wallet.update({ where: { id: wallet.id }, data: { balancePaise: finalBalance } });
        await tx.walletTransaction.create({ data: { walletId: wallet.id, userId, type: "GAME_WIN", status: "COMPLETED", amountPaise: payoutPaise, balanceBefore: balanceAfterStake, balanceAfter: finalBalance, referenceId: `${referenceId}:win`, description: winDescription } });
      }

      const game = await tx.game.create({ data: { userId, type, status: "RESOLVED", prediction, result, stakePaise: stake, payoutPaise, referenceId } });
      return { gameId: game.id, type, prediction, result, stakePaise: stake.toString(), payoutPaise: payoutPaise.toString(), won, balancePaise: finalBalance.toString() };
    });
  }

  async getHistory(userId: string, limit = 20) {
    const safeLimit = Math.min(Math.max(limit, 1), 100);
    const games = await this.prisma.game.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: safeLimit, select: { id: true, type: true, status: true, prediction: true, result: true, stakePaise: true, payoutPaise: true, createdAt: true } });
    return games.map((game) => ({ ...game, stakePaise: game.stakePaise.toString(), payoutPaise: game.payoutPaise.toString() }));
  }
}
