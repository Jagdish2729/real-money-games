import { BadRequestException, Body, Controller, Get, Inject, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "../auth/auth.guard";
import { CurrentUser } from "../auth/current-user.decorator";
import type { AuthUser } from "../auth/auth.types";
import { DepositService } from "./deposit.service";

@Controller("deposits")
@UseGuards(AuthGuard)
export class DepositController {
  constructor(@Inject(DepositService) private readonly depositService: DepositService) {}

  @Post()
  create(
    @CurrentUser() user: AuthUser,
    @Body() body: { amount?: number; utr?: string; proofUrl?: string },
  ) {
    if (typeof body.amount !== "number" || !Number.isFinite(body.amount) || body.amount <= 0) {
      throw new BadRequestException("A valid deposit amount is required");
    }

    if (!body.utr || !body.utr.trim()) {
      throw new BadRequestException("UTR is required");
    }

    return this.depositService.createDeposit(user.id, body.amount, body.utr, body.proofUrl);
  }

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.depositService.getDeposits(user.id);
  }
}
