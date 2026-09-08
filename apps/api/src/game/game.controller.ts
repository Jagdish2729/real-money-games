import { BadRequestException, Body, Controller, Get, Inject, Post, Query, UseGuards } from "@nestjs/common";
import { AuthGuard } from "../auth/auth.guard";
import { CurrentUser } from "../auth/current-user.decorator";
import type { AuthUser } from "../auth/auth.types";
import { GameService } from "./game.service";

@Controller("games")
@UseGuards(AuthGuard)
export class GameController {
  constructor(@Inject(GameService) private readonly gameService: GameService) {}

  @Post("dice/play")
  playDice(
    @CurrentUser() user: AuthUser,
    @Body() body: { prediction?: string; stakeRupees?: number },
  ) {
    if (body.prediction === undefined || body.stakeRupees === undefined) {
      throw new BadRequestException("Prediction and stake are required");
    }
    const prediction = String(body.prediction).toUpperCase();
    if (prediction !== "MORE" && prediction !== "LESS" && prediction !== "EQUALS") {
      throw new BadRequestException("Prediction must be MORE, LESS, or EQUALS");
    }
    return this.gameService.playDice(user.id, prediction, Number(body.stakeRupees));
  }

  @Post("coin-toss/play")
  playCoinToss(@CurrentUser() user: AuthUser, @Body() body: { prediction?: string; stakeRupees?: number }) {
    if (body.prediction === undefined || body.stakeRupees === undefined) {
      throw new BadRequestException("Prediction and stake are required");
    }
    const prediction = String(body.prediction).toUpperCase() as "HEADS" | "TAILS";
    return this.gameService.playCoinToss(user.id, prediction, Number(body.stakeRupees));
  }

  @Get("history")
  history(@CurrentUser() user: AuthUser, @Query("limit") limit?: string) {
    const parsedLimit = limit ? Number.parseInt(limit, 10) : 20;
    return this.gameService.getHistory(user.id, Number.isNaN(parsedLimit) ? 20 : parsedLimit);
  }
}
